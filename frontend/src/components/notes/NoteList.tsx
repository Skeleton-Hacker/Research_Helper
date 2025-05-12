import { 
  Box, Typography, Card, CardContent, CardActions, 
  Grid, IconButton, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Note } from './NoteSection';

interface NoteListProps {
  notes: Note[];
  loading: boolean;
  error: string | null;
  onEdit?: (noteId: number) => void;
  onDelete?: (noteId: number) => void;
}

function NoteList({ notes, loading, error, onEdit, onDelete }: NoteListProps) {
  if (error) {
    return <Typography color="error">{error}</Typography>;
  }
  
  if (notes.length === 0 && !loading) {
    return <Typography>No notes found.</Typography>;
  }
  
  // Function to truncate text if it's too long
  const truncate = (text: string, maxLength: number) => {
    return text.length > maxLength 
      ? text.substring(0, maxLength) + '...' 
      : text;
  };

  return (
    <Grid container spacing={3}>
      {notes.map(note => (
        <Grid item xs={12} md={6} key={note.id}>
          <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>
                {truncate(note.title, 50)} {/* Apply truncation to titles */}
              </Typography>
              
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {note.updated_at ? new Date(note.updated_at).toLocaleString() : new Date(note.created_at).toLocaleString()}
                </Typography>
              </Box>
              
              <Typography variant="body2" sx={{ 
                whiteSpace: 'pre-wrap', 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: '4',
                WebkitBoxOrient: 'vertical',
              }}>
                {note.content}
              </Typography>
            </CardContent>
            
            {(onEdit || onDelete) && (
              <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                {onEdit && (
                  <Tooltip title="Edit">
                    <IconButton 
                      size="small" 
                      onClick={() => onEdit(note.id)}
                      aria-label="edit note"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                
                {onDelete && (
                  <Tooltip title="Delete">
                    <IconButton 
                      size="small" 
                      onClick={() => onDelete(note.id)}
                      aria-label="delete note"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </CardActions>
            )}
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default NoteList;