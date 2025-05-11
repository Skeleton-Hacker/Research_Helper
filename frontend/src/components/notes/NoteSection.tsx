import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Grid, CircularProgress,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Divider, Alert, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReactMarkdown from 'react-markdown';
import api from '../../services/api';
import { Project } from '../projects/ProjectSection';

// Defines our note interface
export interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
  project_id: number;
  created_at: string;
  versions: any[];
}

function NoteSection() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  
  // Form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('');
  const [noteProjectId, setNoteProjectId] = useState<number | ''>('');

  useEffect(() => {
    fetchProjects();
    fetchNotes();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await api.projects.getAll();
      setProjects(data);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects');
    }
  };

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await api.notes.getAll();
      
      // Map the API response to include the versions property
      const notesWithVersions = data.map(note => ({
        ...note,
        versions: note.versions || [] // Add versions if missing
      }));
      
      setNotes(notesWithVersions);
      setError(null);
    } catch (err) {
      console.error('Error loading notes:', err);
      setError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const startNewNote = () => {
    setActiveNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteTags('');
    setNoteProjectId('');
    setIsCreatingNote(true);
  };

  const handleCreateNote = async () => {
    if (!noteTitle || !noteProjectId) {
      setError('Please provide a title and select a project');
      return;
    }
    
    try {
      // The backend will handle creating the file in the project directory
      const newNote = await api.notes.create({
        title: noteTitle,
        content: noteContent,
        tags: noteTags.split(',').map(tag => tag.trim()).filter(tag => tag),
        project_id: noteProjectId as number
      });
      
      // Add versions property to the new note
      const noteWithVersions = {
        ...newNote,
        versions: []
      };
      
      setNotes([noteWithVersions, ...notes]);
      resetForm();
      setIsCreatingNote(false);
    } catch (err) {
      console.error('Error creating note:', err);
      setError('Failed to create note');
    }
  };

  const handleUpdateNote = async () => {
    if (!activeNote || !noteTitle || !noteProjectId) {
      setError('Missing required fields');
      return;
    }
    
    try {
      setError(null);
      
      // The backend will handle updating the file in the filesystem
      const updatedNote = await api.notes.update(activeNote.id, {
        title: noteTitle,
        content: noteContent,
        tags: noteTags.split(',').map(tag => tag.trim()).filter(tag => tag),
        project_id: noteProjectId as number
      });
      
      // Update the notes list
      const updatedNotes = notes.map(note => 
        note.id === activeNote.id ? { ...updatedNote, versions: note.versions } : note
      );
      
      setNotes(updatedNotes);
      setActiveNote(updatedNote);
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update note');
    }
  };

  const resetForm = () => {
    setNoteTitle('');
    setNoteContent('');
    setNoteTags('');
    setNoteProjectId('');
  };

  const handleSelectNote = (note: Note) => {
    setActiveNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteTags(note.tags.join(', '));
    setNoteProjectId(note.project_id);
    setIsCreatingNote(false);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Notes</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={startNewNote}
        >
          New Note
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Notes List - Left Column */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, height: '80vh', overflow: 'auto' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Your Notes</Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : notes.length === 0 && !isCreatingNote ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                  No notes yet
                </Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />} 
                  onClick={startNewNote}
                >
                  Create Your First Note
                </Button>
              </Box>
            ) : (
              <Box>
                {notes.map(note => (
                  <Box 
                    key={note.id}
                    onClick={() => handleSelectNote(note)}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      borderRadius: 1,
                      cursor: 'pointer',
                      bgcolor: activeNote?.id === note.id ? 'action.selected' : 'transparent',
                      '&:hover': {
                        bgcolor: activeNote?.id === note.id ? 'action.selected' : 'action.hover'
                      }
                    }}
                  >
                    <Typography variant="subtitle1" noWrap>{note.title}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {formatDate(note.created_at)}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{
                        mt: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        color: 'text.secondary'
                      }}
                    >
                      {note.content.slice(0, 100)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Note Editor - Right Column */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2, height: '80vh', display: 'flex', flexDirection: 'column' }}>
            {isCreatingNote || activeNote ? (
              <>
                {/* Note Header */}
                <Box sx={{ mb: 2 }}>
                  <TextField
                    placeholder="Note Title"
                    variant="standard"
                    fullWidth
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    sx={{ 
                      mb: 2,
                      '& .MuiInputBase-input': {
                        fontSize: '1.5rem',
                        fontWeight: 500,
                        padding: '4px 0'
                      },
                      '& .MuiInput-underline:before': {
                        borderBottom: 'none'
                      },
                      '&:hover .MuiInput-underline:before': {
                        borderBottom: '1px solid rgba(0, 0, 0, 0.42)'
                      }
                    }}
                  />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="project-select-label">Project</InputLabel>
                        <Select
                          labelId="project-select-label"
                          value={noteProjectId}
                          onChange={(e) => setNoteProjectId(e.target.value as number)}
                          label="Project"
                        >
                          {projects.map(project => (
                            <MenuItem key={project.id} value={project.id}>
                              {project.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Tags"
                        placeholder="tag1, tag2, tag3"
                        size="small"
                        fullWidth
                        value={noteTags}
                        onChange={(e) => setNoteTags(e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Add toggle buttons for edit/preview mode */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_, newMode) => {
                      if (newMode !== null) {
                        setViewMode(newMode);
                      }
                    }}
                    size="small"
                  >
                    <ToggleButton value="edit">
                      <EditIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Edit
                    </ToggleButton>
                    <ToggleButton value="preview">
                      <VisibilityIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Preview
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
                
                {/* Note Content Editor - Switches between edit and preview */}
                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                  {viewMode === 'edit' ? (
                    // Edit mode - TextField for markdown input
                    <Box sx={{ 
                      pl: 2, 
                      pr: 2,
                      '& p': { 
                        lineHeight: 1.8,
                        my: 1 
                      }
                    }}>
                      <TextField
                        multiline
                        fullWidth
                        placeholder="Start writing... (Markdown supported)"
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        variant="standard"
                        sx={{ 
                          '& .MuiInputBase-root': {
                            padding: 0,
                            fontSize: '1rem'
                          },
                          '& .MuiInput-underline:before': {
                            borderBottom: 'none'
                          }
                        }}
                        InputProps={{
                          disableUnderline: true
                        }}
                      />
                    </Box>
                  ) : (
                    // Preview mode - Render markdown content
                    <Box sx={{ 
                      px: 3, 
                      py: 1,
                      overflow: 'auto',
                      height: '100%',
                      backgroundColor: '#fafafa',
                      borderRadius: 1,
                      '& img': {
                        maxWidth: '100%'
                      },
                      '& a': {
                        color: 'primary.main',
                        textDecoration: 'none'
                      },
                      '& a:hover': {
                        textDecoration: 'underline'
                      },
                      '& blockquote': {
                        borderLeft: '3px solid #ddd',
                        margin: '0 0 20px',
                        padding: '0 0 0 15px',
                        color: 'text.secondary'
                      },
                      '& pre': {
                        backgroundColor: '#f5f5f5',
                        padding: '10px',
                        borderRadius: '4px',
                        overflowX: 'auto',
                      },
                      '& code': {
                        fontFamily: 'monospace',
                        backgroundColor: 'rgba(0,0,0,0.06)',
                        padding: '2px 4px',
                        borderRadius: '3px',
                        fontSize: '0.9em'
                      }
                    }}>
                      {/* This is the markdown renderer */}
                      {noteContent ? (
                        <ReactMarkdown>
                          {noteContent}
                        </ReactMarkdown>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          No content to preview. Start writing in Edit mode.
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Footer Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 'auto' }}>
                  {isCreatingNote ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleCreateNote}
                      disabled={!noteTitle || !noteProjectId}
                    >
                      Save Note
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleUpdateNote}
                      disabled={!noteTitle || !noteProjectId}
                    >
                      Update Note
                    </Button>
                  )}
                </Box>
              </>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%' 
              }}>
                <Typography variant="h6" color="text.secondary">
                  Select a note or create a new one
                </Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />}
                  onClick={startNewNote}
                  sx={{ mt: 2 }}
                >
                  New Note
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default NoteSection;