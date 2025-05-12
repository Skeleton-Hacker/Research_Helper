import { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, CircularProgress, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Snackbar, Alert
} from '@mui/material';
import api from '../../services/api';
import CitationList from './CitationList';
import { Project } from '../projects/ProjectSection';

export interface Citation {
  id: number;
  title: string;
  authors: string;
  publication: string;
  year: number;
  url?: string;
  doi?: string;
  project_id: number;
  created_at: string;
}

function CitationSection() {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCitation, setCurrentCitation] = useState<Citation | null>(null);
  const [citationTitle, setCitationTitle] = useState('');
  const [citationAuthors, setCitationAuthors] = useState('');
  const [citationPublication, setCitationPublication] = useState('');
  const [citationYear, setCitationYear] = useState<number | ''>('');
  const [citationUrl, setCitationUrl] = useState('');
  const [citationDoi, setCitationDoi] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [citationsData, projectsData] = await Promise.all([
        api.citations.getAll(),
        api.projects.getAll()
      ]);
      
      // Transform API response to match Citation interface
      const transformedCitations = citationsData.map(citation => ({
        id: citation.id,
        title: citation.title || 'Untitled Citation',
        authors: citation.authors || '',
        publication: citation.publication || '',
        year: citation.year || 0,
        url: citation.url,
        doi: citation.doi,
        project_id: citation.project_id,
        created_at: citation.created_at
      }));
      
      setCitations(transformedCitations);
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

  const handleOpenDialog = (citation: Citation | null = null) => {
    setCurrentCitation(citation);
    
    if (citation) {
      setCitationTitle(citation.title);
      setCitationAuthors(citation.authors);
      setCitationPublication(citation.publication);
      setCitationYear(citation.year);
      setCitationUrl(citation.url || '');
      setCitationDoi(citation.doi || '');
      setSelectedProjectId(citation.project_id);
    } else {
      setCitationTitle('');
      setCitationAuthors('');
      setCitationPublication('');
      setCitationYear('');
      setCitationUrl('');
      setCitationDoi('');
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentCitation(null);
    setCitationTitle('');
    setCitationAuthors('');
    setCitationPublication('');
    setCitationYear('');
    setCitationUrl('');
    setCitationDoi('');
    setError(null);
  };

  const handleSaveCitation = async () => {
    if (!citationTitle.trim()) {
      setError('Citation title is required');
      return;
    }

    if (!citationAuthors.trim()) {
      setError('Authors are required');
      return;
    }

    if (!selectedProjectId) {
      setError('Please select a project');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const citationData = {
        title: citationTitle,
        authors: citationAuthors,
        publication: citationPublication,
        year: typeof citationYear === 'number' ? citationYear : parseInt(citationYear || '0'),
        url: citationUrl || '', // Use empty string instead of undefined
        doi: citationDoi || '', // Use empty string instead of undefined
        project_id: selectedProjectId
      };
      
      let updatedCitation: Citation;
      
      if (currentCitation) {
        updatedCitation = await api.citations.update(currentCitation.id, citationData);
        
        setCitations(citations.map(c => 
          c.id === updatedCitation.id ? updatedCitation : c
        ));
        setSuccessMessage('Citation updated successfully');
      } else {
        const newCitation = await api.citations.create(citationData);
        
        setCitations([...citations, newCitation]);
        setSuccessMessage('Citation created successfully');
      }
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving citation:', err);
      setError('Failed to save citation');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCitation = (citationId: number) => {
    const citationToEdit = citations.find(citation => citation.id === citationId);
    if (citationToEdit) {
      handleOpenDialog(citationToEdit);
    }
  };

  const handleDeleteCitation = async (citationId: number) => {
    if (window.confirm("Are you sure you want to delete this citation?")) {
      try {
        await api.citations.delete(citationId);
        setCitations(citations.filter(citation => citation.id !== citationId));
        setSuccessMessage('Citation deleted successfully');
      } catch (err) {
        console.error('Error deleting citation:', err);
        setError('Failed to delete citation');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Citations</Typography>
        <Button 
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
          disabled={projects.length === 0}
        >
          New Citation
        </Button>
      </Box>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      {projects.length === 0 && !loading && (
        <Typography sx={{ mb: 2 }}>
          Please create a project first before adding citations.
        </Typography>
      )}
      
      {loading && citations.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <CitationList 
          citations={citations} 
          loading={loading} 
          error={error}
          onEdit={handleEditCitation}
          onDelete={handleDeleteCitation}
        />
      )}
      
      {/* Citation Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentCitation ? 'Edit Citation' : 'New Citation'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={citationTitle}
            onChange={(e) => setCitationTitle(e.target.value)}
            required
            error={!citationTitle.trim()}
            helperText={!citationTitle.trim() ? 'Title is required' : ''}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Authors"
            fullWidth
            variant="outlined"
            value={citationAuthors}
            onChange={(e) => setCitationAuthors(e.target.value)}
            required
            error={!citationAuthors.trim()}
            helperText={!citationAuthors.trim() ? 'Authors are required' : ''}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Publication"
            fullWidth
            variant="outlined"
            value={citationPublication}
            onChange={(e) => setCitationPublication(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              margin="dense"
              label="Year"
              variant="outlined"
              value={citationYear}
              onChange={(e) => {
                const value = e.target.value;
                if (!value || /^\d+$/.test(value)) {
                  setCitationYear(value === '' ? '' : Number(value));
                }
              }}
              sx={{ width: '30%' }}
            />
            
            <FormControl fullWidth>
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
            label="URL"
            fullWidth
            variant="outlined"
            value={citationUrl}
            onChange={(e) => setCitationUrl(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="DOI"
            fullWidth
            variant="outlined"
            value={citationDoi}
            onChange={(e) => setCitationDoi(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveCitation} 
            variant="contained" 
            color="primary"
            disabled={!citationTitle.trim() || !citationAuthors.trim() || !selectedProjectId || loading}
          >
            {loading ? <CircularProgress size={24} /> : currentCitation ? 'Save' : 'Create'}
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

export default CitationSection;