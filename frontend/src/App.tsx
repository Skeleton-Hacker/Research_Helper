import { useState } from 'react';

import { Box, Container, CssBaseline, AppBar, Toolbar, Typography } from '@mui/material';
import { Sidebar } from './components/Layout';
import ProjectSection from './components/projects/ProjectSection';
import ProjectDetail from './components/projects/ProjectDetail';
import NoteSection from './components/notes/NoteSection';
import CitationSection from './components/citations/CitationSection';
import TaskSection from './components/tasks/TaskSection';
import { Project } from './components/projects/ProjectSection';

function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentView, setCurrentView] = useState('projects');

  const handleNavigation = (view: string) => {
    setCurrentView(view);
    if (view !== 'projects' && selectedProject) {
      setSelectedProject(null);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Blue header bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: "#1976d2" }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ color: "white", fontWeight: "600" }}>
            Research Helper
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Sidebar onNavigate={handleNavigation} currentView={currentView} />
      
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Container maxWidth="lg">
          {currentView === 'projects' && !selectedProject && (
            <ProjectSection onProjectSelect={handleProjectSelect} />
          )}
          
          {currentView === 'projects' && selectedProject && (
            <Box>
              <ProjectDetail 
                project={selectedProject} 
                onBack={handleBackToProjects} 
              />
            </Box>
          )}
          
          {currentView === 'notes' && <NoteSection />}
          {currentView === 'citations' && <CitationSection />}
          {currentView === 'tasks' && <TaskSection />}
        </Container>
      </Box>
    </Box>
  );
}

export default App;