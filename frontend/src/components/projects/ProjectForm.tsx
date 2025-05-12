import { useState } from 'react';
import { TextField, Button, Box, Alert, CircularProgress } from '@mui/material';
import api from '../../services/api';
import { Project } from './ProjectSection';

interface ProjectFormProps {
  onProjectCreated: (project: Project) => void;
}

function ProjectForm({ onProjectCreated }: ProjectFormProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a project name');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Call the API to create a new project
      const newProject = await api.projects.create({name});
      
      // Update UI
      onProjectCreated(newProject);
      setSuccess(true);
      setName('');
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to create project');
      console.error('Error creating project:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Project created successfully</Alert>}
      
      <TextField
        label="Project Name"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
        margin="normal"
        required
        disabled={loading}
      />
      
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Create Project'}
      </Button>
    </Box>
  );
}

export default ProjectForm;