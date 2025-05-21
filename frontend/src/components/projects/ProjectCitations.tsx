import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, CircularProgress, List, ListItem, ListItemText, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import ArxivSearch from '../citations/ArxivSearch';

interface Citation {
  id: number;
  title: string;
  url: string;
  file_path: string;
  annotations: any[];
  project_id: number;
  created_at: string;
}

interface ProjectCitationsProps {
  projectId: number;
  projectName: string;
}

const ProjectCitations: React.FC<ProjectCitationsProps> = ({ projectId, projectName }) => {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAddForm, setOpenAddForm] = useState(false);
  const [newCitationTitle, setNewCitationTitle] = useState('');
  const [newCitationUrl, setNewCitationUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchCitations();
  }, [projectId]);

  const fetchCitations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/citations');
      // Filter for this project's citations
      const projectCitations = response.data.filter(
        (citation: Citation) => citation.project_id === projectId
      );
      setCitations(projectCitations);
    } catch (err) {
      console.error('Error fetching citations:', err);
      setError('Failed to load citations');
    } finally {
      setLoading(false);
    }
  };

  const handleCitationAdded = () => {
    // Refresh the citations list
    fetchCitations();
  };

  const handleAddCitation = () => {
    setOpenAddForm(true);
  };

  const handleCloseForm = () => {
    setOpenAddForm(false);
    setNewCitationTitle('');
    setNewCitationUrl('');
    setFormError(null);
  };

  const handleSubmitCitation = async () => {
    if (!newCitationTitle.trim() || !newCitationUrl.trim()) {
      setFormError('Title and URL are required');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await axios.post('/api/citations', {
        title: newCitationTitle,
        url: newCitationUrl,
        project_id: projectId
      });
      
      handleCloseForm();
      handleCitationAdded();
    } catch (err) {
      console.error('Error adding citation:', err);
      setFormError('Failed to add citation. Please check the URL and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Citations for {projectName}</Typography>
        <Box>
          <ArxivSearch
            projects={[{id: projectId, name: projectName, created_at: ''}]}
            onPaperAdded={handleCitationAdded}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddCitation}
            sx={{ ml: 2 }}
          >
            Add Citation
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">
          {error}
        </Typography>
      ) : citations.length > 0 ? (
        <Paper variant="outlined">
          <List>
            {citations.map((citation, index) => (
              <React.Fragment key={citation.id}>
                <ListItem>
                  <ListItemText
                    primary={citation.title}
                    secondary={`Added on: ${formatDate(citation.created_at)}`}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    component="a"
                    href={`/api/citations/pdf/${citation.id}`}
                    target="_blank"
                  >
                    View PDF
                  </Button>
                </ListItem>
                {index < citations.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      ) : (
        <Typography align="center" color="text.secondary">
          No citations yet. Add your first citation to this project.
        </Typography>
      )}

      <Dialog open={openAddForm} onClose={handleCloseForm}>
        <DialogTitle>Add Citation</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1, minWidth: '400px' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Citation Title"
              name="title"
              autoFocus
              value={newCitationTitle}
              onChange={(e) => setNewCitationTitle(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="url"
              label="PDF URL"
              name="url"
              placeholder="https://example.com/paper.pdf"
              value={newCitationUrl}
              onChange={(e) => setNewCitationUrl(e.target.value)}
            />
            {formError && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {formError}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button 
            onClick={handleSubmitCitation} 
            disabled={submitting}
            variant="contained"
          >
            {submitting ? 'Adding...' : 'Add Citation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectCitations;