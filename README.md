# PawChart - Pet Health Management App

A full-stack web application for managing your pets' health records, vaccinations, appointments, medications, and more.

## Features

- **Pet Profiles** — Add and manage profiles for dogs, cats, rabbits, and more
- **Vaccination Tracker** — Log vaccination history with due date alerts (overdue / due soon / up to date)
- **Vet Appointments** — Schedule and track appointments with status management
- **Weight Monitoring** — Log weight records with an interactive line chart
- **Medication Tracker** — Track active and past medications with dosage info
- **Health Conditions** — Record diagnoses, severity, and treatment plans
- **Dashboard** — At-a-glance overview of upcoming appointments and active medications

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS        |
| Charts   | Chart.js via react-chartjs-2        |
| Routing  | React Router v6                     |
| Backend  | Node.js, Express                    |
| Database | SQLite via better-sqlite3           |

## Project Structure

```
PawChart/
├── backend/                # Express API server
│   ├── db/
│   │   ├── database.js     # SQLite schema initialization
│   │   └── seed.js         # Sample data seeder
│   ├── routes/
│   │   ├── pets.js
│   │   ├── vaccinations.js
│   │   ├── appointments.js
│   │   ├── medications.js
│   │   ├── weight.js
│   │   └── conditions.js
│   ├── middleware/
│   │   └── errorHandler.js
│   └── server.js
├── frontend/               # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── pets/       # Pet list & profile views
│   │   │   ├── health/     # Vaccinations, weight, conditions
│   │   │   ├── appointments/
│   │   │   ├── medications/
│   │   │   └── ui/         # Shared UI components
│   │   ├── context/        # App-wide state
│   │   ├── utils/          # API client & helpers
│   │   └── App.jsx
│   └── index.html
└── package.json            # Workspace root
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Install all dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
```

### Database Setup

```bash
# Seed the database with sample pet data
cd backend && npm run seed
```

This creates sample data including:
- 3 pets (Luna the Golden Retriever, Mochi the Scottish Fold, Pebbles the Holland Lop)
- 7 vaccination records
- 5 appointments
- 12 weight records
- 6 medications
- 3 health conditions

### Running the App

**Development mode** (both servers):
```bash
# From root directory
npm run dev
```

Or start them separately:
```bash
# Backend (port 3001)
cd backend && npm run dev

# Frontend (port 3000)
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pets` | List all pets |
| POST | `/api/pets` | Create a pet |
| GET | `/api/pets/:id` | Get pet with all health records |
| PUT | `/api/pets/:id` | Update pet |
| DELETE | `/api/pets/:id` | Delete pet (cascades) |
| GET | `/api/vaccinations/pet/:petId` | Pet's vaccinations |
| POST | `/api/vaccinations` | Add vaccination |
| GET | `/api/appointments/upcoming` | Upcoming appointments |
| GET | `/api/appointments` | All appointments |
| POST | `/api/appointments` | Schedule appointment |
| GET | `/api/medications/active` | All active medications |
| GET | `/api/weight/pet/:petId` | Pet's weight history |
| POST | `/api/weight` | Log weight |
| GET | `/api/conditions/pet/:petId` | Pet's health conditions |

## License

MIT
