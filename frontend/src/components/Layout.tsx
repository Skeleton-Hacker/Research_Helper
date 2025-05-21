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
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: "#1976d2", // Vibrant blue color
        color: "white",
        boxShadow: 3
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            fontWeight: 600,
            flexGrow: 1,
            letterSpacing: 0.5,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Box component="img" 
            src="/logo.png" 
            sx={{ height: 28, mr: 1, display: { xs: 'none', sm: 'block' } }} 
            alt=""
          />
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* You could add additional dashboard elements here */}
          {/* For example: notifications, user profile, etc. */}
        </Box>
      </Toolbar>
      {/* Optional: Add a second toolbar for additional dashboard elements or metrics */}
      <Box 
        sx={{ 
          bgcolor: "rgba(255,255,255,0.1)", 
          display: "flex", 
          px: 2, 
          py: 0.5,
          justifyContent: "space-between"
        }}
      >
        <Typography variant="subtitle2">Welcome to your research workspace</Typography>
        <Typography variant="subtitle2">{new Date().toLocaleDateString()}</Typography>
      </Box>
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