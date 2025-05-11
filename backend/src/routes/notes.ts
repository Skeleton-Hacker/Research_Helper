import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import db from '../models/database';
import { validateProjectExists } from '../utils/validators';

const router = express.Router();

// Define a constant for the absolute data directory path at the application root
const DATA_DIR = path.resolve(process.cwd(), 'data');

// Helper function to ensure directories exist using project name
const ensureProjectDir = async (projectId: number): Promise<{ notesDir: string, projectName: string }> => {
  try {
    // Get the project name from the database using project ID
    const project = await db.get('SELECT name FROM projects WHERE id = ?', [projectId]);
    
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }
    
    // Sanitize project name for filesystem use
    const projectName = project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    // Create project directory structure using the project name
    const projectDir = path.join(DATA_DIR, 'projects', projectName);
    const notesDir = path.join(projectDir, 'notes');
    
    await fs.mkdir(projectDir, { recursive: true });
    await fs.mkdir(notesDir, { recursive: true });
    console.log(`Created or confirmed directory: ${notesDir}`);
    
    return { notesDir, projectName };
  } catch (err) {
    console.error('Error creating project directory:', err);
    throw new Error('Failed to create project directory');
  }
};

/**
 * GET /api/notes
 * Get all notes
 */
router.get('/', async (req, res) => {
  try {
    const notes = await db.all(`
      SELECT n.id, n.title, n.file_path, n.tags, n.project_id, n.created_at
      FROM notes n
      ORDER BY n.created_at DESC
    `);
    
    // Read note content from files
    const notesWithContent = await Promise.all(notes.map(async (note: any) => {
      try {
        // Read content from file if file_path exists
        if (note.file_path) {
          console.log(`Reading note from: ${note.file_path}`);
          const content = await fs.readFile(note.file_path, 'utf-8');
          return { ...note, content, tags: JSON.parse(note.tags || '[]') };
        }
        return { ...note, content: '', tags: JSON.parse(note.tags || '[]') };
      } catch (err) {
        console.error(`Error reading note file ${note.file_path}:`, err);
        return { ...note, content: '', tags: JSON.parse(note.tags || '[]') };
      }
    }));
    
    res.json(notesWithContent);
  } catch (err) {
    console.error('Error getting notes:', err);
    res.status(500).json({ error: 'Failed to get notes' });
  }
});

/**
 * POST /api/notes
 * Create a new note
 */
router.post('/', async (req, res) => {
  try {
    const { title, content, tags, project_id } = req.body;
    
    if (!title || !project_id) {
      return res.status(400).json({ error: 'Title and project_id are required' });
    }
    
    // Ensure project exists
    const projectExists = await validateProjectExists(project_id);
    if (!projectExists) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Ensure project directory exists and get notes directory using project name
    const { notesDir, projectName } = await ensureProjectDir(project_id);
    
    // Generate a clean filename for the note (without timestamp prefix)
    const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    let filename = `${sanitizedTitle}.md`;
    let filePath = path.join(notesDir, filename);
    
    // Check if a file with this name already exists
    try {
      await fs.access(filePath);
      // If we get here, a file with this name already exists
      console.log(`A note with filename ${filename} already exists, using unique name`);
      
      // Add the current date to make it unique without using a counter
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      filename = `${sanitizedTitle}_${dateStr}.md`;
      filePath = path.join(notesDir, filename);
    } catch (err) {
      // File doesn't exist, which is what we want
    }
    
    // Write content to file
    await fs.writeFile(filePath, content || '');
    console.log(`Note saved to: ${filePath}`);
    
    // Insert note reference in database
    const result = await db.run(`
      INSERT INTO notes (title, file_path, tags, project_id, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `, [title, filePath, JSON.stringify(tags || []), project_id]);
    
    const newNote = await db.get('SELECT * FROM notes WHERE id = ?', [result.lastID]);
    
    if (!newNote) {
      throw new Error('Failed to retrieve the created note');
    }
    
    res.status(201).json({
      ...newNote,
      content,
      tags: tags || [],
      versions: []
    });
  } catch (err) {
    console.error('Error creating note:', err);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

/**
 * PUT /api/notes/:id
 * Update a note
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags, project_id } = req.body;
    
    // Get current note to check if file path changes
    const currentNote = await db.get('SELECT * FROM notes WHERE id = ?', [id]);
    if (!currentNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    let filePath = currentNote.file_path;
    
    // If project changed or title changed, we may need to move the file
    const titleChanged = title !== currentNote.title;
    const projectChanged = project_id !== currentNote.project_id;
    
    if (projectChanged || titleChanged) {
      // Get the target project directory
      const { notesDir } = await ensureProjectDir(project_id);
      
      // Generate a clean filename for the note (without timestamp prefix)
      const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      let filename = `${sanitizedTitle}.md`;
      let newFilePath = path.join(notesDir, filename);
      
      // Check if target file already exists (and it's not the same file)
      if (newFilePath !== currentNote.file_path) {
        try {
          await fs.access(newFilePath);
          // File exists, make the name unique with date
          const date = new Date();
          const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
          filename = `${sanitizedTitle}_${dateStr}.md`;
          newFilePath = path.join(notesDir, filename);
        } catch (err) {
          // File doesn't exist, which is good
        }
      }
      
      // Copy content to new location
      await fs.writeFile(newFilePath, content || '');
      console.log(`Note saved to: ${newFilePath}`);
      
      // Try to remove the old file (but don't fail if it doesn't work)
      if (newFilePath !== currentNote.file_path) {
        try {
          await fs.unlink(currentNote.file_path);
          console.log(`Deleted old file: ${currentNote.file_path}`);
        } catch (err) {
          console.warn(`Could not delete old note file: ${currentNote.file_path}`);
        }
      }
      
      // Update the file path
      filePath = newFilePath;
    } else {
      // Just update the existing file
      await fs.writeFile(currentNote.file_path, content || '');
      console.log(`Updated note at: ${currentNote.file_path}`);
    }
    
    // Update note in database
    await db.run(`
      UPDATE notes
      SET title = ?, file_path = ?, tags = ?, project_id = ?
      WHERE id = ?
    `, [title, filePath, JSON.stringify(tags || []), project_id, id]);
    
    const updatedNote = await db.get('SELECT * FROM notes WHERE id = ?', [id]);
    
    res.json({
      ...updatedNote,
      content,
      tags: tags || [],
      versions: []
    });
  } catch (err) {
    console.error('Error updating note:', err);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

export default router;