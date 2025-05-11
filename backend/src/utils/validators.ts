import db from '../models/database';

/**
 * Validates that a project with the given ID exists in the database
 * @param projectId - The ID of the project to check
 * @param callback - Callback function with error and boolean result
 */
export function validateProjectExists(
  projectId: number, 
  callback: (err: Error | null, exists: boolean) => void
) {
  db.get('SELECT id FROM projects WHERE id = ?', [projectId], (err, project) => {
    if (err) {
      console.error('Error checking project existence:', err);
      return callback(err, false);
    }
    callback(null, !!project);
  });
}