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
  authors: string;
  publication: string;
  year: number;
  url?: string;
  doi?: string;
  project_id: number;
  created_at: string;
}

// Add a proper interface for citation creation parameters
interface CreateCitationParams {
  title: string;
  authors: string;
  publication: string;
  year: number;
  url: string; // Assuming this is required based on your error
  doi: string; // Assuming this is required based on your error
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
  updated_at?: string;
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
    create: async (data: { name: string; description?: string }): Promise<Project> => {
      try {
        const response = await fetch(`${API_URL}/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error creating project:', error);
        throw error;
      }
    },

    // Update a project
    update: async (id: number, data: { name: string; description?: string }): Promise<Project> => {
      try {
        const response = await fetch(`${API_URL}/projects/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error(`Error updating project ${id}:`, error);
        throw error;
      }
    },

    // Delete a project
    delete: async (id: number): Promise<void> => {
      try {
        const response = await fetch(`${API_URL}/projects/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to delete project ${id}`);
        }
        
        return;
      } catch (err) {
        console.error(`API Error deleting project ${id}:`, err);
        throw err;
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

    // Update the delete method for notes
    delete: async (id: number, title?: string): Promise<void> => {
      try {
        // Send title as a query parameter to help backend locate the file
        const queryParams = title ? `?title=${encodeURIComponent(title)}` : '';
        const response = await fetch(`${API_URL}/notes/${id}${queryParams}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to delete note (Status: ${response.status})`);
        }
        
        return;
      } catch (err) {
        console.error(`API Error deleting note ${id}:`, err);
        throw err;
      }
    }
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
    },
    
    // Add update method
    update: async (id: number, params: CreateCitationParams): Promise<Citation> => {
      const response = await fetch(`${API_URL}/citations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        throw new Error(`Failed to update citation ${id}`);
      }
      return response.json();
    },
    
    // Add delete method
    delete: async (id: number): Promise<void> => {
      const response = await fetch(`${API_URL}/citations/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Failed to delete citation ${id}`);
      }
      return;
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
    },
    
    // Add the missing delete method
    delete: async (id: number): Promise<void> => {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Failed to delete task ${id}`);
      }
      return;
    },
    
    // Add a full update method for editing tasks
    update: async (id: number, task: {
      title?: string;
      description?: string;
      status?: 'pending' | 'in-progress' | 'completed';
      due_date?: string;
      project_id?: number;
    }): Promise<Task> => {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      if (!response.ok) {
        throw new Error(`Failed to update task ${id}`);
      }
      return response.json();
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