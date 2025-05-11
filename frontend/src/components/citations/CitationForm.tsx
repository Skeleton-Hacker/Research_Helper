import { useState } from 'react';
import { 
  TextField, Button, Box, Alert, CircularProgress, 
  FormControl, InputLabel, Select, MenuItem, SelectChangeEvent
} from '@mui/material';
import { Project } from '../projects/ProjectSection';
import { Citation } from './CitationSection';

interface CitationFormProps {
  projects: Project[];
  onCitationCreated: (citation: Citation) => void;
}

function CitationForm({ projects, onCitationCreated }: CitationFormProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [projectId, setProjectId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a citation title');
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
      const newCitation: Citation = {
        id: Date.now(), // Temporary ID
        title,
        url,
        file_path: `projects/${projectId}/papers/${title.toLowerCase().replace(/\s+/g, '_')}.pdf`,
        annotations: [],
        project_id: projectId as number,
        created_at: new Date().toISOString()
      };
      
      // Update UI
      onCitationCreated(newCitation);
      setSuccess(true);
      resetForm();
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to create citation');
      console.error('Error creating citation:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setProjectId('');
  };

  const handleProjectChange = (event: SelectChangeEvent<typeof projectId>) => {
    setProjectId(event.target.value as number);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Citation added successfully</Alert>}
      
      <TextField
        label="Title"
        fullWidth
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        margin="normal"
        required
        disabled={loading}
      />
      
      <TextField
        label="URL"
        fullWidth
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        margin="normal"
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
      
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Add Citation'}
      </Button>
    </Box>
  );
}

export default CitationForm;