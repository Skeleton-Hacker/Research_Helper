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
  create(name: string): Promise<number> {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO projects (name) VALUES (?)',
        [name],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  /**
   * Get all projects
   * @returns Promise resolving to array of projects
   */
  getAll(): Promise<Project[]> {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM projects ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as Project[]);
        }
      });
    });
  }

  /**
   * Get a project by ID
   * @param id Project ID
   * @returns Promise resolving to the project or null if not found
   */
  getById(id: number): Promise<Project | null> {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as Project || null);
        }
      });
    });
  }
}

export default new ProjectModel();
export { Project };