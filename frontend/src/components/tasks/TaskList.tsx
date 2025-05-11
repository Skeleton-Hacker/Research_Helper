import { 
  List, ListItem, ListItemText, Typography, Divider, Box,
  CircularProgress, Chip, IconButton, Menu, MenuItem
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';
import { Task } from './TaskSection';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onStatusUpdate: (taskId: number, status: 'pending' | 'in-progress' | 'completed') => void;
}

function TaskList({ tasks, loading, error, onStatusUpdate }: TaskListProps) {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  
  // Format the date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, taskId: number) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedTaskId(taskId);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedTaskId(null);
  };
  
  const handleStatusChange = (newStatus: 'pending' | 'in-progress' | 'completed') => {
    if (selectedTaskId !== null) {
      onStatusUpdate(selectedTaskId, newStatus);
    }
    handleMenuClose();
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'in-progress': return 'primary';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center"><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (tasks.length === 0) {
    return <Typography>No tasks found. Create your first task above.</Typography>;
  }

  return (
    <List sx={{ width: '100%' }}>
      {tasks.map((task, index) => (
        <Box key={task.id}>
          <ListItem 
            alignItems="flex-start"
            secondaryAction={
              <IconButton edge="end" onClick={(e) => handleMenuOpen(e, task.id)}>
                <MoreVertIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="subtitle1">{task.title}</Typography>
                  <Chip 
                    label={task.status} 
                    size="small" 
                    color={getStatusColor(task.status) as any}
                    sx={{ textTransform: 'capitalize' }} 
                  />
                </Box>
              }
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" component="span">
                    Due: {formatDate(task.due_date)}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
          {index < tasks.length - 1 && <Divider />}
        </Box>
      ))}
      
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleStatusChange('pending')}>Mark as Pending</MenuItem>
        <MenuItem onClick={() => handleStatusChange('in-progress')}>Mark as In Progress</MenuItem>
        <MenuItem onClick={() => handleStatusChange('completed')}>Mark as Completed</MenuItem>
      </Menu>
    </List>
  );
}

export default TaskList;