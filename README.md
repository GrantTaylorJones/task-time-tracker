# Task Time Tracker

A web app for tracking time spent on tasks, with cloud sync across devices.

**Live URL:** https://orange-forest-0640d4d10.6.azurestaticapps.net

## Features

- Add multiple tasks and track hours in 30-minute increments
- Editable project title and description
- Click a task to see total time and weekly breakdown by day
- Manually edit time entries
- Microsoft sign-in for cloud sync across devices
- Works offline with localStorage fallback

## Architecture

| Component | Service | Cost |
|-----------|---------|------|
| Frontend | Azure Static Web Apps (Free) | $0 |
| API | Azure Functions (included) | $0 |
| Database | Azure Cosmos DB (Free tier) | $0 |
| Auth | Microsoft (built-in) | $0 |

## Local Development

```bash
npm install
npm run dev
```

The app runs at http://localhost:5173. Without Azure auth, it uses localStorage only.

## Deployment

Deployments happen automatically when you push to `main`. GitHub Actions builds the React app and deploys it to Azure Static Web Apps.

## Azure Resources

- **Resource Group:** `rg-task-tracker`
- **Cosmos DB Account:** `task-tracker-cosmos` (database: `task-tracker`, container: `projects`)
- **Static Web App:** `task-time-tracker`

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Azure Static Web Apps
- Azure Functions (TypeScript)
- Azure Cosmos DB