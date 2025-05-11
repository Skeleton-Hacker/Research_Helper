import db from '../models/database';

/**
 * Validates that a project with the given ID exists in the database
 * @param projectId - The ID of the project to check
 * @returns Promise that resolves to a boolean indicating if the project exists
 */
export async function validateProjectExists(projectId: number): Promise<boolean> {
  try {
    const project = await db.get('SELECT id FROM projects WHERE id = ?', [projectId]);
    return !!project;
  } catch (error) {
    console.error('Error checking project existence:', error);
    throw error; // Re-throw to allow the caller to handle it
  }
}