import express from 'express';
import db from '../models/database';
import { validateProjectExists } from '../utils/validators';

const router = express.Router();

// Define an interface for the database note type
interface DBNote {
  id: number;
  title: string;
  content: string;
  tags: string; // This is stored as a JSON string in the database
  project_id: number;
  created_at: string;
  versions: string; // This is stored as a JSON string in the database
}

// Define a type for note versions
interface NoteVersion {
  content: string;
  timestamp: string;
}

// Define the processed note type that will be sent to the client
interface Note extends Omit<DBNote, 'tags' | 'versions'> {
  tags: string[]; // After parsing, this becomes an array
  versions: NoteVersion[]; // After parsing, this becomes an array of versions
}

/**
 * GET /api/notes
 * Retrieves all notes from the database, ordered by creation date (newest first)
 */
router.get('/', (req, res) => {
  db.all('SELECT * FROM notes ORDER BY created_at DESC', (err, notes: DBNote[]) => {
    if (err) {
      console.error('Error fetching notes:', err);
      return res.status(500).json({ error: 'Failed to fetch notes' });
    }
    
    // Parse JSON strings back to objects for client-side use
    const processedNotes = notes.map(note => ({
      ...note,
      tags: JSON.parse(note.tags || '[]'),
      versions: JSON.parse(note.versions || '[]')
    }));
    
    res.json(processedNotes);
  });
});

/**
 * POST /api/notes
 * Creates a new note in the database
 * Body should contain:
 * - title: string (required)
 * - content: string
 * - tags: string[] (optional)
 * - project_id: number (required)
 */
router.post('/', (req, res) => {
  const { title, content, tags, project_id } = req.body;
  
  // Validate required fields
  if (!title || !project_id) {
    return res.status(400).json({ error: 'Title and project_id are required' });
  }
  
  // Check if the project exists
  validateProjectExists(project_id, (err, exists) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!exists) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Initialize versions as an empty array with explicit type
    const versions: NoteVersion[] = [];
    
    // Convert tags to JSON string if it's an array
    const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : '[]';
    const versionsJson = JSON.stringify(versions);
    
    // Insert the new note
    db.run(
      'INSERT INTO notes (title, content, tags, project_id, versions) VALUES (?, ?, ?, ?, ?)',
      [title, content || '', tagsJson, project_id, versionsJson],
      function(err) {
        if (err) {
          console.error('Error creating note:', err);
          return res.status(500).json({ error: 'Failed to create note' });
        }
        
        const noteId = this.lastID;
        
        // Fetch the inserted note to return to client
        db.get('SELECT * FROM notes WHERE id = ?', [noteId], (err, note: DBNote) => {
          if (err) {
            console.error('Error fetching new note:', err);
            return res.status(500).json({ error: 'Note created but failed to retrieve' });
          }
          
          // Parse JSON strings back to objects
          const processedNote: Note = {
            ...note,
            tags: JSON.parse(note.tags || '[]'),
            versions: JSON.parse(note.versions || '[]')
          };
          
          res.status(201).json(processedNote);
        });
      }
    );
  });
});

export default router;