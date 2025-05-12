import { useState } from 'react';
import { 
  TextField, Button, Box, Alert, CircularProgress, 
  FormControl, InputLabel, Select, MenuItem, SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Project } from '../projects/ProjectSection';
import { Task } from './TaskSection';

interface TaskFormProps {
  projects: Project[];
  onTaskCreated: (task: Task) => void;
}

function TaskForm({ projects, onTaskCreated }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [projectId, setProjectId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }

    if (!projectId) {
      setError('Please select a project');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // This would call the API when the endpoint is available
      // For now, create a mock response
      const newTask: Task = {
        id: Date.now(), // Temporary ID
        title,
        due_date: dueDate ? dueDate.toISOString() : undefined, // Use undefined instead of null
        status: 'pending',
        project_id: projectId as number,
        created_at: new Date().toISOString()
      };
      
      // Update UI
      onTaskCreated(newTask);
      setSuccess(true);
      resetForm();
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to create task');
      console.error('Error creating task:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDueDate(null);
    setProjectId('');
  };

  const handleProjectChange = (event: SelectChangeEvent<typeof projectId>) => {
    setProjectId(event.target.value as number);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Task created successfully</Alert>}
      
      <TextField
        label="Title"
        fullWidth
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        margin="normal"
        required
        disabled={loading}
      />
      
      <FormControl fullWidth margin="normal">
        <InputLabel id="project-select-label">Project</InputLabel>
        <Select
          labelId="project-select-label"
          value={projectId}
          onChange={handleProjectChange}
          label="Project"
          disabled={loading || projects.length === 0}
        >
          {projects.map((project) => (
            <MenuItem key={project.id} value={project.id}>
              {project.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Due Date"
          value={dueDate}
          onChange={(newValue) => setDueDate(newValue)}
          slotProps={{
            textField: { 
              fullWidth: true,
              margin: "normal",
              disabled: loading
            }
          }}
        />
      </LocalizationProvider>
      
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Create Task'}
      </Button>
    </Box>
  );
}

export default TaskForm;