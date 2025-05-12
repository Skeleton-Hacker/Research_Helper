import { 
  Box, Typography, Card, CardContent, CardActions, 
  Grid, IconButton, Tooltip, Link
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import { Citation } from './CitationSection';

interface CitationListProps {
  citations: Citation[];
  loading: boolean;
  error: string | null;
  onEdit?: (citationId: number) => void;
  onDelete?: (citationId: number) => void;
}

function CitationList({ citations, loading, error, onEdit, onDelete }: CitationListProps) {
  if (error) {
    return <Typography color="error">{error}</Typography>;
  }
  
  if (citations.length === 0 && !loading) {
    return <Typography>No citations found.</Typography>;
  }

  return (
    <Grid container spacing={3}>
      {citations.map(citation => (
        <Grid item xs={12} md={6} key={citation.id}>
          <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>{citation.title}</Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Authors:</strong> {citation.authors}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Publication:</strong> {citation.publication}
                {citation.year ? ` (${citation.year})` : ''}
              </Typography>
              
              {(citation.doi || citation.url) && (
                <Box sx={{ mt: 2 }}>
                  {citation.doi && (
                    <Tooltip title="View DOI">
                      <Link 
                        href={`https://doi.org/${citation.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}
                      >
                        <LinkIcon fontSize="small" sx={{ mr: 0.5 }} />
                        DOI: {citation.doi}
                      </Link>
                    </Tooltip>
                  )}
                  
                  {citation.url && (
                    <Tooltip title="Open URL">
                      <Link 
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ display: 'flex', alignItems: 'center' }}
                      >
                        <LinkIcon fontSize="small" sx={{ mr: 0.5 }} />
                        View Source
                      </Link>
                    </Tooltip>
                  )}
                </Box>
              )}
            </CardContent>
            
            {(onEdit || onDelete) && (
              <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                {onEdit && (
                  <Tooltip title="Edit">
                    <IconButton 
                      size="small" 
                      onClick={() => onEdit(citation.id)}
                      aria-label="edit citation"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                
                {onDelete && (
                  <Tooltip title="Delete">
                    <IconButton 
                      size="small" 
                      onClick={() => onDelete(citation.id)}
                      aria-label="delete citation"
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

export default CitationList;