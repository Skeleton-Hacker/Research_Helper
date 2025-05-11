import { 
  List, Typography, Box, Chip,
  CircularProgress, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Note } from './NoteSection';

interface NoteListProps {
  notes: Note[];
  loading: boolean;
  error: string | null;
}

function NoteList({ notes, loading, error }: NoteListProps) {
  // Format the date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return <Box display="flex" justifyContent="center"><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (notes.length === 0) {
    return <Typography>No notes found. Create your first note above.</Typography>;
  }

  return (
    <List sx={{ width: '100%' }}>
      {notes.map((note) => (
        <Box key={note.id}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{note.title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                {note.content}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 0.5 }}>
                {note.tags.map((tag, index) => (
                  <Chip key={index} label={tag} size="small" color="primary" variant="outlined" />
                ))}
              </Box>
              <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                Created: {formatDate(note.created_at)}
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      ))}
    </List>
  );
}

export default NoteList;