import path from 'path';
import fs from 'fs/promises';
import db from '../models/database';

const DATA_DIR = path.resolve(process.cwd(), 'data');

async function migrateProjectDirectories() {
  try {
    console.log('Starting project directory migration...');
    
    // Get all projects
    const projects = await db.all('SELECT id, name FROM projects');
    
    for (const project of projects) {
      const oldDir = path.join(DATA_DIR, 'projects', project.id.toString());
      const sanitizedName = project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      // Change from const to let so we can reassign it later
      let newDir = path.join(DATA_DIR, 'projects', sanitizedName);
      
      console.log(`Migrating project "${project.name}" (ID: ${project.id}):`);
      console.log(`  From: ${oldDir}`);
      console.log(`  To: ${newDir}`);
      
      try {
        // Check if old directory exists
        await fs.access(oldDir);
        
        // Check if new directory already exists
        try {
          await fs.access(newDir);
          console.log(`  Target directory already exists, using incremental name`);
          
          // Add a numeric suffix to make the name unique
          let counter = 1;
          let uniqueName = `${sanitizedName}_${counter}`;
          let uniqueDir = path.join(DATA_DIR, 'projects', uniqueName);
          
          while (true) {
            try {
              await fs.access(uniqueDir);
              // Directory exists, try next number
              counter++;
              uniqueName = `${sanitizedName}_${counter}`;
              uniqueDir = path.join(DATA_DIR, 'projects', uniqueName);
            } catch (err) {
              // Directory doesn't exist, we can use this name
              break;
            }
          }
          
          // Update the new directory path (now works with 'let')
          newDir = uniqueDir;
          console.log(`  Using: ${newDir}`);
        } catch (err) {
          // New directory doesn't exist, which is what we want
        }
        
        // Create new directory
        await fs.mkdir(newDir, { recursive: true });
        
        // Copy all files from old to new
        const files = await fs.readdir(oldDir, { withFileTypes: true });
        
        for (const file of files) {
          const oldPath = path.join(oldDir, file.name);
          const newPath = path.join(newDir, file.name);
          
          if (file.isDirectory()) {
            // Create subdirectory in new location
            await fs.mkdir(newPath, { recursive: true });
            
            // Copy files from subdirectory
            const subFiles = await fs.readdir(oldPath);
            for (const subFile of subFiles) {
              const oldSubPath = path.join(oldPath, subFile);
              const newSubPath = path.join(newPath, subFile);
              await fs.copyFile(oldSubPath, newSubPath);
            }
          } else {
            // Copy file
            await fs.copyFile(oldPath, newPath);
          }
        }
        
        // Update file paths in the database
        const notes = await db.all('SELECT id, file_path FROM notes WHERE project_id = ?', [project.id]);
        for (const note of notes) {
          if (note.file_path) {
            const oldPath = note.file_path;
            const fileName = path.basename(oldPath);
            const newPath = path.join(newDir, 'notes', fileName);
            
            await db.run('UPDATE notes SET file_path = ? WHERE id = ?', [newPath, note.id]);
            console.log(`  Updated note path: ${newPath}`);
          }
        }
        
        // Update project directory in the database
        await db.run('UPDATE projects SET directory_path = ? WHERE id = ?', [newDir, project.id]);
        console.log(`  Updated project directory in database`);
        
      } catch (err) {
        // Old directory doesn't exist, create new one from scratch
        console.log(`  Old directory doesn't exist, creating new directory structure`);
        
        await fs.mkdir(newDir, { recursive: true });
        await fs.mkdir(path.join(newDir, 'notes'), { recursive: true });
        await fs.mkdir(path.join(newDir, 'citations'), { recursive: true });
        
        // Update project directory in the database
        await db.run('UPDATE projects SET directory_path = ? WHERE id = ?', [newDir, project.id]);
      }
    }
    
    console.log('Migration completed successfully!');
    
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    process.exit();
  }
}

migrateProjectDirectories();