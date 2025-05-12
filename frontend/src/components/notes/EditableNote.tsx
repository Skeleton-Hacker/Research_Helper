import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardActions,
  Typography, Box, TextField,
  Button, IconButton, Tabs, Tab
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface EditableNoteProps {
  note: any;
  onSave: (note: any) => void;
  onDelete?: (id: number, title?: string) => void;
  isNew?: boolean;
}

const EditableNote: React.FC<EditableNoteProps> = ({ note, onSave, onDelete, isNew = false }) => {
  const [isEditing, setIsEditing] = useState(isNew);
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tabIndex, setTabIndex] = useState(0);

  // Reset the form fields when the note changes
  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
  }, [note]);

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a title for your note');
      return;
    }
    
    onSave({
      ...note,
      title,
      content
    });
    
    if (isNew) {
      setTitle('');
      setContent('');
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setTitle(note?.title || '');
    setContent(note?.content || '');
    
    // If it's a new note, the parent component should handle visibility
    // If editing existing note, exit edit mode
    if (!isNew) {
      setIsEditing(false);
    }
  };

  // Handle delete with confirmation
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete || !note.id) return;
    
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete(note.id, note.title);
    }
  };

  if (!isEditing && !isNew) {
    // Display mode
    return (
      <Card 
        elevation={3} 
        sx={{ 
          mb: 2, 
          cursor: 'pointer',
          '&:hover': { boxShadow: 6 }
        }}
        onClick={() => setIsEditing(true)}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom>{note.title}</Typography>
          
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {new Date(note.updated_at || note.created_at).toLocaleString()}
            </Typography>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {note.content}
            </ReactMarkdown>
          </Box>
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          {onDelete && (
            <IconButton 
              size="small" 
              color="error"
              onClick={handleDelete} // Use the standalone function here instead of inline
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </CardActions>
      </Card>
    );
  }

  // Edit mode
  return (
    <Card elevation={3} sx={{ mb: 2 }}>
      <CardContent>
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          variant="outlined"
          margin="normal"
          placeholder="Note title"
        />
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, mt: 2 }}>
          <Tabs value={tabIndex} onChange={(_, idx) => setTabIndex(idx)}>
            <Tab label="Edit" />
            <Tab label="Preview" />
          </Tabs>
        </Box>
        
        {tabIndex === 0 ? (
          <TextField
            fullWidth
            multiline
            rows={10}
            label="Content (Markdown supported)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            variant="outlined"
            placeholder="Write your content here..."
          />
        ) : (
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, minHeight: '200px', overflow: 'auto' }}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {content}
            </ReactMarkdown>
          </Box>
        )}
      </CardContent>
      
      <CardActions>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSave}
        >
          {isNew ? 'Add Note' : 'Update Note'}
        </Button>
        <Button 
          onClick={handleCancel}
          color="inherit"
        >
          Cancel
        </Button>
      </CardActions>
    </Card>
  );
};

export default EditableNote;