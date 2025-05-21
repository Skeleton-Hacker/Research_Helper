import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, Tab, Box } from '@mui/material';
import axios from 'axios';
import ProjectCitations from '../components/projects/ProjectCitations';
// Import other components as needed

// Interface for the project data
interface Project {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

const ProjectView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/projects/${projectId}`);
        setProject(response.data);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return <div>Loading project...</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="project tabs">
          <Tab label="Overview" />
          <Tab label="Notes" />
          <Tab label="Citations" />
          <Tab label="Tasks" />
        </Tabs>
      </Box>
      <Box sx={{ pt: 2 }}>
        {activeTab === 0 && (
          <div>Project Overview Content</div>
        )}
        {activeTab === 1 && (
          <div>Project Notes Content</div>
        )}
        {activeTab === 2 && (
          <ProjectCitations projectId={Number(projectId)} projectName={project.name} />
        )}
        {activeTab === 3 && (
          <div>Project Tasks Content</div>
        )}
      </Box>
    </Box>
  );
};

export default ProjectView;