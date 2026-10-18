# MCXHospital-WebApp

**Real-Time Emergency Case Platform Connecting Ambulance Crews and Hospitals**

A web application that lets ambulance (EMS) crews report patient cases from the field and lets the receiving hospital follow them live. Cases carry vital signs, priority and GPS location. The hospital is notified as soon as a case is created, sees the vehicle on a map with an estimated arrival time, and can chat with the crew before the patient arrives.

> Student internship project, 2025. Built by a team of 6 (3 frontend, 3 backend developers).

## My contribution

I worked on the **backend**, where I among other things worked on **admin part** and the **Playwright end-to-end tests**:

- Admin REST API (`/admin/users`): create, edit, delete, activate/deactivate users and change passwords, restricted to the `ADMIN` role
- Admin service logic and DTOs, with bcrypt password hashing
- Backend tests for the admin endpoints (JUnit 5, REST Assured)
- Playwright end-to-end tests covering login, admin user editing, user deactivation, case creation and loading cases per user, with a GitHub Actions workflow to run them

## Features

- Login with JWT authentication and role-based access (Admin, EMS vehicle, Hospital)
- SOS and regular case creation with patient data, vital signs and priority (Low, Medium, High, SOS)
- Live vehicle location on a map, with estimated time of arrival calculated through OSRM routing
- Real-time hospital notifications and case updates over WebSockets
- Per-case chat between the EMS crew and the hospital
- Case acknowledgement by the hospital and case closing by the crew
- Archive of finished cases with PDF report export
- Admin panel for user management

## Tech stack

| Area | Technology |
|---|---|
| Frontend | Angular 18, TypeScript, SCSS, Leaflet |
| Backend | Java 21, Quarkus 3 |
| Database | PostgreSQL (Hibernate ORM with Panache) |
| Real-time | WebSockets |
| Security | JWT (SmallRye JWT, RS256), bcrypt |
| Reports | iText 7 (PDF) |
| Routing / ETA | OSRM |
| Testing | Playwright, JUnit 5, REST Assured |
| Deployment | Docker, Docker Compose |

## Architecture

```
Browser (Angular)
     │  REST + JWT          WebSockets (cases, chat, notifications)
     ▼                              │
Quarkus backend ◄───────────────────┘
     │
     ├──── PostgreSQL         (users, cases, messages)
     │
     └──── OSRM API           (route and ETA to the hospital)
```

## Repository structure

| Folder | Contents |
|---|---|
| `BE/` | Quarkus backend |
| `FE/` | Angular frontend |
| `mcx-hospital-tests/` | Playwright end-to-end tests |


