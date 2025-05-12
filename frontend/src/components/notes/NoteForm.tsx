import { useState } from 'react';
import { 
  TextField, Button, Box, Alert, CircularProgress, 
  FormControl, InputLabel, Select, MenuItem, Chip,
  SelectChangeEvent
} from '@mui/material';
import { Project } from '../projects/ProjectSection';

export interface Note {
  id: number;
  title: string;
  content: string;
  project_id: number;
  created_at: string;
  updated_at: string;
  tags: string[];
  versions?: any[]; // Add this optional field
}

interface NoteFormProps {
  projects: Project[];
  onNoteCreated: (note: Note) => void;
}

function NoteForm({ projects, onNoteCreated }: NoteFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [projectId, setProjectId] = useState<number | ''>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a note title');
      return;
    }

    if (!projectId) {
      setError('Please select a project');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // This would call the API when the endpoint is available
      // For now, create a mock response
      const noteData = {
        title,
        content,
        project_id: projectId,
        tags: tags || []
      };
      
      const newNote: Note = {
        id: Date.now(), // Temporary ID
        ...noteData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        versions: []
      };
      
      // Update UI
      onNoteCreated(newNote);
      setSuccess(true);
      resetForm();
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to create note');
      console.error('Error creating note:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setProjectId('');
    setTags([]);
    setTagInput('');
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
    }
    setTagInput('');
  };

  const handleProjectChange = (event: SelectChangeEvent<typeof projectId>) => {
    setProjectId(event.target.value as number);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Note created successfully</Alert>}
      
      <TextField
        label="Title"
        fullWidth
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        margin="normal"
        required
        disabled={loading}
      />
      
      <FormControl fullWidth margin="normal">
        <InputLabel id="project-select-label">Project</InputLabel>
        <Select
          labelId="project-select-label"
          value={projectId}
          onChange={handleProjectChange}
          label="Project"
          disabled={loading || projects.length === 0}
        >
          {projects.map((project) => (
            <MenuItem key={project.id} value={project.id}>
              {project.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <TextField
        label="Content"
        fullWidth
        multiline
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        margin="normal"
        disabled={loading}
      />
      
      <Box sx={{ mt: 2, mb: 1 }}>
        <TextField
          label="Tags (press Enter to add)"
          fullWidth
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagInputKeyDown}
          onBlur={addTag}
          disabled={loading}
        />
      </Box>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
        {tags.map((tag, index) => (
          <Chip 
            key={index} 
            label={tag} 
            onDelete={() => setTags(tags.filter((_, i) => i !== index))}
          />
        ))}
      </Box>
      
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Create Note'}
      </Button>
    </Box>
  );
}

export default NoteForm;