import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import CitationList from './CitationList';
import CitationForm from './CitationForm';
import ArxivSearch from './ArxivSearch';  // Import the new component
import api from '../../services/api';
import { Project } from '../projects/ProjectSection';

export interface Citation {
  id: number;
  title: string;
  url: string;
  file_path: string;
  annotations: any[];
  project_id: number;
  created_at: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function CitationSection() {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Load projects and citations on component mount
  useEffect(() => {
    fetchProjects();
    fetchCitations();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await api.projects.getAll();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError('Failed to load projects');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCitations = async () => {
    try {
      setLoading(true);
      const data = await api.citations.getAll();
      setCitations(data);
      setError(null);
    } catch (err) {
      setError('Failed to load citations');
      console.error('Error loading citations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCitationCreated = (newCitation: Citation) => {
    setCitations([newCitation, ...citations]);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Citations</Typography>
      
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="My Citations" />
        <Tab label="Manual Add" />
        <Tab label="ArXiv Search" />
      </Tabs>
      
      <TabPanel value={tabValue} index={0}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Your Citations</Typography>
          <CitationList 
            citations={citations} 
            loading={loading} 
            error={error} 
          />
        </Paper>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Add New Citation</Typography>
          <CitationForm 
            projects={projects} 
            onCitationCreated={handleCitationCreated}
          />
        </Paper>
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <ArxivSearch 
          projects={projects}
          onPaperAdded={fetchCitations}
        />
      </TabPanel>
    </Box>
  );
}

export default CitationSection;