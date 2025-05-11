import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import api from '../../services/api';
import { Project } from '../projects/ProjectSection';

export interface Task {
  id: number;
  title: string;
  due_date: string | null;
  status: 'pending' | 'in-progress' | 'completed';
  project_id: number;
  created_at: string;
}

function TaskSection() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load projects on component mount
  useEffect(() => {
    fetchProjects();
    fetchTasks(); // Mock implementation until API endpoint is available
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await api.projects.getAll();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError('Failed to load projects');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  // Placeholder for tasks fetch (to be implemented when API endpoint is available)
  const fetchTasks = async () => {
    // Mock data for UI development
    setTasks([
      {
        id: 1,
        title: 'Review literature on machine learning',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        project_id: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Write introduction section',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'in-progress',
        project_id: 1,
        created_at: new Date().toISOString()
      }
    ]);
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks([newTask, ...tasks]);
  };
  
  const handleTaskStatusUpdate = (taskId: number, newStatus: 'pending' | 'in-progress' | 'completed') => {
    setTasks(tasks.map(task => 
      task.id === taskId ? {...task, status: newStatus} : task
    ));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Tasks</Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Create New Task</Typography>
        <TaskForm 
          projects={projects} 
          onTaskCreated={handleTaskCreated} 
        />
      </Paper>

      <Divider sx={{ my: 4 }} />
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Your Tasks</Typography>
        <TaskList 
          tasks={tasks} 
          loading={loading} 
          error={error}
          onStatusUpdate={handleTaskStatusUpdate} 
        />
      </Paper>
    </Box>
  );
}

export default TaskSection;