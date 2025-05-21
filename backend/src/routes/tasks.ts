import express from 'express';
import db from '../models/database';

const router = express.Router();

// Type for tasks
interface Task {
  id: number;
  title: string;
  due_date: string | null;
  status: string;
  project_id: number;
  created_at: string;
}

/**
 * GET /api/tasks
 * Retrieves all tasks from the database, ordered by due_date and creation date
 */
router.get('/', async (req, res) => {
  try {
    const tasks = await db.all<Task>('SELECT * FROM tasks ORDER BY due_date ASC, created_at DESC');
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
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
router.post('/', async (req, res) => {
  try {
    const { title, due_date, status = 'pending', project_id } = req.body;
    
    // Validate required fields
    if (!title || !project_id) {
      return res.status(400).json({ error: 'Title and project_id are required' });
    }
    
    // Check if the project exists
    const projectExists = await validateProjectExists(project_id);
    if (!projectExists) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Insert the new task
    const result = await db.run(
      'INSERT INTO tasks (title, due_date, status, project_id) VALUES (?, ?, ?, ?)',
      [title, due_date || null, status, project_id]
    );
    
    const taskId = result.lastID;
    
    // Fetch the inserted task to return to client
    const task = await db.get<Task>('SELECT * FROM tasks WHERE id = ?', [taskId]);
    
    if (!task) {
      return res.status(500).json({ error: 'Task created but failed to retrieve' });
    }
    
    res.status(201).json(task);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

/**
 * PATCH /api/tasks/:id/status
 * Updates the status of a task
 * Body should contain:
 * - status: string (required: 'pending', 'in-progress', or 'completed')
 */
router.patch('/:id/status', async (req, res) => {
  try {
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
    const result = await db.run(
      'UPDATE tasks SET status = ? WHERE id = ?',
      [status, taskId]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Fetch the updated task to return to client
    const task = await db.get<Task>('SELECT * FROM tasks WHERE id = ?', [taskId]);
    
    if (!task) {
      return res.status(500).json({ error: 'Status updated but failed to retrieve task' });
    }
    
    res.json(task);
  } catch (err) {
    console.error('Error updating task status:', err);
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

/**
 * PUT /api/tasks/:id
 * Updates a task with all provided fields
 * Body can contain:
 * - title: string (optional)
 * - description: string (optional)
 * - due_date: string (optional, ISO format date)
 * - status: string (optional)
 * - project_id: number (optional)
 */
router.put('/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const { title, description, due_date, status, project_id } = req.body;
    
    // Verify task exists first
    const existingTask = await db.get('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // If project_id is being updated, validate it exists
    if (project_id && project_id !== existingTask.project_id) {
      const projectExists = await validateProjectExists(project_id);
      if (!projectExists) {
        return res.status(404).json({ error: 'Project not found' });
      }
    }
    
    // Build the SQL update based on provided fields
    const updates = [];
    const params = [];
    
    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    
    if (due_date !== undefined) {
      updates.push('due_date = ?');
      params.push(due_date || null);
    }
    
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    
    if (project_id !== undefined) {
      updates.push('project_id = ?');
      params.push(project_id);
    }
    
    // If there's nothing to update, return the existing task
    if (updates.length === 0) {
      return res.json(existingTask);
    }
    
    // Add taskId as the last parameter
    params.push(taskId);
    
    // Execute the update
    await db.run(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    
    // Fetch and return the updated task
    const updatedTask = await db.get<Task>('SELECT * FROM tasks WHERE id = ?', [taskId]);
    
    if (!updatedTask) {
      return res.status(500).json({ error: 'Task updated but failed to retrieve' });
    }
    
    res.json(updatedTask);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

/**
 * DELETE /api/tasks/:id
 * Deletes a task by ID
 */
router.delete('/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    
    const result = await db.run('DELETE FROM tasks WHERE id = ?', [taskId]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

/**
 * Helper function to validate project existence
 * Returns a Promise that resolves to a boolean
 */
async function validateProjectExists(projectId: number): Promise<boolean> {
  try {
    const project = await db.get('SELECT id FROM projects WHERE id = ?', [projectId]);
    return !!project;
  } catch (error) {
    console.error('Error checking if project exists:', error);
    throw error; // Re-throw to be handled by the route handler
  }
}

export default router;