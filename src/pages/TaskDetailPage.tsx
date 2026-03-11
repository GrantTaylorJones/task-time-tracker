import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Project, TimeEntry } from "../types";
import {
  generateId,
  getTodayISO,
  formatMinutes,
  getWeekStart,
  formatDate,
  formatWeekOf,
} from "../utils";

interface TaskDetailPageProps {
  project: Project;
  onUpdate: (project: Project) => void;
}

export default function TaskDetailPage({
  project,
  onUpdate,
}: TaskDetailPageProps) {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const task = project.tasks.find((t) => t.id === taskId);

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(task?.name || "");
  const [addingEntry, setAddingEntry] = useState(false);
  const [entryDate, setEntryDate] = useState(getTodayISO());
  const [entryMinutes, setEntryMinutes] = useState("30");
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editMinutes, setEditMinutes] = useState("");

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-500 mb-4">Task not found</p>
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to tasks
          </button>
        </div>
      </div>
    );
  }

  const totalMinutes = task.entries.reduce((sum, e) => sum + e.minutes, 0);

  // Group entries by week
  const weeklyGroups = getWeeklyGroups(task.entries);

  function updateTask(updatedEntries: TimeEntry[]) {
    const tasks = project.tasks.map((t) =>
      t.id === taskId ? { ...t, entries: updatedEntries } : t
    );
    onUpdate({ ...project, tasks });
  }

  function handleSaveName() {
    const trimmed = nameValue.trim();
    if (!trimmed) return;
    const tasks = project.tasks.map((t) =>
      t.id === taskId ? { ...t, name: trimmed } : t
    );
    onUpdate({ ...project, tasks });
    setEditingName(false);
  }

  function handleDeleteTask() {
    const tasks = project.tasks.filter((t) => t.id !== taskId);
    onUpdate({ ...project, tasks });
    navigate("/");
  }

  function handleIncrement() {
    const today = getTodayISO();
    const existingEntry = task!.entries.find((e) => e.date === today);
    let entries;
    if (existingEntry) {
      entries = task!.entries.map((e) =>
        e.id === existingEntry.id
          ? { ...e, minutes: e.minutes + 30 }
          : e
      );
    } else {
      entries = [
        ...task!.entries,
        { id: generateId(), date: today, minutes: 30 },
      ];
    }
    updateTask(entries);
  }

  function handleAddEntry() {
    const minutes = parseInt(entryMinutes);
    if (isNaN(minutes) || minutes <= 0 || !entryDate) return;

    const existingEntry = task!.entries.find((e) => e.date === entryDate);
    let entries;
    if (existingEntry) {
      entries = task!.entries.map((e) =>
        e.id === existingEntry.id
          ? { ...e, minutes: e.minutes + minutes }
          : e
      );
    } else {
      entries = [
        ...task!.entries,
        { id: generateId(), date: entryDate, minutes },
      ];
    }
    updateTask(entries);
    setAddingEntry(false);
    setEntryMinutes("30");
  }

  function handleEditEntry(entryId: string, newMinutes: number) {
    if (newMinutes <= 0) {
      // Delete entry if minutes go to 0 or below
      updateTask(task!.entries.filter((e) => e.id !== entryId));
    } else {
      updateTask(
        task!.entries.map((e) =>
          e.id === entryId ? { ...e, minutes: newMinutes } : e
        )
      );
    }
    setEditingEntryId(null);
  }

  function handleDeleteEntry(entryId: string) {
    updateTask(task!.entries.filter((e) => e.id !== entryId));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="text-blue-600 hover:text-blue-800 font-medium mb-6 flex items-center gap-1"
        >
          ← Back to tasks
        </button>

        {/* Task Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-2">
            {editingName ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") setEditingName(false);
                  }}
                  className="text-2xl font-bold bg-white border-2 border-blue-400 rounded-lg px-3 py-1 flex-1 outline-none focus:border-blue-600"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setNameValue(task.name);
                    setEditingName(false);
                  }}
                  className="text-sm text-slate-500 hover:text-slate-700 px-3 py-1"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <h1 className="text-2xl font-bold text-slate-800">
                {task.name}
              </h1>
            )}
            {!editingName && (
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => {
                    setNameValue(task.name);
                    setEditingName(true);
                  }}
                  className="text-slate-400 hover:text-blue-600 px-2 py-1 rounded-lg transition-colors text-sm"
                  title="Edit task"
                >
                  Edit
                </button>
                <button
                  onClick={handleDeleteTask}
                  className="text-slate-400 hover:text-red-600 px-2 py-1 rounded-lg transition-colors text-sm"
                  title="Delete task"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-6">
            <div>
              <span className="text-sm text-slate-500">Total time</span>
              <p className="text-3xl font-bold text-blue-600">
                {formatMinutes(totalMinutes)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleIncrement}
                className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
              >
                +30m Today
              </button>
              <button
                onClick={() => setAddingEntry(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                + Custom Entry
              </button>
            </div>
          </div>
        </div>

        {/* Add Custom Entry Form */}
        {addingEntry && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h3 className="font-medium text-blue-800 mb-3">
              Add Custom Time Entry
            </h3>
            <div className="flex gap-3 items-end">
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Minutes
                </label>
                <input
                  type="number"
                  value={entryMinutes}
                  onChange={(e) => setEntryMinutes(e.target.value)}
                  min="1"
                  step="15"
                  className="border border-slate-300 rounded-lg px-3 py-2 bg-white w-24 outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={handleAddEntry}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                Add
              </button>
              <button
                onClick={() => setAddingEntry(false)}
                className="text-slate-500 hover:text-slate-700 px-3 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Weekly Breakdown */}
        {weeklyGroups.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <div className="text-5xl mb-4">⏱️</div>
            <p className="text-lg">
              No time logged yet. Use the buttons above to start tracking!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {weeklyGroups.map((week) => (
              <div
                key={week.weekStart}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
              >
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-700">
                    {formatWeekOf(week.weekStart)}
                  </h3>
                  <span className="text-sm font-medium text-blue-600">
                    {formatMinutes(week.totalMinutes)}
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {week.entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="px-4 py-3 flex items-center justify-between hover:bg-slate-50"
                    >
                      <span className="text-slate-600">
                        {formatDate(entry.date)}
                      </span>
                      <div className="flex items-center gap-2">
                        {editingEntryId === entry.id ? (
                          <>
                            <input
                              type="number"
                              value={editMinutes}
                              onChange={(e) => setEditMinutes(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleEditEntry(
                                    entry.id,
                                    parseInt(editMinutes) || 0
                                  );
                                }
                                if (e.key === "Escape") {
                                  setEditingEntryId(null);
                                }
                              }}
                              className="border border-blue-400 rounded px-2 py-1 w-20 text-right outline-none"
                              autoFocus
                              min="0"
                            />
                            <span className="text-sm text-slate-500">min</span>
                            <button
                              onClick={() =>
                                handleEditEntry(
                                  entry.id,
                                  parseInt(editMinutes) || 0
                                )
                              }
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Save
                            </button>
                          </>
                        ) : (
                          <>
                            <span
                              className="font-medium text-slate-800 cursor-pointer hover:text-blue-600"
                              onClick={() => {
                                setEditingEntryId(entry.id);
                                setEditMinutes(String(entry.minutes));
                              }}
                              title="Click to edit"
                            >
                              {formatMinutes(entry.minutes)}
                            </span>
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="text-slate-300 hover:text-red-500 transition-colors ml-2"
                              title="Delete entry"
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface WeekGroup {
  weekStart: string;
  totalMinutes: number;
  entries: TimeEntry[];
}

function getWeeklyGroups(entries: TimeEntry[]): WeekGroup[] {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const groups: Map<string, TimeEntry[]> = new Map();
  for (const entry of sorted) {
    const weekStart = getWeekStart(entry.date);
    const existing = groups.get(weekStart) || [];
    existing.push(entry);
    groups.set(weekStart, existing);
  }

  return Array.from(groups.entries())
    .map(([weekStart, entries]) => ({
      weekStart,
      totalMinutes: entries.reduce((sum, e) => sum + e.minutes, 0),
      entries: entries.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    }))
    .sort(
      (a, b) =>
        new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
    );
}