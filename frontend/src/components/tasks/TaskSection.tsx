import { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, CircularProgress, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Snackbar, Alert
} from '@mui/material';
import api from '../../services/api';
import TaskList from './TaskList';
import { Project } from '../projects/ProjectSection';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  due_date?: string;
  project_id: number;
  created_at: string;
}

function TaskSection() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskStatus, setTaskStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');
  const [taskDueDate, setTaskDueDate] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [tasksData, projectsData] = await Promise.all([
        api.tasks.getAll(),
        api.projects.getAll()
      ]);
      
      // Make sure task status is one of the allowed values and transform null to undefined
      const validTasks = tasksData.map(task => ({
        ...task,
        status: validateTaskStatus(task.status),
        // Convert null due_date to undefined to match the Task interface
        due_date: task.due_date === null ? undefined : task.due_date
      }));
      
      setTasks(validTasks);
      setProjects(projectsData);
      
      if (projectsData.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projectsData[0].id);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to validate task status
  const validateTaskStatus = (status: string): 'pending' | 'in-progress' | 'completed' => {
    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (validStatuses.includes(status)) {
      return status as 'pending' | 'in-progress' | 'completed';
    }
    // Default to 'pending' if the status is not valid
    console.warn(`Invalid task status "${status}" - defaulting to "pending"`);
    return 'pending';
  };

  const handleOpenDialog = (task: Task | null = null) => {
    setCurrentTask(task);
    
    if (task) {
      setTaskTitle(task.title);
      setTaskDescription(task.description || '');
      setTaskStatus(task.status);
      setTaskDueDate(task.due_date || '');
      setSelectedProjectId(task.project_id);
    } else {
      setTaskTitle('');
      setTaskDescription('');
      setTaskStatus('pending');
      setTaskDueDate('');
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentTask(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskStatus('pending');
    setTaskDueDate('');
    setError(null);
  };

  const handleSaveTask = async () => {
    if (!taskTitle.trim()) {
      setError('Task title is required');
      return;
    }

    if (!selectedProjectId) {
      setError('Please select a project');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const taskData = {
        title: taskTitle,
        description: taskDescription || undefined,
        status: taskStatus,
        due_date: taskDueDate || undefined,
        project_id: selectedProjectId
      };
      
      if (currentTask) {
        // Get raw response from API
        const rawUpdatedTask = await api.tasks.update(currentTask.id, taskData);
        
        // Transform the response to match your interface
        const updatedTask: Task = {
          ...rawUpdatedTask,
          status: validateTaskStatus(rawUpdatedTask.status),
          due_date: rawUpdatedTask.due_date === null ? undefined : rawUpdatedTask.due_date
        };
        
        setTasks(tasks.map(t => 
          t.id === updatedTask.id ? updatedTask : t
        ));
        setSuccessMessage('Task updated successfully');
      } else {
        // Get raw response from API
        const rawNewTask = await api.tasks.create(taskData);
        
        // Transform the response to match your interface
        const newTask: Task = {
          ...rawNewTask,
          status: validateTaskStatus(rawNewTask.status),
          due_date: rawNewTask.due_date === null ? undefined : rawNewTask.due_date
        };
        
        setTasks([...tasks, newTask]);
        setSuccessMessage('Task created successfully');
      }
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving task:', err);
      setError('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (taskId: number) => {
    const taskToEdit = tasks.find(task => task.id === taskId);
    if (taskToEdit) {
      handleOpenDialog(taskToEdit);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await api.tasks.delete(taskId);
        setTasks(tasks.filter(task => task.id !== taskId));
        setSuccessMessage('Task deleted successfully');
      } catch (err) {
        console.error('Error deleting task:', err);
        setError('Failed to delete task');
      }
    }
  };

  const handleStatusUpdate = async (taskId: number, newStatus: 'pending' | 'in-progress' | 'completed') => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      // Get the updated task from the API
      const rawUpdatedTask = await api.tasks.update(taskId, { status: newStatus });
      
      // Transform the response to match your interface, just like in handleSaveTask
      const updatedTask: Task = {
        ...rawUpdatedTask,
        status: validateTaskStatus(rawUpdatedTask.status),
        due_date: rawUpdatedTask.due_date === null ? undefined : rawUpdatedTask.due_date
      };
      
      // Use the returned task data
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
      
      setSuccessMessage(`Task status updated to ${newStatus}`);
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Tasks</Typography>
        <Button 
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
          disabled={projects.length === 0}
        >
          New Task
        </Button>
      </Box>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      {projects.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please create a project first before adding tasks.
        </Alert>
      )}
      
      {loading && tasks.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TaskList 
          tasks={tasks} 
          loading={loading} 
          error={error}
          onStatusUpdate={handleStatusUpdate}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
        />
      )}
      
      {/* Task Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentTask ? 'Edit Task' : 'New Task'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            fullWidth
            variant="outlined"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            required
            error={!taskTitle.trim()}
            helperText={!taskTitle.trim() ? 'Task title is required' : ''}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl sx={{ width: '50%' }}>
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                value={taskStatus}
                label="Status"
                onChange={(e) => setTaskStatus(e.target.value as 'pending' | 'in-progress' | 'completed')}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl sx={{ width: '50%' }}>
              <InputLabel id="project-select-label">Project</InputLabel>
              <Select
                labelId="project-select-label"
                value={selectedProjectId}
                label="Project"
                onChange={(e) => setSelectedProjectId(e.target.value as number)}
                required
              >
                {projects.map(project => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={taskDueDate}
            onChange={(e) => setTaskDueDate(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            variant="outlined"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveTask} 
            variant="contained" 
            color="primary"
            disabled={!taskTitle.trim() || !selectedProjectId || loading}
          >
            {loading ? <CircularProgress size={24} /> : currentTask ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success message snackbar */}
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={3000} 
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default TaskSection;