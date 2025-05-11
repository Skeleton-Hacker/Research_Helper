import express from 'express';
import path from 'path';
import cors from 'cors';
import projectRoutes from './routes/projects';
import noteRoutes from './routes/notes';
import citationRoutes from './routes/citations';
import taskRoutes from './routes/tasks';
import arxivRoutes from './routes/arxiv'; // Add this import

// Create Express app
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/citations', citationRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/arxiv', arxivRoutes); // Add this line

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist', 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Notes will be stored in: ${path.resolve(process.cwd(), 'data', 'projects')}`);
  console.log(`Projects will be stored in: ${path.resolve(process.cwd(), 'data', 'projects')}`);
  console.log(`Project directories are now named using project names instead of IDs`);
  console.log(`Current working directory: ${process.cwd()}`);
});

export default app;