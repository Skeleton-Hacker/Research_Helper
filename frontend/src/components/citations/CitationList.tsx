import { 
  List, ListItem, ListItemText, Typography, Divider, Box,
  CircularProgress, Link, Button
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DescriptionIcon from '@mui/icons-material/Description';
import { Citation } from './CitationSection';

interface CitationListProps {
  citations: Citation[];
  loading: boolean;
  error: string | null;
}

function CitationList({ citations, loading, error }: CitationListProps) {
  // Format the date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleOpenFile = (filePath: string) => {
    // In a real app, this would trigger Electron to open the file
    // For now, just log to console
    console.log(`Opening file: ${filePath}`);
    alert(`In production, this would open: ${filePath}`);
  };

  if (loading) {
    return <Box display="flex" justifyContent="center"><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (citations.length === 0) {
    return <Typography>No citations found. Add your first citation above.</Typography>;
  }

  return (
    <List sx={{ width: '100%' }}>
      {citations.map((citation, index) => (
        <Box key={citation.id}>
          <ListItem alignItems="flex-start">
            <ListItemText
              primary={citation.title}
              secondary={
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                  {citation.url && (
                    <Link href={citation.url} target="_blank" rel="noopener noreferrer" display="flex" alignItems="center" sx={{ mr: 1 }}>
                      <OpenInNewIcon fontSize="small" sx={{ mr: 0.5 }} />
                      {citation.url}
                    </Link>
                  )}
                  
                  <Box display="flex" alignItems="center">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DescriptionIcon />}
                      onClick={() => handleOpenFile(citation.file_path)}
                      sx={{ mr: 1 }}
                    >
                      Open PDF
                    </Button>
                    <Typography variant="caption">
                      {citation.file_path}
                    </Typography>
                  </Box>
                  
                  <Typography variant="caption" display="block">
                    Added: {formatDate(citation.created_at)}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
          {index < citations.length - 1 && <Divider />}
        </Box>
      ))}
    </List>
  );
}

export default CitationList;