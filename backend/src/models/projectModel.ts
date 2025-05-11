import db from './database';

interface Project {
  id?: number;
  name: string;
  created_at?: string;
}

class ProjectModel {
  /**
   * Create a new project
   * @param name Project name
   * @returns Promise resolving to the new project ID
   */
  async create(name: string): Promise<number> {
    // Use the Promise-based API
    const result = await db.run('INSERT INTO projects (name) VALUES (?)', [name]);
    return result.lastID;
  }

  /**
   * Get all projects
   * @returns Promise resolving to array of projects
   */
  async getAll(): Promise<Project[]> {
    // Use the Promise-based API
    return await db.all<Project>('SELECT * FROM projects ORDER BY created_at DESC');
  }

  /**
   * Get a project by ID
   * @param id Project ID
   * @returns Promise resolving to the project or null if not found
   */
  async getById(id: number): Promise<Project | null> {
    // Use the Promise-based API
    const project = await db.get<Project>('SELECT * FROM projects WHERE id = ?', [id]);
    return project || null;
  }
}

export default new ProjectModel();
export { Project };