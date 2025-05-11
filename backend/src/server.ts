import express from 'express';
import cors from 'cors';
import path from 'path';
import bodyParser from 'body-parser';

// Import routes
import projectRoutes from './routes/projects';

// Initialize Express app
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the data directory
app.use('/data', express.static(path.join(__dirname, '../../data')));

// Set up routes
app.use('/api/projects', projectRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Research Helper API is running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Server is shutting down...');
  process.exit(0);
});