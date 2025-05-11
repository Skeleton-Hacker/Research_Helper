import express from 'express';
import db from '../models/database';
import { validateProjectExists } from '../utils/validators';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const researchHelperDir = path.join(__dirname, '..', '..', '..', 'research_helper');

// Define interfaces for our database and client types
interface DBCitation {
  id: number;
  title: string;
  url: string;
  file_path: string;
  annotations: string | null; // Stored as JSON string in database
  project_id: number;
  created_at: string;
}

interface Citation extends Omit<DBCitation, 'annotations'> {
  annotations: any[]; // Converted to array after parsing
}

// Helper function to extract error messages
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err) 
    return String(err.message);
  return 'Unknown error';
}

// Ensure the research_helper directory exists
fs.mkdirSync(researchHelperDir, { recursive: true });

/**
 * GET /api/citations
 * Retrieves all citations from the database, ordered by creation date (newest first)
 */
router.get('/', (req, res) => {
  db.all('SELECT * FROM citations ORDER BY created_at DESC', (err, citations: DBCitation[]) => {
    if (err) {
      console.error('Error fetching citations:', err);
      return res.status(500).json({ error: 'Failed to fetch citations' });
    }
    
    // Parse annotations if they exist
    const processedCitations: Citation[] = citations.map(citation => ({
      ...citation,
      annotations: citation.annotations ? JSON.parse(citation.annotations) : []
    }));
    
    res.json(processedCitations);
  });
});

/**
 * POST /api/citations
 * Creates a new citation, downloads the PDF, and stores its metadata
 * Body should contain:
 * - title: string (required)
 * - url: string (required)
 * - project_id: number (required)
 */
router.post('/', async (req, res) => {
  try {
    const { title, url, project_id } = req.body;
    
    // Validate required fields
    if (!title || !url || !project_id) {
      return res.status(400).json({ error: 'Title, URL, and project_id are required' });
    }
    
    // Check if the project exists
    validateProjectExists(project_id, async (err, exists) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!exists) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      try {
        // Create directory for project papers if it doesn't exist
        const projectDir = path.join(researchHelperDir, 'projects', project_id.toString(), 'papers');
        fs.mkdirSync(projectDir, { recursive: true });
        
        // Generate a file name based on title (sanitize it)
        const fileName = title
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .replace(/_+/g, '_') + '.pdf';
        
        const filePath = path.join(projectDir, fileName);
        const relativeFilePath = path.join('research_helper', 'projects', project_id.toString(), 'papers', fileName);
        
        // Download the PDF
        console.log(`Downloading PDF from ${url}...`);
        const response = await axios({
          method: 'GET',
          url: url,
          responseType: 'stream'
        });
        
        // Save the PDF to disk
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        
        // Wait for download to complete
        await new Promise<void>((resolve, reject) => {
          writer.on('finish', () => resolve());
          writer.on('error', (err) => reject(err));
        });
        
        console.log(`PDF saved to ${filePath}`);
        
        // Save citation to database
        db.run(
          'INSERT INTO citations (title, url, file_path, project_id) VALUES (?, ?, ?, ?)',
          [title, url, relativeFilePath, project_id],
          function(err) {
            if (err) {
              console.error('Error creating citation:', err);
              return res.status(500).json({ error: 'Failed to create citation' });
            }
            
            const citationId = this.lastID;
            1
            // Fetch the inserted citation to return to client
            db.get('SELECT * FROM citations WHERE id = ?', [citationId], (err, citation: DBCitation) => {
              if (err) {
                console.error('Error fetching new citation:', err);
                return res.status(500).json({ error: 'Citation created but failed to retrieve' });
              }
              
              // Process citation for client response
              const processedCitation: Citation = {
                ...citation,
                annotations: citation.annotations ? JSON.parse(citation.annotations) : []
              };
              
              res.status(201).json(processedCitation);
            });
          }
        );
      } catch (err) {
        console.error('Error processing citation:', err);
        res.status(500).json({ error: 'Failed to process citation: ' + getErrorMessage(err) });
      }
    });
  } catch (err) {
    console.error('Error in citation endpoint:', err);
    res.status(500).json({ error: 'Server error: ' + getErrorMessage(err) });
  }
});

export default router;