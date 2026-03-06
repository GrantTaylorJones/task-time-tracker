import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Project, Task } from "../types";
import { generateId, getTodayISO, formatMinutes } from "../utils";

interface HomePageProps {
  project: Project;
  onUpdate: (project: Project) => void;
}

export default function HomePage({ project, onUpdate }: HomePageProps) {
  const navigate = useNavigate();
  const [newTaskName, setNewTaskName] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [titleValue, setTitleValue] = useState(project.title);
  const [descValue, setDescValue] = useState(project.description);

  const isDefaultTitle = project.title === "My Project";
  const isDefaultDesc = project.description === "Click to edit this description";

  function handleAddTask() {
    const name = newTaskName.trim();
    if (!name) return;
    const newTask: Task = {
      id: generateId(),
      name,
      entries: [],
      createdAt: new Date().toISOString(),
    };
    onUpdate({ ...project, tasks: [...project.tasks, newTask] });
    setNewTaskName("");
  }

  function handleIncrement(taskId: string) {
    const tasks = project.tasks.map((t) => {
      if (t.id !== taskId) return t;
      const today = getTodayISO();
      const existingEntry = t.entries.find((e) => e.date === today);
      let entries;
      if (existingEntry) {
        entries = t.entries.map((e) =>
          e.id === existingEntry.id
            ? { ...e, minutes: e.minutes + 30 }
            : e
        );
      } else {
        entries = [
          ...t.entries,
          { id: generateId(), date: today, minutes: 30 },
        ];
      }
      return { ...t, entries };
    });
    onUpdate({ ...project, tasks });
  }

  function handleDeleteTask(taskId: string) {
    const tasks = project.tasks.filter((t) => t.id !== taskId);
    onUpdate({ ...project, tasks });
  }

  function handleSaveTitle() {
    onUpdate({ ...project, title: titleValue });
    setEditingTitle(false);
  }

  function handleSaveDesc() {
    onUpdate({ ...project, description: descValue });
    setEditingDesc(false);
  }

  function getTotalMinutes(task: Task): number {
    return task.entries.reduce((sum, e) => sum + e.minutes, 0);
  }

  function getTodayMinutes(task: Task): number {
    const today = getTodayISO();
    return task.entries
      .filter((e) => e.date === today)
      .reduce((sum, e) => sum + e.minutes, 0);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          {editingTitle ? (
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                className="text-3xl font-bold bg-white border-2 border-blue-400 rounded-lg px-3 py-1 flex-1 outline-none focus:border-blue-600"
                autoFocus
              />
              <button
                onClick={handleSaveTitle}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          ) : (
            <h1
              onClick={() => {
                if (isDefaultTitle) setTitleValue("");
                setEditingTitle(true);
              }}
              className="text-3xl font-bold text-slate-800 cursor-pointer hover:text-blue-600 transition-colors mb-2"
              title="Click to edit"
            >
              {project.title}
            </h1>
          )}

          {editingDesc ? (
            <div className="flex items-start gap-2">
              <textarea
                value={descValue}
                onChange={(e) => setDescValue(e.target.value)}
                className="text-slate-500 bg-white border-2 border-blue-400 rounded-lg px-3 py-2 flex-1 outline-none focus:border-blue-600 resize-none"
                rows={2}
                autoFocus
              />
              <button
                onClick={handleSaveDesc}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          ) : (
            <p
              onClick={() => {
                if (isDefaultDesc) setDescValue("");
                setEditingDesc(true);
              }}
              className="text-slate-500 cursor-pointer hover:text-blue-600 transition-colors"
              title="Click to edit"
            >
              {project.description}
            </p>
          )}
        </div>

        {/* Add Task */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            placeholder="New task name..."
            className="flex-1 border border-slate-300 rounded-lg px-4 py-2 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
          <button
            onClick={handleAddTask}
            disabled={!newTaskName.trim()}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            + Add Task
          </button>
        </div>

        {/* Task List */}
        {project.tasks.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-lg">No tasks yet. Add one above to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {project.tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => navigate(`/task/${task.id}`)}
                  >
                    <h3 className="font-semibold text-slate-800 hover:text-blue-600 transition-colors">
                      {task.name}
                    </h3>
                    <div className="flex gap-4 mt-1 text-sm text-slate-500">
                      <span>Total: {formatMinutes(getTotalMinutes(task))}</span>
                      <span>Today: {formatMinutes(getTodayMinutes(task))}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleIncrement(task.id)}
                      className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                      title="Add 30 minutes for today"
                    >
                      +30m
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-slate-400 hover:text-red-500 px-2 py-1.5 rounded-lg transition-colors"
                      title="Delete task"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {project.tasks.length > 0 && (
          <div className="mt-8 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-medium">Total across all tasks</span>
              <span className="text-lg font-bold text-slate-800">
                {formatMinutes(
                  project.tasks.reduce(
                    (sum, t) => sum + getTotalMinutes(t),
                    0
                  )
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}