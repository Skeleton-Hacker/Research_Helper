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

// Update the Note interface to include file path
interface Note {
  id: number;
  title: string;
  content: string;
  file_path: string; // New field to store path to the note file
  tags: string[];
  project_id: number;
  created_at: string;
  versions: any[];
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
  
  // Note APIs
  notes: {
    getAll: async (): Promise<Note[]> => {
      try {
        const response = await fetch(`${API_URL}/notes`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching notes:', error);
        throw error;
      }
    },
    
    create: async (params: {
      title: string;
      content: string;
      tags: string[];
      project_id: number;
    }): Promise<Note> => {
      try {
        const response = await fetch(`${API_URL}/notes`, {
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
        console.error('Error creating note:', error);
        throw error;
      }
    },
    
    update: async (id: number, params: {
      title: string;
      content: string;
      tags: string[];
      project_id: number;
    }): Promise<Note> => {
      try {
        const response = await fetch(`${API_URL}/notes/${id}`, {
          method: 'PUT',
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
        console.error(`Error updating note ${id}:`, error);
        throw error;
      }
    },
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