import { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Grid, Card, CardContent, 
  CardActions, TextField, Dialog, DialogTitle, 
  DialogContent, DialogActions, Chip, IconButton,
  CardHeader, Skeleton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import api from '../../services/api';
import ProjectDetail from './ProjectDetail';

export interface Project {
  id: number;
  name: string;
  created_at: string;
}

function ProjectSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetail, setShowProjectDetail] = useState(false);

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

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    
    try {
      const newProject = await api.projects.create(newProjectName);
      setProjects([...projects, newProject]);
      setNewProjectName('');
      setDialogOpen(false);
    } catch (err) {
      setError('Failed to create project');
      console.error('Error creating project:', err);
    }
  };

  const handleProjectClick = (project: Project) => {
    console.log('Project clicked:', project);
    setSelectedProject(project);
    setShowProjectDetail(true);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Loading skeleton for projects
  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
        <Card elevation={3}>
          <CardHeader
            avatar={<Skeleton variant="circular" width={40} height={40} />}
            title={<Skeleton variant="text" width="80%" />}
            subheader={<Skeleton variant="text" width="40%" />}
          />
          <CardContent>
            <Skeleton variant="rectangular" width="100%" height={30} />
          </CardContent>
          <CardActions>
            <Skeleton variant="rectangular" width={60} height={30} />
            <Skeleton variant="rectangular" width={60} height={30} />
          </CardActions>
        </Card>
      </Grid>
    ));
  };

  return (
    <Box>
      {!showProjectDetail ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">Projects</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
            >
              New Project
            </Button>
          </Box>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Grid container spacing={3}>
            {loading ? (
              renderSkeletons()
            ) : projects.length === 0 ? (
              <Grid item xs={12}>
                <Card sx={{ textAlign: 'center', p: 3, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="h6">No projects yet</Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    Click "New Project" to create your first research project
                  </Typography>
                </Card>
              </Grid>
            ) : (
              projects.map(project => (
                <Grid item xs={12} sm={6} md={4} key={project.id}>
                  <Card 
                    elevation={3} 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 6
                      },
                      cursor: 'pointer'
                    }}
                    onClick={() => handleProjectClick(project)}
                  >
                    <CardHeader
                      avatar={<FolderIcon color="primary" />}
                      title={project.name}
                      subheader={`Created: ${formatDate(project.created_at)}`}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip label="Click to view details" variant="outlined" size="small" />
                      </Box>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                      <IconButton size="small" title="Edit project">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" title="Delete project">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>

          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Project Name"
                fullWidth
                variant="outlined"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleCreateProject();
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleCreateProject} 
                variant="contained" 
                color="primary"
                disabled={!newProjectName.trim()}
              >
                Create
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button variant="outlined" onClick={() => setShowProjectDetail(false)} sx={{ mr: 2 }}>
              Back to Projects
            </Button>
            <Typography variant="h4">{selectedProject?.name}</Typography>
          </Box>
          <Box>
            <ProjectDetail project={selectedProject!} />
          </Box>
        </>
      )}
    </Box>
  );
}

export default ProjectSection;