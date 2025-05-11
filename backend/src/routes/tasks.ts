import express from 'express';
import db from '../models/database';
import { validateProjectExists } from '../utils/validators';

const router = express.Router();

/**
 * GET /api/tasks
 * Retrieves all tasks from the database, ordered by due_date and creation date
 */
router.get('/', (req, res) => {
  db.all(
    'SELECT * FROM tasks ORDER BY due_date ASC, created_at DESC', 
    (err, tasks) => {
      if (err) {
        console.error('Error fetching tasks:', err);
        return res.status(500).json({ error: 'Failed to fetch tasks' });
      }
      
      res.json(tasks);
    }
  );
});

/**
 * POST /api/tasks
 * Creates a new task in the database
 * Body should contain:
 * - title: string (required)
 * - due_date: string (optional, ISO format date)
 * - status: string (optional, defaults to 'pending')
 * - project_id: number (required)
 */
router.post('/', (req, res) => {
  const { title, due_date, status = 'pending', project_id } = req.body;
  
  // Validate required fields
  if (!title || !project_id) {
    return res.status(400).json({ error: 'Title and project_id are required' });
  }
  
  // Check if the project exists
  validateProjectExists(project_id, (err, exists) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!exists) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Insert the new task
    db.run(
      'INSERT INTO tasks (title, due_date, status, project_id) VALUES (?, ?, ?, ?)',
      [title, due_date || null, status, project_id],
      function(err) {
        if (err) {
          console.error('Error creating task:', err);
          return res.status(500).json({ error: 'Failed to create task' });
        }
        
        const taskId = this.lastID;
        
        // Fetch the inserted task to return to client
        db.get('SELECT * FROM tasks WHERE id = ?', [taskId], (err, task) => {
          if (err) {
            console.error('Error fetching new task:', err);
            return res.status(500).json({ error: 'Task created but failed to retrieve' });
          }
          
          res.status(201).json(task);
        });
      }
    );
  });
});

/**
 * PATCH /api/tasks/:id/status
 * Updates the status of a task
 * Body should contain:
 * - status: string (required: 'pending', 'in-progress', or 'completed')
 */
router.patch('/:id/status', (req, res) => {
  const taskId = req.params.id;
  const { status } = req.body;
  
  // Validate the status
  const validStatuses = ['pending', 'in-progress', 'completed'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Valid status is required (pending, in-progress, or completed)' 
    });
  }
  
  // Update the task status
  db.run(
    'UPDATE tasks SET status = ? WHERE id = ?',
    [status, taskId],
    function(err) {
      if (err) {
        console.error('Error updating task status:', err);
        return res.status(500).json({ error: 'Failed to update task status' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      // Fetch the updated task to return to client
      db.get('SELECT * FROM tasks WHERE id = ?', [taskId], (err, task) => {
        if (err) {
          console.error('Error fetching updated task:', err);
          return res.status(500).json({ error: 'Status updated but failed to retrieve task' });
        }
        
        res.json(task);
      });
    }
  );
});

export default router;