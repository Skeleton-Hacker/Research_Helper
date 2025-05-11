import { BrowserRouter as Router, HashRouter, Routes, Route, Link } from 'react-router-dom';
import { Box, CssBaseline, Drawer, AppBar, Toolbar, List, Typography, Divider, ListItem, ListItemIcon, ListItemText, Container } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import NoteIcon from '@mui/icons-material/Note';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ChecklistIcon from '@mui/icons-material/Checklist';

// Placeholder components for pages
const Projects = () => <Box><Typography variant="h4">Projects</Typography><Typography>Projects will be listed here</Typography></Box>;
const Notes = () => <Box><Typography variant="h4">Notes</Typography><Typography>Notes will be listed here</Typography></Box>;
const Citations = () => <Box><Typography variant="h4">Citations</Typography><Typography>Citations will be listed here</Typography></Box>;
const Tasks = () => <Box><Typography variant="h4">Tasks</Typography><Typography>Tasks will be listed here</Typography></Box>;

// Drawer width
const drawerWidth = 240;

function App() {
  // Use HashRouter for Electron to avoid path issues
  const RouterComponent = window.Electron ? HashRouter : Router;

  return (
    <RouterComponent>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        
        {/* Top app bar */}
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              Research Helper
            </Typography>
          </Toolbar>
        </AppBar>
        
        {/* Sidebar navigation */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Toolbar /> {/* Empty toolbar to offset content below app bar */}
          <Box sx={{ overflow: 'auto' }}>
            <List>
              <ListItem button component={Link} to="/">
                <ListItemIcon><FolderIcon /></ListItemIcon>
                <ListItemText primary="Projects" />
              </ListItem>
              <ListItem button component={Link} to="/notes">
                <ListItemIcon><NoteIcon /></ListItemIcon>
                <ListItemText primary="Notes" />
              </ListItem>
              <ListItem button component={Link} to="/citations">
                <ListItemIcon><MenuBookIcon /></ListItemIcon>
                <ListItemText primary="Citations" />
              </ListItem>
              <ListItem button component={Link} to="/tasks">
                <ListItemIcon><ChecklistIcon /></ListItemIcon>
                <ListItemText primary="Tasks" />
              </ListItem>
            </List>
            <Divider />
          </Box>
        </Drawer>
        
        {/* Main content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar /> {/* Empty toolbar to offset content below app bar */}
          <Container>
            <Routes>
              <Route path="/" element={<Projects />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/citations" element={<Citations />} />
              <Route path="/tasks" element={<Tasks />} />
            </Routes>
          </Container>
        </Box>
      </Box>
    </RouterComponent>
  );
}

export default App;