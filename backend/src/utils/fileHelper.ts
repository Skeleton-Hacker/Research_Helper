import path from 'path';
import fs from 'fs';

class FileHelper {
  private readonly baseDir: string;
  
  constructor() {
    // Base directory for all projects
    this.baseDir = path.join(__dirname, '../../../data/projects');
    
    // Ensure base directory exists
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }
  
  /**
   * Create project directory structure
   * @param projectId The ID of the project
   * @param projectName The name of the project
   * @returns The relative path to the project directory
   */
  createProjectDirectories(projectId: number, projectName: string): string {
    // Create project-specific directory with sanitized name
    const sanitizedName = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const projectDirName = `${projectId}-${sanitizedName}`;
    const projectDir = path.join(this.baseDir, projectDirName);
    
    // Create papers subdirectory
    const papersDir = path.join(projectDir, 'papers');
    
    // Ensure directories exist
    fs.mkdirSync(projectDir, { recursive: true });
    fs.mkdirSync(papersDir, { recursive: true });
    
    console.log(`Created project directories at: ${projectDir}`);
    
    // Return the relative path from the data directory
    return path.relative(path.join(__dirname, '../../..'), projectDir);
  }
  
  /**
   * Get the absolute path for a relative path
   * @param relativePath The relative path
   * @returns The absolute path
   */
  getAbsolutePath(relativePath: string): string {
    return path.join(__dirname, '../../..', relativePath);
  }
}

export default new FileHelper();