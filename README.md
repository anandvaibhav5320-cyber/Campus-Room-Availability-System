# CampusSpace – Campus Room Availability System

A web-based room availability and booking management system designed to simplify the process of finding and reserving rooms within a college campus.

CampusSpace allows students to explore available rooms, check room availability for specific time slots, submit booking requests, and track their booking status. Administrators can manage rooms and approve or reject booking requests.

## Problem Statement

In many educational institutions, room allocation and booking are handled manually, making it difficult to identify available rooms, avoid scheduling conflicts, and manage booking requests efficiently.

CampusSpace aims to provide a centralized platform for room discovery, availability checking, and booking management.

## Key Features

- **Room Catalogue:** Browse available campus rooms with details such as building, capacity, room type, and facilities.
- **Availability Search:** Find rooms available for a selected date and time slot.
- **Timetable:** View scheduled room bookings for a particular date.
- **Booking Requests:** Submit room booking requests by specifying the date, time, and purpose.
- **Conflict Prevention:** Prevent overlapping bookings for the same room.
- **Approval Workflow:** Administrators can approve or reject booking requests.
- **Booking History:** View previously submitted booking requests and their current status.
- **Room Management:** Administrators can add, edit, deactivate, and reactivate rooms.

## Key Features

- **Room Catalogue:** Browse available campus rooms with details such as building, capacity, room type, and facilities.
- **Availability Search:** Find rooms available for a selected date and time slot.
- **Timetable:** View scheduled room bookings for a particular date.
- **Booking Requests:** Submit room booking requests by specifying the date, time, and purpose.
- **Conflict Prevention:** Prevent overlapping bookings for the same room.
- **Approval Workflow:** Administrators can approve or reject booking requests.
- **Booking History:** View previously submitted booking requests and their current status.
- **Room Management:** Administrators can add, edit, deactivate, and reactivate rooms.

## Technology Stack

### Frontend
- **HTML5** – Structure of the web application.
- **CSS3** – Styling, layout, and responsive design.
- **JavaScript** – Frontend functionality and API communication.

### Backend
- **Node.js** – JavaScript runtime environment.
- **Express.js** – Backend framework for creating REST APIs.

### Database
- **PostgreSQL** – Relational database for storing rooms, users, and booking information.
- **Neon** – Cloud-hosted PostgreSQL database.

### Deployment and Tools
- **Render** – Hosting the frontend and backend.
- **Git and GitHub** – Version control and source code management.
- **Visual Studio Code** – Development environment.

## System Architecture

CampusSpace follows a three-layer architecture:

1. **Presentation Layer (Frontend):** HTML, CSS, and JavaScript provide the user interface and handle user interactions.
2. **Application Layer (Backend):** Node.js and Express.js process requests, validate booking information, enforce booking rules, and communicate with the database.
3. **Data Layer (Database):** PostgreSQL stores room details, user information, and booking records.

### Application Workflow

1. The user opens the CampusSpace website.
2. The frontend sends API requests to the Express.js backend.
3. The backend processes the request and communicates with PostgreSQL.
4. The database returns the requested information.
5. The backend sends a response to the frontend.
6. The frontend displays the result to the user.

## System Architecture

CampusSpace follows a three-layer architecture:

1. **Presentation Layer (Frontend):** HTML, CSS, and JavaScript provide the user interface and handle user interactions.
2. **Application Layer (Backend):** Node.js and Express.js process requests, validate booking information, enforce booking rules, and communicate with the database.
3. **Data Layer (Database):** PostgreSQL stores room details, user information, and booking records.

### Application Workflow

1. The user opens the CampusSpace website.
2. The frontend sends API requests to the Express.js backend.
3. The backend processes the request and communicates with PostgreSQL.
4. The database returns the requested information.
5. The backend sends a response to the frontend.
6. The frontend displays the result to the user.

## Project Structure

```text
Campus-Room-Availability-System/
│
├── backend/
│   ├── index.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── database/
│
├── .gitignore
└── README.md
```

### Folder Description

- **backend/** – Contains the Express.js server, API routes, and database connection logic.
- **frontend/** – Contains the user interface, styling, and JavaScript functionality.
- **database/** – Reserved for database-related resources.
- **.env** – Stores environment variables and database connection details. It should never be committed to GitHub.
- **.gitignore** – Specifies files and folders that Git should ignore.
- **README.md** – Contains project documentation.

done

## Installation and Setup

Follow these steps to run CampusSpace locally.

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/) or access to a Neon PostgreSQL database
- [Git](https://git-scm.com/)
- Visual Studio Code (recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/anandvaibhav5320-cyber/Campus-Room-Availability-System.git
```

### 2. Navigate to the Project

```bash
cd Campus-Room-Availability-System
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the `backend` folder and configure your database connection.

```env
DATABASE_URL=your_postgresql_connection_string
```

Replace the placeholder with your own PostgreSQL connection string. Never share or commit your database credentials.

### 5. Start the Backend Server

```bash
npm start
```

The backend server will start on the configured port (3000 by default for local development).

### 6. Run the Frontend

Open the `frontend/index.html` file in your browser or use the VS Code Live Server extension.

CampusSpace should now be running locally.

## API Endpoints

The backend provides the following REST API endpoints.

### General APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check server health |
| GET | `/api/db-test` | Test database connection |
| GET | `/api/rooms` | Get active rooms |

### Booking and Availability APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/bookings` | Get booking history |
| POST | `/api/bookings` | Submit a booking request |
| GET | `/api/availability` | Find available rooms |
| GET | `/api/timetable` | View room timetable |

### Administration APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/bookings` | View all booking requests |
| PATCH | `/api/admin/bookings/:id` | Approve or reject a booking |
| POST | `/api/admin/rooms` | Add a new room |
| PUT | `/api/admin/rooms/:id` | Update room details |
| PATCH | `/api/admin/rooms/:id/deactivate` | Deactivate a room |
| GET | `/api/admin/rooms/inactive` | View inactive rooms |
| PATCH | `/api/admin/rooms/:id/activate` | Activate a room |


## API Endpoints

The backend provides the following REST API endpoints.

### General APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check server health |
| GET | `/api/db-test` | Test database connection |
| GET | `/api/rooms` | Get active rooms |

### Booking and Availability APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/bookings` | Get booking history |
| POST | `/api/bookings` | Submit a booking request |
| GET | `/api/availability` | Find available rooms |
| GET | `/api/timetable` | View room timetable |

### Administration APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/bookings` | View all booking requests |
| PATCH | `/api/admin/bookings/:id` | Approve or reject a booking |
| POST | `/api/admin/rooms` | Add a new room |
| PUT | `/api/admin/rooms/:id` | Update room details |
| PATCH | `/api/admin/rooms/:id/deactivate` | Deactivate a room |
| GET | `/api/admin/rooms/inactive` | View inactive rooms |
| PATCH | `/api/admin/rooms/:id/activate` | Activate a room |

## Live Demo

- **Frontend:** Add your deployed CampusSpace frontend URL here.
- **Backend API:** https://campus-room-availability-system.onrender.com
- **GitHub Repository:** https://github.com/anandvaibhav5320-cyber/Campus-Room-Availability-System

## Team Members

**Team Name:** Pixel Phantoms

| Name | Registration Number |
|---|---|
| Vaibhav Anand | 12608176 |
| Pulkit | 12607778 |

**Course:** CSE 326

**Section:** K3P26EM

## Future Enhancements

- User authentication and role-based access control.
- Student-side booking cancellation and modification.
- Email and notification integration.
- Advanced room filtering and search.
- Integration with the university's official timetable.
- Room utilization analytics and reporting.
- Improved mobile experience.

## Limitations

- The current version uses a demo user for booking requests.
- Admin APIs do not currently have authentication.
- Automated email and SMS notifications are not implemented.
- The application is not yet integrated with the university's official timetable.
- Large-scale concurrent user performance has not been tested.

## License

This project was developed for academic purposes as part of the CSE 326 course.

