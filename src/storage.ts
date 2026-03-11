import type { Project } from "./types";

const STORAGE_KEY = "task-time-tracker";

const DEFAULT_PROJECT: Project = {
  title: "My Project",
  description: "Click to edit this description",
  tasks: [],
};

// --- localStorage (offline fallback / cache) ---

export function loadProjectFromLocal(): Project {
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

export function saveProjectToLocal(project: Project): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  } catch (e) {
    console.error("Failed to save project to localStorage", e);
  }
}

// --- API (cloud storage via Azure) ---

export async function loadProjectFromAPI(): Promise<Project> {
  const res = await fetch("/api/project");
  if (res.status === 401) {
    throw new Error("Not authenticated");
  }
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) detail = body.error;
    } catch {
      // ignore parse error
    }
    throw new Error(`Failed to load project from API: ${detail}`);
  }
  return (await res.json()) as Project;
}

export async function saveProjectToAPI(project: Project): Promise<void> {
  const res = await fetch("/api/project", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) detail = body.error;
    } catch {
      // ignore parse error
    }
    throw new Error(`Failed to save project to API: ${detail}`);
  }
}

// --- Auth helpers ---

export interface UserInfo {
  userId: string;
  userDetails: string; // email or display name
  identityProvider: string;
}

export async function getAuthUser(): Promise<UserInfo | null> {
  try {
    const res = await fetch("/.auth/me");
    if (!res.ok) return null;
    const data = await res.json();
    const principal = data?.clientPrincipal;
    if (!principal) return null;
    return {
      userId: principal.userId,
      userDetails: principal.userDetails,
      identityProvider: principal.identityProvider,
    };
  } catch {
    return null;
  }
}