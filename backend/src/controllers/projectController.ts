import { Request, Response } from 'express';
import projectModel from '../models/projectModel';
import fileHelper from '../utils/fileHelper';

class ProjectController {
  /**
   * Create a new project and its directory structure
   * @param req Request object with project name
   * @param res Response object
   */
  async createProject(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.body;
      
      if (!name) {
        res.status(400).json({ error: 'Project name is required' });
        return;
      }
      
      // Create project in database
      const projectId = await projectModel.create(name);
      
      // Create project directories
      const projectPath = fileHelper.createProjectDirectories(projectId, name);
      
      res.status(201).json({
        id: projectId,
        name,
        path: projectPath,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  }

  /**
   * Get all projects
   * @param req Request object
   * @param res Response object
   */
  async getAllProjects(req: Request, res: Response): Promise<void> {
    try {
      const projects = await projectModel.getAll();
      res.json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  }

  /**
   * Get a project by ID
   * @param req Request object with project ID
   * @param res Response object
   */
  async getProjectById(req: Request, res: Response): Promise<void> {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        res.status(400).json({ error: 'Invalid project ID' });
        return;
      }
      
      const project = await projectModel.getById(projectId);
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      
      res.json(project);
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  }
}

export default new ProjectController();