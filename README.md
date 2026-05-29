# DevPulse

A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

## Live URL
https://b7a2-devpulse.vercel.app

## Features
- User Registration & Authentication (JWT)
- Role-based Access Control (Contributors & Maintainers)
- Create, view, update, and delete issues (bugs or feature requests)
- Global Error Handling

## Technology Stack
- Node.js (v24 LTS or higher)
- Express.js (Modular router architecture)
- TypeScript
- PostgreSQL (Native `pg` driver, Raw SQL queries)
- bcrypt (Password hashing)
- jsonwebtoken (Authentication)

## Setup Steps
1. Clone the repository
2. Run `npm install` to install dependencies
3. Copy `.env.example` to `.env` and set your `DATABASE_URL`, `JWT_SECRET`, and `PORT`
4. Run `npm run dev` to start the server. The tables will be auto-generated in the PostgreSQL database if they don't exist.

## API Endpoint List

### Auth
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Authenticate and get JWT

### Issues
- `POST /api/issues` - Create a new issue (Auth required)
- `GET /api/issues` - Retrieve all issues (Supports `?sort`, `?type`, `?status`)
- `GET /api/issues/:id` - Retrieve a specific issue
- `PATCH /api/issues/:id` - Update an issue (Role checks applied)
- `DELETE /api/issues/:id` - Delete an issue (Maintainer only)

## Database Schema Summary

### `users`
- `id` (Primary Key)
- `name` (String, required)
- `email` (String, unique, required)
- `password` (String, required)
- `role` ('contributor' or 'maintainer')
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### `issues`
- `id` (Primary Key)
- `title` (String, max 150 chars, required)
- `description` (Text, required)
- `type` ('bug' or 'feature_request')
- `status` ('open', 'in_progress', 'resolved')
- `reporter_id` (Foreign Key referencing users.id)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
