import type { Project } from "./types";

const STORAGE_KEY = "task-time-tracker";

const DEFAULT_PROJECT: Project = {
  title: "My Project",
  description: "Click to edit this description",
  tasks: [],
};

export function loadProject(): Project {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as Project;
    }
  } catch (e) {
    console.error("Failed to load project from localStorage", e);
  }
  return { ...DEFAULT_PROJECT, tasks: [] };
}

export function saveProject(project: Project): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  } catch (e) {
    console.error("Failed to save project to localStorage", e);
  }
}