import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs/promises';  // Change to fs/promises
import { existsSync, mkdirSync } from 'fs';  // Import specific sync functions
import { promisify } from 'util';

// Define interfaces for SQLite results
interface RunResult {
  lastID: number;
  changes: number;
}

// Extend the Database class with proper TypeScript types
class TypedDatabase {
  private db: sqlite3.Database;

  constructor(db: sqlite3.Database) {
    this.db = db;
  }

  async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  }

  async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row as T);
      });
    });
  }

  async run(sql: string, params: any[] = []): Promise<RunResult> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  async exec(sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

// Use absolute path for data directory
const DATA_DIR = path.resolve(process.cwd(), 'data');
console.log(`Data directory set to: ${DATA_DIR}`);

// Ensure data directory exists (use sync version for startup)
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
  console.log(`Created data directory: ${DATA_DIR}`);
}

// Database file path
const dbPath = path.join(DATA_DIR, 'research_helper.db');
console.log(`Database path: ${dbPath}`);

// Create database connection
const sqliteDb = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the SQLite database at:', dbPath);
    initializeDatabase();
  }
});

// Create a typed wrapper around the database
const db = new TypedDatabase(sqliteDb);

// Initialize database schema
async function initializeDatabase() {
  sqliteDb.serialize(() => {
    // Create projects table
    sqliteDb.run(`CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create notes table
    sqliteDb.run(`CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      file_path TEXT, /* Path to the file on disk */
      tags TEXT, /* Stored as JSON array */
      project_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      versions TEXT, /* Stored as JSON array of previous versions */
      FOREIGN KEY (project_id) REFERENCES projects (id)
    )`);

    // Create citations table 
    sqliteDb.run(`CREATE TABLE IF NOT EXISTS citations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT,
      file_path TEXT, /* Relative path to the PDF file */
      annotations TEXT, /* Stored as JSON array */
      project_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id)
    )`);

    // Create tasks table
    sqliteDb.run(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      due_date DATETIME,
      status TEXT DEFAULT 'pending',
      project_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id)
    )`);

    console.log('Database schema initialized successfully');
  });

  // Add directory_path column to projects table
  await db.exec(`
    ALTER TABLE projects ADD COLUMN directory_path TEXT;
  `).catch(err => {
    // Ignore error if column already exists
    if (!err.message.includes('duplicate column')) {
      console.error('Error adding directory_path column:', err);
    }
  });

  // Update existing projects that might not have a directory path
  const projects = await db.all('SELECT id, name FROM projects WHERE directory_path IS NULL');
  for (const project of projects) {
    const sanitizedName = project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const projectDir = path.join(DATA_DIR, 'projects', sanitizedName);
    
    // Create the directory if it doesn't exist
    try {
      // Now using fs/promises version which works correctly with await
      await fs.mkdir(projectDir, { recursive: true });
      await fs.mkdir(path.join(projectDir, 'notes'), { recursive: true });
      await fs.mkdir(path.join(projectDir, 'citations'), { recursive: true });
      
      // Update the project with the new directory path
      await db.run('UPDATE projects SET directory_path = ? WHERE id = ?', 
        [projectDir, project.id]);
      
      console.log(`Updated project "${project.name}" with directory path: ${projectDir}`);
    } catch (err) {
      console.error(`Error updating project "${project.name}":`, err);
    }
  }
}

export default db;