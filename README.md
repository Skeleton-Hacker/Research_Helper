# Research Helper

Research Helper is a tool designed to assist researchers in organizing their academic work efficiently. This application helps manage research projects, notes, citations, and tasks in one centralized location.

## Features

- **Project Management**: Create, view, edit and delete research projects
- **Note Taking**: Add and organize notes for each project
- **Citation Manager**: Store and manage citations from various sources including arXiv
- **Task Management**: Create and track tasks with deadlines and status updates
- **User-friendly Interface**: Clean, intuitive dashboard with a responsive layout

## Technologies Used

- **Frontend**: React with TypeScript, Material UI
- **Backend**: Node.js with Express
- **Database**: SQLite for data storage
- **File System**: Local storage for project files and data

## Getting Started

### Prerequisites

- Node.js (v14.0 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Skeleton-Hacker/Research_Helper.git
   cd research-helper
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

4. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

Go to the root directory and run the commands
```bash
npm run build
npm start
```

## Usage Guide

### Projects

1. Navigate to the Projects tab from the sidebar
2. Click "NEW PROJECT" to create a new research project
3. Enter a name for your project and click "Create"
4. Click on a project card to view its details and associated notes, citations, and tasks

### Notes

1. Select a project and navigate to the Notes tab
2. Click "Add Note" to create a new note
3. Enter title, content, and optionally add tags
4. Notes are saved automatically as you type

### Citations

1. Select a project and navigate to the Citations tab
2. Click "Add Citation" to manually add a citation, or use the built-in arXiv search
3. Fill in the required citation details and click "Save"

### Tasks

1. Navigate to the Tasks tab to view all tasks across projects, or
2. Select a project and navigate to its Tasks tab to view project-specific tasks
3. Click "NEW TASK" to create a task
4. Set title, due date, description, and status
5. Tasks can be filtered and sorted by status and due date

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

For additional help or questions, please open an issue in the GitHub repository.