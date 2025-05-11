import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import ProjectForm from './ProjectForm';
import ProjectList from './ProjectList';
import api from '../../services/api';

export interface Project {
  id: number;
  name: string;
  created_at: string;
}

function ProjectSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load projects on component mount
  useEffect(() => {
    fetchProjects();
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

  const handleProjectCreated = (newProject: Project) => {
    setProjects([newProject, ...projects]);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Projects</Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Create New Project</Typography>
        <ProjectForm onProjectCreated={handleProjectCreated} />
      </Paper>

      <Divider sx={{ my: 4 }} />
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Your Projects</Typography>
        <ProjectList 
          projects={projects} 
          loading={loading} 
          error={error} 
          onRefresh={fetchProjects} 
        />
      </Paper>
    </Box>
  );
}

export default ProjectSection;