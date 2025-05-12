import { useState } from 'react';
import { 
  Box, Typography, TextField, Button, Paper, 
  List, ListItem, ListItemText, CircularProgress,
  Alert, FormControl, InputLabel, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import LaunchIcon from '@mui/icons-material/Launch';
import api from '../../services/api';
import { Project } from '../projects/ProjectSection';

interface ArxivPaper {
  id: string;
  title: string;
  summary: string;
  authors: string[];
  published: string;
  pdf_url: string;
  arxiv_url: string;
  categories: string[];
}

interface ArxivSearchProps {
  projects: Project[];
  onPaperAdded: () => void;
}

function ArxivSearch({ projects, onPaperAdded }: ArxivSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ArxivPaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<ArxivPaper | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addingPaper, setAddingPaper] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const papers = await api.arxiv.search(searchQuery);
      setSearchResults(papers);
      
      if (papers.length === 0) {
        setError('No results found. Try a different search term.');
      }
    } catch (err) {
      console.error('Error searching arXiv:', err);
      setError('Failed to search arXiv. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = (paper: ArxivPaper) => {
    setSelectedPaper(paper);
    setSelectedProjectId('');
    setDialogOpen(true);
  };

  const closeAddDialog = () => {
    setDialogOpen(false);
    setSelectedPaper(null);
    setSelectedProjectId('');
    setAddSuccess(false);
  };

  const handleProjectChange = (event: SelectChangeEvent<typeof selectedProjectId>) => {
    setSelectedProjectId(event.target.value as number);
  };

  const addPaperToCitations = async () => {
    if (!selectedPaper || !selectedProjectId) {
      return;
    }

    try {
      setAddingPaper(true);
      
      // Extract the paper ID from the arXiv URL
      const arxivId = selectedPaper.id.split('/').pop()?.replace('v', '') || 'paper';
      
      // Use the arxivId in the title to make it more identifiable
      const citationData = {
        title: `${selectedPaper.title} [arXiv:${arxivId}]`,
        url: selectedPaper.pdf_url || selectedPaper.arxiv_url,
        project_id: selectedProjectId as number,
        authors: selectedPaper.authors.join(', '), // Add authors field
        publication: 'arXiv', // Add publication field
        year: new Date(selectedPaper.published).getFullYear(), // Add year field
        doi: '' // Add doi field
      };

      // Pass the variable to the API call
      await api.citations.create(citationData);
      
      setAddSuccess(true);
      onPaperAdded();
      
      // Close dialog after success
      setTimeout(() => {
        closeAddDialog();
      }, 2000);
    } catch (err) {
      console.error('Error adding paper to citations:', err);
      setError('Failed to add paper to citations');
    } finally {
      setAddingPaper(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Search arXiv</Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <TextField
            label="Search arXiv papers"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            fullWidth
            placeholder="e.g., machine learning, artificial intelligence"
            variant="outlined"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            disabled={loading || !searchQuery.trim()}
            startIcon={<SearchIcon />}
          >
            Search
          </Button>
        </Box>
        
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && searchResults.length > 0 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Search Results</Typography>
          <List>
            {searchResults.map((paper) => (
              <ListItem 
                key={paper.id} 
                divider 
                alignItems="flex-start"
                secondaryAction={
                  <Box>
                    <IconButton 
                      edge="end" 
                      onClick={() => openAddDialog(paper)}
                      title="Add to citations"
                    >
                      <AddIcon />
                    </IconButton>
                    <IconButton 
                      edge="end" 
                      href={paper.arxiv_url} 
                      target="_blank"
                      title="Open in arXiv"
                    >
                      <LaunchIcon />
                    </IconButton>
                  </Box>
                }
                sx={{ pr: 8 }} // Make space for the buttons
              >
                <ListItemText
                  primary={<Typography variant="subtitle1">{paper.title}</Typography>}
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" component="span" sx={{ display: 'block' }}>
                        Authors: {paper.authors.join(', ')}
                      </Typography>
                      <Typography variant="body2" component="span" sx={{ display: 'block' }}>
                        Published: {formatDate(paper.published)}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mt: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {paper.summary}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Add paper dialog */}
      <Dialog open={dialogOpen} onClose={closeAddDialog}>
        <DialogTitle>Add to Citations</DialogTitle>
        <DialogContent>
          {addSuccess ? (
            <Alert severity="success">Paper successfully added to citations!</Alert>
          ) : (
            <>
              <Typography variant="body1" gutterBottom>
                {selectedPaper?.title}
              </Typography>
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="project-select-label">Project</InputLabel>
                <Select
                  labelId="project-select-label"
                  value={selectedProjectId}
                  onChange={handleProjectChange}
                  label="Project"
                >
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAddDialog}>Cancel</Button>
          <Button 
            onClick={addPaperToCitations} 
            disabled={!selectedProjectId || addingPaper || addSuccess}
            color="primary" 
            variant="contained"
          >
            {addingPaper ? <CircularProgress size={24} /> : 'Add Paper'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ArxivSearch;