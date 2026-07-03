# Attachee Management System

## Kisii County Government
### Department of Water, Energy, Environment and Natural Resources

A comprehensive web-based system for managing industrial attachment programs within the department.

## Features

### 1. User Authentication & Access Control
- Secure login/logout with JWT
- Role-based permissions (Admin, Supervisor, HR, Director)
- Password encryption using bcryptjs
- Session management

### 2. Attachee Registration Management
- Student profile creation with personal details
- Institution and course information
- Attachment duration tracking
- Document upload (Student ID, National ID, Insurance, School letter)
- Emergency contact information

### 3. Placement & Supervisor Assignment
- Department allocation
- Supervisor assignment
- Placement tracking
- Attachment status monitoring (pending, active, completed, terminated)

### 4. Attendance Tracking
- Daily attendance marking
- Check-in/check-out tracking
- Status options (present, absent, late, half-day, permission)
- Attendance reports and summaries

### 5. Logbook Management
- Weekly logbook entries
- Skills acquired and lessons learned tracking
- Supervisor review and approval workflow
- Submission status tracking

### 6. Evaluation & Assessment
- 10-criteria performance evaluation (1-5 scale)
- Automatic grade calculation (A, B, C, D, F)
- Mid-term and final evaluations
- Performance recommendations

### 7. Reporting Module
- Active attachees report
- Attendance report
- Evaluation report
- Departmental placement report
- Completion report
- Supervisor workload report
- Full attachee report

## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT, bcryptjs
- **Security:** Helmet, Rate Limiting, Data Sanitization

## Project Structure

```
attachee-management-system/
├── backend/
│   ├── src/
│   │   ├── config/         # Database, JWT, Multer config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routes
│   │   ├── utils/          # Helpers, validators
│   │   ├── app.js          # Express app setup
│   │   ├── server.js       # Server entry point
│   │   └── seed.js         # Database seeder
│   └── .env                # Environment variables
├── frontend/
│   ├── assets/
│   │   ├── css/            # Stylesheets
│   │   └── js/             # JavaScript modules
│   ├── pages/              # HTML pages
│   └── index.html          # Entry point
├── uploads/                # File uploads directory
└── package.json
```

## Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (v4+)
- npm

### Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd attachee-management-system

# 2. Install dependencies
npm install

# 3. Start MongoDB (ensure it's running)
# On Windows: net start MongoDB
# Or run: mongod

# 4. Seed the database with initial data
npm run seed

# 5. Start the server
npm run dev

# 6. Open in browser
# Open frontend/pages/login.html via Live Server
```

## Default Login Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@kisiiwater.go.ke | Admin123! | Admin |

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get profile
- `PUT /api/auth/updatedetails` - Update profile
- `PUT /api/auth/updatepassword` - Change password

### Attachees
- `GET /api/attachees` - List attachees
- `POST /api/attachees` - Register attachee
- `GET /api/attachees/:id` - Get attachee details
- `PUT /api/attachees/:id` - Update attachee
- `DELETE /api/attachees/:id` - Delete attachee

### Attendance
- `GET /api/attendance` - List attendance records
- `POST /api/attendance` - Mark attendance

### Evaluations
- `GET /api/evaluations` - List evaluations
- `POST /api/evaluations` - Create evaluation

### Logbook
- `GET /api/logbook` - List logbook entries
- `POST /api/logbook` - Create entry

### Reports
- `GET /api/reports/active-attachees` - Active attachees
- `GET /api/reports/attendance` - Attendance report
- `GET /api/reports/evaluations` - Evaluation report
- `GET /api/reports/departmental-placement` - Department placement
- `GET /api/reports/completion` - Completion report

## License

MIT - Department of Water, Energy, Environment and Natural Resources, Kisii County Government# attacheemgmt
