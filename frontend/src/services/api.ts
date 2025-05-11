import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = {
  // Project APIs
  projects: {
    getAll: async () => {
      const response = await axios.get(`${API_URL}/projects`);
      return response.data;
    },
    getById: async (id: number) => {
      const response = await axios.get(`${API_URL}/projects/${id}`);
      return response.data;
    },
    create: async (name: string) => {
      const response = await axios.post(`${API_URL}/projects`, { name });
      return response.data;
    }
  },
  
  // Add other APIs (notes, citations, tasks) later
};

export default api;