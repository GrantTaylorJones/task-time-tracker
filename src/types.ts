export interface TimeEntry {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  minutes: number;
}

export interface Task {
  id: string;
  name: string;
  entries: TimeEntry[];
  createdAt: string; // ISO datetime string
}

export interface Project {
  title: string;
  description: string;
  tasks: Task[];
}