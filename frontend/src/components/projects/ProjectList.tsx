import { List, ListItem, ListItemText, Paper, Typography, Divider, Box, Button, CircularProgress } from '@mui/material';
import { Project } from './ProjectSection';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ProjectListProps {
  projects: Project[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

function ProjectList({ projects, loading, error, onRefresh }: ProjectListProps) {
  // Format the date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return <Box display="flex" justifyContent="center"><CircularProgress /></Box>;
  }

  if (error) {
    return (
      <Box>
        <Typography color="error">{error}</Typography>
        <Button 
          startIcon={<RefreshIcon />} 
          onClick={onRefresh}
          variant="outlined"
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  if (projects.length === 0) {
    return <Typography>No projects yet. Create your first project above.</Typography>;
  }

  return (
    <Paper elevation={0}>
      <List>
        {projects.map((project, index) => (
          <Box key={project.id}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={project.name}
                secondary={`Created: ${formatDate(project.created_at)}`}
              />
            </ListItem>
            {index < projects.length - 1 && <Divider />}
          </Box>
        ))}
      </List>
    </Paper>
  );
}

export default ProjectList;