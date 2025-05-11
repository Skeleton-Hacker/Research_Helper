import express from 'express';
import projectController from '../controllers/projectController';

const router = express.Router();

// POST /api/projects - Create a new project
router.post('/', projectController.createProject);

// GET /api/projects - Get all projects
router.get('/', projectController.getAllProjects);

// GET /api/projects/:id - Get a project by ID
router.get('/:id', projectController.getProjectById);

export default router;