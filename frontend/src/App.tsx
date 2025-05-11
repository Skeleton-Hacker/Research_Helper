import { useState } from 'react';
import { 
  Box, 
  CssBaseline, 
  Container, 
  Typography, 
  AppBar, 
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import ProjectSection from './components/projects/ProjectSection';
import NoteSection from './components/notes/NoteSection';
import CitationSection from './components/citations/CitationSection';
import TaskSection from './components/tasks/TaskSection';

// Import icons for the sidebar
import FolderIcon from '@mui/icons-material/Folder';
import NoteIcon from '@mui/icons-material/Note';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TaskIcon from '@mui/icons-material/CheckCircleOutline';

// Define drawer width
const drawerWidth = 240;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`sidebar-tabpanel-${index}`}
      aria-labelledby={`sidebar-tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function App() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleListItemClick = (index: number) => {
    setSelectedIndex(index);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Research Helper
          </Typography>
        </Toolbar>
      </AppBar>
      
      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            marginTop: '64px' // Adjust based on AppBar height
          },
        }}
      >
        <List>
          <ListItem disablePadding>
            <ListItemButton
              selected={selectedIndex === 0}
              onClick={() => handleListItemClick(0)}
            >
              <ListItemIcon>
                <FolderIcon />
              </ListItemIcon>
              <ListItemText primary="Projects" />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton
              selected={selectedIndex === 1}
              onClick={() => handleListItemClick(1)}
            >
              <ListItemIcon>
                <NoteIcon />
              </ListItemIcon>
              <ListItemText primary="Notes" />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton
              selected={selectedIndex === 2}
              onClick={() => handleListItemClick(2)}
            >
              <ListItemIcon>
                <MenuBookIcon />
              </ListItemIcon>
              <ListItemText primary="Citations" />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton
              selected={selectedIndex === 3}
              onClick={() => handleListItemClick(3)}
            >
              <ListItemIcon>
                <TaskIcon />
              </ListItemIcon>
              <ListItemText primary="Tasks" />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
      </Drawer>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3,
          marginTop: '64px', // Adjust based on AppBar height
          overflow: 'auto'
        }}
      >
        <Container maxWidth="lg">
          <TabPanel value={selectedIndex} index={0}>
            <ProjectSection />
          </TabPanel>
          <TabPanel value={selectedIndex} index={1}>
            <NoteSection />
          </TabPanel>
          <TabPanel value={selectedIndex} index={2}>
            <CitationSection />
          </TabPanel>
          <TabPanel value={selectedIndex} index={3}>
            <TaskSection />
          </TabPanel>
        </Container>
      </Box>
    </Box>
  );
}

export default App;