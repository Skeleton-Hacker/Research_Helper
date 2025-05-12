import { useState } from 'react';
import { Box, Container, CssBaseline } from '@mui/material';
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