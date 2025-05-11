import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import CitationForm from './CitationForm';
import CitationList from './CitationList';
import api from '../../services/api';
import { Project } from '../projects/ProjectSection';

export interface Citation {
  id: number;
  title: string;
  url: string;
  file_path: string;
  annotations: any[];
  project_id: number;
  created_at: string;
}

function CitationSection() {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load projects on component mount
  useEffect(() => {
    fetchProjects();
    fetchCitations(); // This would be implemented when the citations API endpoint is available
    // In a real implementation, you would also fetch citations here
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

  // Placeholder for citation fetch (to be implemented when API endpoint is available)
  const fetchCitations = async () => {
    // Mock data for UI development
    setCitations([
      {
        id: 1,
        title: 'Sample Paper',
        url: 'https://arxiv.org/abs/1234.5678',
        file_path: 'projects/1/papers/sample_paper.pdf',
        annotations: [],
        project_id: 1,
        created_at: new Date().toISOString()
      }
    ]);
  };

  const handleCitationCreated = (newCitation: Citation) => {
    setCitations([newCitation, ...citations]);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Citations</Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Add New Citation</Typography>
        <CitationForm 
          projects={projects} 
          onCitationCreated={handleCitationCreated} 
        />
      </Paper>

      <Divider sx={{ my: 4 }} />
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Your Citations</Typography>
        <CitationList 
          citations={citations} 
          loading={loading} 
          error={error}
        />
      </Paper>
    </Box>
  );
}

export default CitationSection;