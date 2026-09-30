# EventHub

EventHub is a web application for managing events, participants and registrations.

Built with the **PERN stack**:

- PostgreSQL
- Express.js
- React.js
- Node.js

## Features

- JWT authentication
- Admin / Staff roles
- Event management
- Participant management
- Registration management
- Dashboard
- Event and registration business rules

## Project Structure

```text
EventHub/
├── backend/
├── frontend/
├── docs/
├── README.md
└── .gitignore
```

## Database

PostgreSQL database with four main tables:

- `users`
- `events`
- `participants`
- `registrations`

Main constraints:

- Unique participant email
- No duplicate registration for the same event
- Foreign keys
- Event status: `draft`, `published`, `cancelled`
- Registration status: `pending`, `confirmed`, `cancelled`

Database design: `docs/EventHub_ERD.png`

## Roles

### Admin

- Dashboard
- Events
- Participants
- Registrations

### Staff

- Dashboard
- Events
- Registrations

Participant management is restricted to Admin users.

## Business Rules

- Participants can only register for published events.
- A participant cannot register twice for the same event.
- Event capacity cannot be exceeded.
- Cancelled events have cancelled registrations.
- Participant emails must be unique.

## Installation

### Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eventhub
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
JWT_SECRET=your_jwt_secret
```

Create the PostgreSQL database `eventhub` and run:

`backend/migrations/001_create_schema.sql`

### Seed Data

```bash
node seed/seedUsers.js
node seed/seedData.js
```

### Start Backend

```bash
npm run dev
```

Backend: `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Test Accounts

**Admin**

- Email: `admin@eventhub.com`
- Password: `Admin123!`

**Staff**

- Email: `staff@eventhub.com`
- Password: `Staff123!`

## API Endpoints

### Authentication

- `POST /api/auth/login`
- `GET /api/auth/me`

### Events

- `POST /api/events`
- `GET /api/events`
- `GET /api/events/:id`
- `PUT /api/events/:id`
- `PATCH /api/events/:id/status`

### Participants

- `POST /api/participants`
- `GET /api/participants`
- `PUT /api/participants/:id`

### Registrations

- `POST /api/registrations`
- `GET /api/registrations`
- `PATCH /api/registrations/:id/status`

### Dashboard

- `GET /api/dashboard`

## Documentation

Additional documentation is available in the `docs` folder:

- `EventHub_Technical_Report.pdf`
- `EventHub_ERD.png`

## Author

**EventHub — Technical Test**

PERN Stack