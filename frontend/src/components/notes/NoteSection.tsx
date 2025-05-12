import { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, FormControl,
  InputLabel, Select, MenuItem, CircularProgress,
  Alert, SelectChangeEvent
} from '@mui/material';
import api from '../../services/api';
import EditableNote from './EditableNote';
import { Project } from '../projects/ProjectSection';

export interface Note {
  id: number;
  title: string;
  content: string;
  project_id: number;
  created_at: string;
  updated_at: string;
  tags: string[];
}

function NoteSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [notesData, projectsData] = await Promise.all([
        api.notes.getAll(),
        api.projects.getAll()
      ]);
      
      // Transform API response to match Note interface
      const transformedNotes: Note[] = notesData.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        project_id: note.project_id,
        created_at: note.created_at,
        updated_at: note.updated_at || note.created_at, // Ensure updated_at is always set
        tags: note.tags || [] // Handle tags if needed
      }));
      
      setNotes(transformedNotes);
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

  const handleProjectChange = (event: SelectChangeEvent<number>) => {
    setSelectedProjectId(Number(event.target.value));
  };

  const handleSaveNote = async (noteData: any) => {
    try {
      if (noteData.id) {
        // Update existing note
        const apiResponse = await api.notes.update(noteData.id, {
          title: noteData.title,
          content: noteData.content,
          project_id: noteData.project_id,
          tags: noteData.tags || []
        });
        
        // Transform to ensure it matches Note interface
        const updatedNote: Note = {
          ...apiResponse,
          updated_at: apiResponse.updated_at || apiResponse.created_at, // Ensure updated_at is never undefined
          tags: apiResponse.tags || []
        };
        
        setNotes(notes.map(n => 
          n.id === updatedNote.id ? updatedNote : n
        ));
        setSuccessMessage('Note updated successfully');
      } else {
        // Create new note
        const apiResponse = await api.notes.create({
          title: noteData.title,
          content: noteData.content,
          project_id: selectedProjectId,
          tags: []
        });
        
        // Transform to ensure it matches Note interface
        const newNote: Note = {
          ...apiResponse,
          updated_at: apiResponse.updated_at || apiResponse.created_at, // Ensure updated_at is never undefined
          tags: apiResponse.tags || []
        };
        
        setNotes([...notes, newNote]);
        setSuccessMessage('Note created successfully');
        setIsAddingNote(false);
      }
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving note:', err);
      setError('Failed to save note');
    }
  };

  const handleDeleteNote = async (noteId: number, noteTitle?: string) => {
    try {
      await api.notes.delete(noteId, noteTitle);
      setNotes(notes.filter(note => note.id !== noteId));
      setSuccessMessage('Note deleted successfully');
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note');
    }
  };

  const filteredNotes = selectedProjectId 
    ? notes.filter(note => note.project_id === selectedProjectId)
    : notes;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Notes</Typography>
        <Button 
          variant="contained"
          color="primary"
          onClick={() => setIsAddingNote(true)}
          disabled={projects.length === 0}
        >
          Add Note
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      
      {projects.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please create a project first before adding notes.
        </Alert>
      )}

      {projects.length > 0 && (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="project-select-label">Project</InputLabel>
          <Select
            labelId="project-select-label"
            id="project-select"
            value={selectedProjectId}
            label="Project"
            onChange={handleProjectChange}
          >
            {projects.map(project => (
              <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {isAddingNote && (
            <EditableNote 
              note={{ project_id: selectedProjectId }}
              onSave={handleSaveNote}
              isNew={true}
            />
          )}

          {filteredNotes.length === 0 && !isAddingNote ? (
            <Typography>No notes found. Add your first note to this project.</Typography>
          ) : (
            filteredNotes.map(note => (
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
    </Box>
  );
}

export default NoteSection;