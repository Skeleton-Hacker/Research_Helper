export interface Project {
  id?: number;
  name: string;
  created_at?: string;
}

export interface Note {
  id?: number;
  title: string;
  content: string;
  tags: string; // JSON array as string
  project_id: number;
  created_at?: string;
  versions: string; // JSON array as string
}

export interface Citation {
  id?: number;
  title: string;
  url: string;
  file_path: string;
  annotations: string; // JSON array as string
  project_id: number;
  created_at?: string;
}

export interface Task {
  id?: number;
  title: string;
  due_date?: string;
  status: string;
  project_id: number;
  created_at?: string;
}