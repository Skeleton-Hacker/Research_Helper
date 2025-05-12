import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  Box,
  AppBar
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import NoteIcon from '@mui/icons-material/Note';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentIcon from '@mui/icons-material/Assignment';

// Sidebar props interface
interface SidebarProps {
  onNavigate: (view: string) => void;
  currentView: string;
}

// Main sidebar component
export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentView }) => {
  const drawerWidth = 240;
  
  const navItems = [
    { text: 'Projects', icon: <FolderIcon />, view: 'projects' },
    { text: 'Notes', icon: <NoteIcon />, view: 'notes' },
    { text: 'Citations', icon: <MenuBookIcon />, view: 'citations' },
    { text: 'Tasks', icon: <AssignmentIcon />, view: 'tasks' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {navItems.map((item) => (
            <ListItem 
              button 
              key={item.view}
              onClick={() => onNavigate(item.view)}
              selected={currentView === item.view}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                },
                '&.Mui-selected:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.12)',
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

// Header component
interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title = "Research Helper" }) => {
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          {title}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

// Layout component that combines Header and content
interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Header title={title} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default {
  Sidebar,
  Header,
  Layout
};