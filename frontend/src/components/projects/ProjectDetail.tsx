import { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Paper, Tabs, Tab, 
  Button, Divider, CircularProgress
} from '@mui/material';
import api from '../../services/api';
import NoteList from '../notes/NoteList';
import CitationList from '../citations/CitationList';
import TaskList from '../tasks/TaskList';
import { Project } from './ProjectSection';
import { Note } from '../notes/NoteSection';
import { Citation } from '../citations/CitationSection';
import { Task } from '../tasks/TaskSection';

interface ProjectDetailProps {
  project: Project;
}

function ProjectDetail({ project }: ProjectDetailProps) {
  const [tabValue, setTabValue] = useState(0);
  const [notes, setNotes] = useState<Note[]>([]);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchProjectData();
  }, [project.id]);
  
  const fetchProjectData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, you would have API endpoints to get project-specific data
      // For now, we'll filter from all data
      
      // Fetch all notes
      const allNotes = await api.notes.getAll();
      const projectNotes = allNotes.filter(note => note.project_id === project.id);
      setNotes(projectNotes);
      
      // Fetch all citations
      const allCitations = await api.citations.getAll();
      const projectCitations = allCitations.filter(citation => citation.project_id === project.id);
      setCitations(projectCitations);
      
      // Fetch all tasks
      const allTasks = await api.tasks.getAll();
      // Cast the status to the correct type and filter by project
      const projectTasks = allTasks
        .filter(task => task.project_id === project.id)
        .map(task => ({
          ...task,
          status: validateTaskStatus(task.status)
        })) as Task[];
      setTasks(projectTasks);
      
    } catch (err) {
      console.error('Error fetching project data:', err);
      setError('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to validate task status
  const validateTaskStatus = (status: string): 'pending' | 'in-progress' | 'completed' => {
    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (validStatuses.includes(status)) {
      return status as 'pending' | 'in-progress' | 'completed';
    }
    // Default to 'pending' if the status is not valid
    console.warn(`Invalid task status "${status}" - defaulting to "pending"`);
    return 'pending';
  };
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleTaskStatusUpdate = (taskId: number, newStatus: 'pending' | 'in-progress' | 'completed') => {
    setTasks(tasks.map(task => 
      task.id === taskId ? {...task, status: newStatus} : task
    ));
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>{project.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          Created: {new Date(project.created_at).toLocaleDateString()}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Paper elevation={1} sx={{ p: 2, bgcolor: '#f5f7ff', textAlign: 'center' }}>
              <Typography variant="h6">{notes.length}</Typography>
              <Typography variant="body2">Notes</Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper elevation={1} sx={{ p: 2, bgcolor: '#fff8f5', textAlign: 'center' }}>
              <Typography variant="h6">{citations.length}</Typography>
              <Typography variant="body2">Citations</Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper elevation={1} sx={{ p: 2, bgcolor: '#f5fff8', textAlign: 'center' }}>
              <Typography variant="h6">{tasks.length}</Typography>
              <Typography variant="body2">Tasks</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Notes" />
          <Tab label="Citations" />
          <Tab label="Tasks" />
        </Tabs>
        
        {tabValue === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="contained" color="primary">Add Note</Button>
            </Box>
            {notes.length > 0 ? (
              <NoteList notes={notes} loading={false} error={null} />
            ) : (
              <Typography>No notes yet. Add your first note to this project.</Typography>
            )}
          </Box>
        )}
        
        {tabValue === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="contained" color="primary">Add Citation</Button>
            </Box>
            {citations.length > 0 ? (
              <CitationList citations={citations} loading={false} error={null} />
            ) : (
              <Typography>No citations yet. Add your first citation to this project.</Typography>
            )}
          </Box>
        )}
        
        {tabValue === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="contained" color="primary">Add Task</Button>
            </Box>
            {tasks.length > 0 ? (
              <TaskList tasks={tasks} loading={false} error={null} onStatusUpdate={handleTaskStatusUpdate} />
            ) : (
              <Typography>No tasks yet. Add your first task to this project.</Typography>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default ProjectDetail;