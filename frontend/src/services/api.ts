const API_URL = 'http://localhost:3000/api';

interface Project {
  id: number;
  name: string;
  created_at: string;
}

// Add Task interface
interface Task {
  id: number;
  title: string;
  due_date: string | null;
  status: string;
  project_id: number;
  created_at: string;
}

// Add Citation interface
interface Citation {
  id: number;
  title: string;
  url: string;
  file_path: string;
  annotations: any[];
  project_id: number;
  created_at: string;
}

// Add a proper interface for citation creation parameters
interface CreateCitationParams {
  title: string;
  url: string;
  project_id: number;
}

// API service for making HTTP requests
const api = {
  // Project APIs
  projects: {
    // Get all projects
    getAll: async (): Promise<Project[]> => {
      try {
        const response = await fetch(`${API_URL}/projects`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }
    },
    
    // Get project by ID
    getById: async (id: number): Promise<Project> => {
      try {
        const response = await fetch(`${API_URL}/projects/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error(`Error fetching project ${id}:`, error);
        throw error;
      }
    },
    
    // Create a new project
    create: async (name: string): Promise<Project> => {
      try {
        const response = await fetch(`${API_URL}/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error creating project:', error);
        throw error;
      }
    }
  },
  
  // Note APIs - to be implemented
  notes: {
    // Placeholder functions to be implemented when API endpoints are available
    getAll: async () => [],
    create: async () => ({})
  },
  
  // Citation APIs
  citations: {
    // Get all citations
    getAll: async (): Promise<Citation[]> => {
      try {
        const response = await fetch(`${API_URL}/citations`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching citations:', error);
        throw error;
      }
    },
    
    // Create a new citation
    create: async (params: CreateCitationParams): Promise<Citation> => {
      try {
        const response = await fetch(`${API_URL}/citations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error creating citation:', error);
        throw error;
      }
    }
  },
  
  // Add tasks API
  tasks: {
    // Get all tasks
    getAll: async (): Promise<Task[]> => {
      try {
        const response = await fetch(`${API_URL}/tasks`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
    },
    
    // Create a new task
    create: async (task: { title: string; project_id: number; due_date?: string }): Promise<Task> => {
      try {
        const response = await fetch(`${API_URL}/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(task),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error creating task:', error);
        throw error;
      }
    },
    
    // Update task status
    updateStatus: async (id: number, status: string): Promise<Task> => {
      try {
        const response = await fetch(`${API_URL}/tasks/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error updating task status:', error);
        throw error;
      }
    }
  },
  
  // Add the arXiv API endpoints
  arxiv: {
    search: async (query: string, start = 0, maxResults = 10) => {
      try {
        const response = await fetch(
          `${API_URL}/arxiv/search?query=${encodeURIComponent(query)}&start=${start}&max_results=${maxResults}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error searching arXiv:', error);
        throw error;
      }
    }
  }
};

export default api;