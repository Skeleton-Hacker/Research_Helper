import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Divider, TextField } from '@mui/material';
import NoteForm from './NoteForm';
import NoteList from './NoteList';
import api from '../../services/api';
import { Project } from '../projects/ProjectSection';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load projects on component mount for project selection dropdown
  useEffect(() => {
    fetchProjects();
    fetchNotes(); 
    // In a real implementation, you would also fetch notes here
    // Once the notes API endpoint is available
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

  // Placeholder for the actual notes fetch function
  // This would be implemented when the notes API endpoint is available
  const fetchNotes = async () => {
    // Mock data for UI development
    setNotes([
      {
        id: 1,
        title: 'Sample Note',
        content: 'This is a sample note content.',
        tags: ['research', 'sample'],
        project_id: 1,
        created_at: new Date().toISOString(),
        versions: []
      }
    ]);
  };

  const handleNoteCreated = (newNote: Note) => {
    setNotes([newNote, ...notes]);
  };

  // Filter notes based on search query
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Notes</Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Create New Note</Typography>
        <NoteForm 
          projects={projects} 
          onNoteCreated={handleNoteCreated} 
        />
      </Paper>

      <Divider sx={{ my: 4 }} />
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Your Notes</Typography>
        
        <TextField
          label="Search Notes"
          fullWidth
          variant="outlined"
          margin="normal"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <NoteList 
          notes={filteredNotes} 
          loading={loading} 
          error={error}
        />
      </Paper>
    </Box>
  );
}

export default NoteSection;