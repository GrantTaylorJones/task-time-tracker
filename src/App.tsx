import { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import type { Project } from "./types";
import {
  loadProjectFromLocal,
  saveProjectToLocal,
  loadProjectFromAPI,
  saveProjectToAPI,
  getAuthUser,
} from "./storage";
import type { UserInfo } from "./storage";
import HomePage from "./pages/HomePage";
import TaskDetailPage from "./pages/TaskDetailPage";

export default function App() {
  const [project, setProject] = useState<Project>(() => loadProjectFromLocal());
  const [user, setUser] = useState<UserInfo | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    getAuthUser().then((u) => {
      setUser(u);
      setAuthChecked(true);
    });
  }, []);

  // Load from API when user is authenticated
  useEffect(() => {
    if (!user) return;
    setSyncing(true);
    loadProjectFromAPI()
      .then((p) => {
        setProject(p);
        saveProjectToLocal(p);
      })
      .catch((err) => {
        console.error("Failed to load from API, using local data:", err);
      })
      .finally(() => setSyncing(false));
  }, [user]);

  // Save handler — saves to localStorage always, and API if authenticated
  const handleUpdate = useCallback(
    (updated: Project) => {
      setProject(updated);
      saveProjectToLocal(updated);

      if (user) {
        saveProjectToAPI(updated).catch((err) => {
          console.error("Failed to save to API:", err);
        });
      }
    },
    [user]
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              project={project}
              onUpdate={handleUpdate}
              user={user}
              authChecked={authChecked}
              syncing={syncing}
            />
          }
        />
        <Route
          path="/task/:taskId"
          element={
            <TaskDetailPage project={project} onUpdate={handleUpdate} />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}