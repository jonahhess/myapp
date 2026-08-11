# Jonah's Job Board Frontend

React + Vite frontend for a role-based job board experience.

This app supports:
- Public job browsing and search
- Authentication (login/register)
- Saved jobs for authenticated users
- Recruiter workflows to create, edit, and delete jobs
- Admin dashboard access for admin users
- Profile management

The app uses React Router for routing, Formik + Yup for forms and validation, and Axios for API communication.

## Tech Stack

- React 19
- Vite 8
- React Router DOM 7
- Axios
- Formik
- Yup
- ESLint (flat config)
- Vitest + Testing Library

## Project Structure

Key folders:
- src/pages: top-level route pages
- src/components: reusable UI components
- src/layouts: app layout shell
- src/routes: router definition and protected routes
- src/contexts: provider components and context objects
- src/hooks: reusable hooks including context hooks
- src/services: API client and service modules
- src/styles: global and component styling
- src/validation: form schemas

## Routing and Access

Defined in src/routes/AppRoutes.jsx.

Public routes:
- / (home)
- /jobs
- /jobs/:id
- /about

Guest-only routes:
- /login
- /register

Authenticated routes:
- /jobs-saved
- /profile

Recruiter routes:
- /my-jobs
- /create/jobs

Admin route:
- /admin

Conditional edit route (admin or owner roles):
- /jobs/:id/edit

## Authentication and API

API access is configured in src/services/apiClient.js.

- Base URL env var: VITE_API_BASE_URL
- Default fallback URL: http://localhost:5000/api
- Token storage key: authToken
- Token headers sent when authenticated:
	- x-auth-token
	- Authorization: Bearer <token>

Auth state is managed through provider composition in src/App.jsx.

## Environment Variables

Create a .env file in the project root.

Required for custom backend URL:

VITE_API_BASE_URL=http://localhost:5000/api

If omitted, the app uses the same default above.

## Local Development

Install dependencies:

npm install

Run development server:

npm run dev

Build production bundle:

npm run build

Preview production build:

npm run preview

## Linting

Run lint:

npm run lint

ESLint config is in eslint.config.js.

## Testing

Run all tests:

npm run test

Watch mode:

npm run test:watch

Vitest is configured in vite.config.js with setup file:
- src/test/setup.js

Note: package scripts include additional targeted and smoke test commands. Keep script paths in package.json aligned with your actual test directory structure when adding or moving tests.

## Backend Contract

The frontend expects REST endpoints under /api for:
- /users (auth and user management)
- /jobs (job listing and recruiter actions)

If you are using the companion backend, ensure it is running and CORS is configured for your frontend origin.