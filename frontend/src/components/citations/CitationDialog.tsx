import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, CircularProgress
} from '@mui/material';
import { Project } from '../projects/ProjectSection';

interface CitationDialogProps {
  open: boolean;
  onClose: () => void;
  citation: {
    id?: number;
    title: string;
    authors: string;
    publication: string;
    year: number | string;
    url?: string;
    doi?: string;
    project_id: number;
  } | null;
  projects: Project[];
  onSave: (citationData: any) => void;
}

const CitationDialog: React.FC<CitationDialogProps> = ({
  open,
  onClose,
  citation,
  projects,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [publication, setPublication] = useState('');
  const [year, setYear] = useState<number | string>('');
  const [url, setUrl] = useState('');
  const [doi, setDoi] = useState('');
  const [projectId, setProjectId] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (citation) {
      setTitle(citation.title || '');
      setAuthors(citation.authors || '');
      setPublication(citation.publication || '');
      setYear(citation.year || '');
      setUrl(citation.url || '');
      setDoi(citation.doi || '');
      setProjectId(citation.project_id);
    } else {
      setTitle('');
      setAuthors('');
      setPublication('');
      setYear('');
      setUrl('');
      setDoi('');
      setProjectId(projects[0]?.id || 0);
    }
  }, [citation, projects]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!authors.trim()) {
      setError('Authors are required');
      return;
    }

    if (!projectId) {
      setError('Please select a project');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const citationData = {
        title: title,
        authors: authors,
        publication: publication,
        year: typeof year === 'number' ? year : parseInt(year as string || '0'),
        url: url || '',
        doi: doi || '',
        project_id: projectId
      };
      
      await onSave(citationData);
      handleClose();
    } catch (err) {
      console.error('Error saving citation:', err);
      setError('Failed to save citation');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setAuthors('');
    setPublication('');
    setYear('');
    setUrl('');
    setDoi('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{citation?.id ? 'Edit Citation' : 'New Citation'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Title"
          fullWidth
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          error={!title.trim()}
          helperText={!title.trim() ? 'Title is required' : ''}
          sx={{ mb: 2 }}
        />
        
        <TextField
          margin="dense"
          label="Authors"
          fullWidth
          variant="outlined"
          value={authors}
          onChange={(e) => setAuthors(e.target.value)}
          required
          error={!authors.trim()}
          helperText={!authors.trim() ? 'Authors are required' : ''}
          sx={{ mb: 2 }}
        />
        
        <TextField
          margin="dense"
          label="Publication"
          fullWidth
          variant="outlined"
          value={publication}
          onChange={(e) => setPublication(e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <TextField
          margin="dense"
          label="Year"
          variant="outlined"
          value={year}
          onChange={(e) => {
            const value = e.target.value;
            if (!value || /^\d+$/.test(value)) {
              setYear(value === '' ? '' : Number(value));
            }
          }}
          sx={{ mb: 2, width: '100%' }}
        />
        
        <TextField
          margin="dense"
          label="URL"
          fullWidth
          variant="outlined"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <TextField
          margin="dense"
          label="DOI"
          fullWidth
          variant="outlined"
          value={doi}
          onChange={(e) => setDoi(e.target.value)}
        />
        
        {error && (
          <p style={{ color: 'red' }}>{error}</p>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          disabled={!title.trim() || !authors.trim() || !projectId || loading}
        >
          {loading ? <CircularProgress size={24} /> : citation?.id ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CitationDialog;