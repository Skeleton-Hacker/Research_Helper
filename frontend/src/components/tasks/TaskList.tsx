import { 
  Box, Typography, Card, CardContent, CardActions, 
  Grid, IconButton, Tooltip, FormControl,
  Select, MenuItem, SelectChangeEvent
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Task } from './TaskSection';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onStatusUpdate?: (taskId: number, newStatus: 'pending' | 'in-progress' | 'completed') => void;
  onEdit?: (taskId: number) => void;
  onDelete?: (taskId: number) => void;
}

function TaskList({ tasks, loading, error, onStatusUpdate, onEdit, onDelete }: TaskListProps) {
  if (error) {
    return <Typography color="error">{error}</Typography>;
  }
  
  if (tasks.length === 0 && !loading) {
    return <Typography>No tasks found.</Typography>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4caf50'; // green
      case 'in-progress':
        return '#2196f3'; // blue
      case 'pending':
      default:
        return '#ff9800'; // orange
    }
  };

  const handleStatusChange = (event: SelectChangeEvent<string>, taskId: number) => {
    if (onStatusUpdate) {
      const newStatus = event.target.value as 'pending' | 'in-progress' | 'completed';
      onStatusUpdate(taskId, newStatus);
    }
  };

  // Sort tasks by status and due date
  const sortedTasks = [...tasks].sort((a, b) => {
    // First, sort by status priority: pending > in-progress > completed
    const statusOrder: Record<string, number> = { 'pending': 0, 'in-progress': 1, 'completed': 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    
    // Then, sort by due date (if available)
    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    } else if (a.due_date) {
      return -1; // a has due date, b doesn't
    } else if (b.due_date) {
      return 1; // b has due date, a doesn't
    }
    
    // Finally, sort by creation date
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return (
    <Grid container spacing={3}>
      {sortedTasks.map(task => (
        <Grid item xs={12} md={6} key={task.id}>
          <Card 
            elevation={3} 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderLeft: `4px solid ${getStatusColor(task.status)}`
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">{task.title}</Typography>
                {onStatusUpdate && (
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={task.status}
                      onChange={(e) => handleStatusChange(e, task.id)}
                      variant="outlined"
                      sx={{
                        '.MuiOutlinedInput-notchedOutline': {
                          borderColor: getStatusColor(task.status)
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: getStatusColor(task.status)
                        },
                      }}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="in-progress">In Progress</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Box>
              
              {task.description && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {task.description}
                </Typography>
              )}
              
              {task.due_date && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </CardContent>
            
            {(onEdit || onDelete) && (
              <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                {onEdit && (
                  <Tooltip title="Edit">
                    <IconButton 
                      size="small" 
                      onClick={() => onEdit(task.id)}
                      aria-label="edit task"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                
                {onDelete && (
                  <Tooltip title="Delete">
                    <IconButton 
                      size="small" 
                      onClick={() => onDelete(task.id)}
                      aria-label="delete task"
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

export default TaskList;