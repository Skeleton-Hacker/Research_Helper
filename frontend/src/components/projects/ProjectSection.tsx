import { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Grid, Button, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, IconButton, Snackbar,
  Alert, CardActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
// import FolderIcon from '@mui/icons-material/Folder';
import api from '../../services/api';

export interface Project {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

interface ProjectSectionProps {
  onProjectSelect: (project: Project) => void;
}

function ProjectSection({ onProjectSelect }: ProjectSectionProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.projects.getAll();
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // If currentProject exists, update it; otherwise create a new one
      let updatedProject: Project;
      
      if (currentProject) {
        updatedProject = await api.projects.update(currentProject.id, {
          name: projectName,
          description: projectDescription
        }) as Project;
        
        // Update the project in the list
        setProjects(projects.map(p => 
          p.id === updatedProject.id ? updatedProject : p
        ));
        setSuccessMessage('Project updated successfully');
      } else {
        const newProject = await api.projects.create({
          name: projectName,
          description: projectDescription
        }) as Project;
        
        setProjects([...projects, newProject]);
        setSuccessMessage('Project created successfully');
      }
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving project:', err);
      setError('Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (project: Project | null = null) => {
    setCurrentProject(project);
    
    if (project) {
      setProjectName(project.name);
      setProjectDescription(project.description || '');
    } else {
      setProjectName('');
      setProjectDescription('');
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentProject(null);
    setProjectName('');
    setProjectDescription('');
    setError(null);
  };
  
  const handleEditProject = (event: React.MouseEvent, project: Project) => {
    // Stop propagation to prevent triggering the card click
    event.stopPropagation();
    handleOpenDialog(project);
  };

  const handleDeleteProject = async (projectId: number) => {
    if (window.confirm("Are you sure you want to delete this project? This will also delete all associated notes, citations, and tasks.")) {
      try {
        await api.projects.delete(projectId);
        // Update the projects list
        setProjects(projects.filter(project => project.id !== projectId));
        setSuccessMessage('Project deleted successfully');
        
        // If the deleted project was selected, clear selection
        if (selectedProject && selectedProject.id === projectId) {
          setSelectedProject(null);
        }
      } catch (err) {
        console.error('Error deleting project:', err);
        setError('Failed to delete project');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Projects</Typography>
        <Button 
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
          id="new-project-button"
        >
          New Project
        </Button>
      </Box>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      {loading && projects.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : projects.length > 0 ? (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card 
                elevation={3}
                sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
                onClick={() => onProjectSelect(project)}
              >
                <CardContent>
                  <Typography variant="h6">{project.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(project.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <IconButton 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click from triggering
                      handleEditProject(e, project);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click from triggering
                      handleDeleteProject(project.id);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography>No projects yet. Create your first project to get started.</Typography>
      )}
      
      {/* Project Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{currentProject ? 'Edit Project' : 'New Project'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            variant="outlined"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
            error={!projectName.trim()}
            helperText={!projectName.trim() ? 'Project name is required' : ''}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            variant="outlined"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateProject} 
            variant="contained" 
            color="primary"
            disabled={!projectName.trim() || loading}
          >
            {loading ? <CircularProgress size={24} /> : currentProject ? 'Save' : 'Create'}
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

export default ProjectSection;