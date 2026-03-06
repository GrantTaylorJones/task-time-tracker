# Task Time Tracker

A simple, effective time tracking app for managing tasks and logging hours. Built with React, TypeScript, and Tailwind CSS. Data is stored locally in your browser using `localStorage`.

## Features

- **Add tasks** on the main page with a single click
- **Editable project title & description** at the top
- **+30 minute increment button** for quick time logging
- **Manual time entry** — add custom minutes for any date
- **Inline editing** — click any time entry to adjust the minutes
- **Task detail view** — click a task to see total time and a weekly breakdown by day
- **Persistent storage** — data survives page refreshes, browser restarts, and reboots

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.19+ or v22.12+)
- npm (comes with Node.js)

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Then open [http://localhost:5173/](http://localhost:5173/) in your browser.

> **Note:** You need to keep this terminal running while using the app. The dev server compiles the TypeScript/React code on the fly and serves it to your browser.

### Production build & preview

To build optimized files and preview them locally:

```bash
npm run build
npx vite preview
```

This serves the app at [http://localhost:4173/](http://localhost:4173/).

## Project Structure

```
src/
├── types.ts                 # TypeScript interfaces (Project, Task, TimeEntry)
├── storage.ts               # localStorage read/write abstraction
├── utils.ts                 # ID generation, date formatting, week grouping
├── pages/
│   ├── HomePage.tsx         # Main task list page
│   └── TaskDetailPage.tsx   # Task detail with weekly breakdown
├── App.tsx                  # Router setup & state management
├── main.tsx                 # App entry point
└── index.css                # Tailwind CSS imports & base styles
```

## Tech Stack

- **React** — UI framework
- **TypeScript** — type-safe JavaScript
- **Tailwind CSS** — utility-first styling
- **Vite** — build tool & dev server
- **React Router** — client-side navigation
- **localStorage** — browser-native data persistence