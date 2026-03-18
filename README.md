# Vehicle Rental System API

**Live URL:** (Not deployed yet) 

## Features
- User signup/login with role-based auth (admin/customer)
- Admin-only user management
- Vehicle CRUD (admin only for create/update/delete, public read)
- Booking CRUD with validation and role checks
- JWT auth middleware and PostgreSQL persistence

## Tech Stack
- Node.js, TypeScript
- Express
- PostgreSQL via `pg`
- bcrypt, jsonwebtoken

## Setup
1. Clone repo
2. `npm install`
3. Copy `.env.example` to `.env` and set DB URL, JWT secret, port
4. `npm run dev`

## Usage
- API base: `http://localhost:<PORT>/api/v1`
- Auth: `POST /auth/signup`, `POST /auth/login`
- Users: `GET /users`, `GET /users/:id`, `PUT /users/:id`, `DELETE /users/:id`
- Vehicles: `POST /vehicles`, `GET /vehicles`, `GET /vehicles/:id`, `PUT /vehicles/:id`, `DELETE /vehicles/:id`
- Bookings: `POST /bookings`, `GET /bookings`, `GET /bookings/:id`, `PUT /bookings/:id`, `DELETE /bookings/:id`

Use `Authorization: Bearer <token>` for protected routes.
