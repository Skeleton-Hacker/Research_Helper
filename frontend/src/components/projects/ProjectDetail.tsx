import { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Paper, Tabs, Tab, 
  Button, Divider, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../../services/api';
import CitationList from '../citations/CitationList';
import TaskList from '../tasks/TaskList';
import EditableNote from '../notes/EditableNote';
import { Project } from './ProjectSection';
import { Note } from '../notes/NoteSection';
import { Citation } from '../citations/CitationSection';
import { Task } from '../tasks/TaskSection';
import ArxivSearch from '../citations/ArxivSearch';
import CitationDialog from '../citations/CitationDialog';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void; // New prop for handling back navigation
}

function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  const [tabValue, setTabValue] = useState(0);
  const [notes, setNotes] = useState<Note[]>([]);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [citationDialogOpen, setCitationDialogOpen] = useState(false);
  const [newCitation, setNewCitation] = useState<Citation | null>(null);
  const [_successMessage, setSuccessMessage] = useState<string | null>(null);

  // Add these state variables to your component
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  
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
      // Transform notes to ensure they match the Note interface
      const projectNotes = allNotes
        .filter(note => note.project_id === project.id)
        .map(note => ({
          ...note,
          updated_at: note.updated_at || note.created_at, // Ensure updated_at is never undefined
          tags: note.tags || [] // Ensure tags is never undefined
        })) as Note[];
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
          status: validateTaskStatus(task.status),
          due_date: task.due_date === null ? undefined : task.due_date // Handle null due_date
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

  const handleEditTask = async (taskId: number) => {
    // Find the task by ID
    const taskToEdit = tasks.find(task => task.id === taskId);
    if (taskToEdit) {
      // Set current task data in the form fields
      setNewTaskTitle(taskToEdit.title);
      setNewTaskDescription(taskToEdit.description || '');
      setNewTaskDueDate(taskToEdit.due_date || '');
      
      // Store the task being edited
      setCurrentTask(taskToEdit);
      
      // Open the dialog
      setTaskDialogOpen(true);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await api.tasks.delete(taskId);
        // Update the tasks list
        setTasks(tasks.filter(task => task.id !== taskId));
      } catch (err) {
        console.error('Error deleting task:', err);
        setError('Failed to delete task');
      }
    }
  };

  const handleSaveNote = async (noteData: any) => {
    try {
      if (noteData.id) {
        // Update existing note
        const apiResponse = await api.notes.update(noteData.id, {
          title: noteData.title,
          content: noteData.content,
          project_id: project.id, // Add the project_id from the current project
          tags: noteData.tags || []
        });
        
        // Transform to ensure it matches Note interface
        const updatedNote: Note = {
          ...apiResponse,
          updated_at: apiResponse.updated_at || apiResponse.created_at, // Ensure updated_at is never undefined
          tags: apiResponse.tags || [] // Ensure tags is never undefined
        };
        
        setNotes(notes.map(n => n.id === updatedNote.id ? updatedNote : n));
      } else {
        // Create new note
        const apiResponse = await api.notes.create({
          title: noteData.title,
          content: noteData.content,
          project_id: project.id,
          tags: []
        });
        
        // Transform to ensure it matches Note interface
        const newNote: Note = {
          ...apiResponse,
          updated_at: apiResponse.updated_at || apiResponse.created_at, // Ensure updated_at is never undefined
          tags: apiResponse.tags || [] // Ensure tags is never undefined
        };
        
        setNotes([...notes, newNote]);
        setIsAddingNote(false);
      }
    } catch (err) {
      console.error('Error saving note:', err);
      setError('Failed to save note');
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await api.notes.delete(noteId);
      setNotes(notes.filter(n => n.id !== noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note');
    }
  };

  const handleAddTask = async (taskData: Partial<Task>) => {
    try {
      // Make sure we have a title before calling the API
      if (!taskData.title) {
        setError('Task title is required');
        return;
      }
      
      // Create the task with the project ID
      const rawNewTask = await api.tasks.create({
        title: taskData.title, // Now this is guaranteed to be a string
        project_id: project.id,
        due_date: taskData.due_date
      });
      
      // Transform the response to match your interface
      const newTask: Task = {
        ...rawNewTask,
        status: validateTaskStatus(rawNewTask.status),
        due_date: rawNewTask.due_date === null ? undefined : rawNewTask.due_date
      };
      
      // Add the new task to the tasks list
      setTasks([...tasks, newTask]);
      setSuccessMessage('Task added successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task');
    }
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
      {/* Add back button at the top */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={onBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">{project.name}</Typography>
      </Box>

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
            {isAddingNote ? (
              <EditableNote
                note={{ project_id: project.id }}
                onSave={handleSaveNote}
                isNew={true}
              />
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setIsAddingNote(true)}
                sx={{ mb: 2 }}
              >
                ADD NOTE
              </Button>
            )}

            {notes.length === 0 && !isAddingNote ? (
              <Typography>No notes yet. Add your first note to this project.</Typography>
            ) : (
              notes.map(note => (
                <EditableNote
                  key={note.id}
                  note={note}
                  onSave={handleSaveNote}
                  onDelete={handleDeleteNote}
                />
              ))
            )}
          </Box>
        )}
        
        {tabValue === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {
                  // Fix: Cast as Citation to include all required properties
                  const newCitationData = {
                    id: 0, // Use a temporary ID for new citations
                    title: '',
                    authors: '',
                    publication: '',
                    year: new Date().getFullYear(),
                    url: '',
                    doi: '',
                    project_id: project.id,
                    created_at: new Date().toISOString() // Add current date as string
                  } as Citation; // Cast to Citation type
                  
                  setCitationDialogOpen(true);
                  setNewCitation(newCitationData);
                }}
              >
                ADD CITATION
              </Button>
            </Box>
            
            <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: '#f9f9f9' }}>
              <Typography variant="subtitle1" gutterBottom>Search arXiv</Typography>
              <ArxivSearch
                projects={[project]}
                onPaperAdded={() => {
                  fetchProjectData();
                }}
              />
            </Paper>
            
            {citations.length > 0 ? (
              <CitationList citations={citations} loading={false} error={null} />
            ) : (
              <Typography>No citations yet. Add your first citation to this project.</Typography>
            )}
            
            {/* Citation Dialog */}
            <CitationDialog 
              open={citationDialogOpen}
              onClose={() => setCitationDialogOpen(false)}
              citation={newCitation}
              projects={[project]}
              onSave={async (citationData) => {
                try {
                  await api.citations.create({
                    ...citationData,
                    project_id: project.id
                  });
                  setCitationDialogOpen(false);
                  fetchProjectData();
                  setSuccessMessage('Citation added successfully');
                  setTimeout(() => setSuccessMessage(''), 3000);
                } catch (err) {
                  console.error('Error adding citation:', err);
                  setError('Failed to add citation');
                }
              }}
            />
          </Box>
        )}
        
        {tabValue === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setTaskDialogOpen(true)}
              >
                ADD TASK
              </Button>
            </Box>
            {tasks.length > 0 ? (
              <TaskList 
                tasks={tasks} 
                loading={false} 
                error={null} 
                onStatusUpdate={handleTaskStatusUpdate}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask} 
              />
            ) : (
              <Typography>No tasks yet. Add your first task to this project.</Typography>
            )}
          </Box>
        )}
      </Paper>

      {/* Task Dialog */}
      <Dialog open={taskDialogOpen} onClose={() => setTaskDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{currentTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            type="text"
            fullWidth
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            required
            error={!newTaskTitle.trim()}
            helperText={!newTaskTitle.trim() ? "Title is required" : ""}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newTaskDueDate}
            onChange={(e) => setNewTaskDueDate(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              if (!newTaskTitle.trim()) return;
              
              if (currentTask) {
                // Update existing task
                const updatedTask = {
                  ...currentTask,
                  title: newTaskTitle,
                  description: newTaskDescription,
                  due_date: newTaskDueDate || undefined
                };
                setTasks(tasks.map(task => task.id === currentTask.id ? updatedTask : task));
              } else {
                // Add new task
                handleAddTask({
                  title: newTaskTitle,
                  description: newTaskDescription,
                  due_date: newTaskDueDate || undefined,
                  status: 'pending',
                  project_id: project.id
                });
              }
              
              // Close dialog and reset values
              setTaskDialogOpen(false);
              setNewTaskTitle('');
              setNewTaskDescription('');
              setNewTaskDueDate('');
              setCurrentTask(null);
            }} 
            color="primary"
          >
            {currentTask ? 'Save Changes' : 'Add Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProjectDetail;