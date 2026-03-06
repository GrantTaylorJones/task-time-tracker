import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import type { Project } from "./types";
import { loadProject, saveProject } from "./storage";
import HomePage from "./pages/HomePage";
import TaskDetailPage from "./pages/TaskDetailPage";

export default function App() {
  const [project, setProject] = useState<Project>(() => loadProject());

  // Save to localStorage whenever project changes
  useEffect(() => {
    saveProject(project);
  }, [project]);

  function handleUpdate(updated: Project) {
    setProject(updated);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<HomePage project={project} onUpdate={handleUpdate} />}
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