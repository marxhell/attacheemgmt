# Attachee Management System

## Kisii County Government
### Department of Water, Energy, Environment and Natural Resources

A comprehensive web-based system for managing industrial attachment programs within the department.

## Features

### 1. User Authentication & Access Control
- Secure login/logout with JWT
- Role-based permissions (Admin, Supervisor, HR, Director, Student)
- Password encryption using bcryptjs

### 2. Attachee Registration Management
- Student profile creation with personal details
- Institution and course information
- Attachment duration tracking
- Document upload (Student ID, National ID, Insurance, School letter)
- Emergency contact information
- **Self-registration** for students with auto-login

### 3. Placement & Supervisor Assignment
- Department allocation
- Supervisor assignment
- Placement tracking
- Attachment status monitoring (pending → active → completed)

### 4. Evaluation & Assessment (Supervisor-managed)
- 10-criteria performance evaluation (1-5 scale)
- Automatic grade calculation (A, B, C, D, F)
- Mid-term and final evaluations
- Performance recommendations

### 5. Reporting Module
- Active attachees report
- Evaluation report
- Departmental placement report
- Completion report
- Supervisor workload report
- Full attachee report

### 6. Data Security
- Password hashing (bcryptjs)
- JWT-based authentication
- Role-based authorization
- Input validation
- Rate limiting

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
# 1. Navigate to project
cd attachee-management-system

# 2. Install dependencies
npm install

# 3. Start MongoDB (ensure it's running)
# On Windows: net start MongoDB

# 4. Seed the database with initial data
npm run seed

# 5. Start the server
npm run dev

# 6. Open in browser
# Open frontend/pages/login.html via Live Server
```

## System Workflow

### Admin/HR Workflow
1. Login as admin or HR
2. **Approve** pending student registrations (changes status from pending → active)
3. **Assign Department** to attachees
4. **Assign Supervisor** to attachees
5. **Mark Complete** when attachment period ends

### Supervisor Workflow
1. Login as supervisor
2. View assigned attachees
3. **Create Evaluations** for attachees (mid-term or final)
4. Fill 10 performance criteria (1-5 scale)
5. System auto-calculates grade and recommendation

### Student Workflow
1. Self-register at `student-register.html`
2. Upload required documents (school letter, ID, insurance, photo)
3. Auto-login and view dashboard
4. Track attachment status and days remaining
5. View evaluation results from supervisors

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@kisiiwater.go.ke | Admin123! |
| **HR** | hr@kisiiwater.go.ke | Hr123! |
| **Director** | director@kisiiwater.go.ke | Director123! |
| **Supervisor** | jmwangi@kisiiwater.go.ke | Supervisor123! |
| **Supervisor** | swanjiku@kisiiwater.go.ke | Supervisor123! |
| **Supervisor** | dochieng@kisiiwater.go.ke | Supervisor123! |
| **Supervisor** | gakinyi@kisiiwater.go.ke | Supervisor123! |
| **Supervisor** | pkamau@kisiiwater.go.ke | Supervisor123! |

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/student-register` - Student self-registration
- `GET /api/auth/me` - Get profile
- `PUT /api/auth/updatedetails` - Update profile
- `PUT /api/auth/updatepassword` - Change password

### Attachees
- `GET /api/attachees` - List attachees (with search/filter/pagination)
- `POST /api/attachees` - Register attachee
- `GET /api/attachees/:id` - Get attachee details
- `PUT /api/attachees/:id` - Update attachee
- `DELETE /api/attachees/:id` - Delete attachee
- `PUT /api/attachees/:id/assign-department` - Assign department
- `PUT /api/attachees/:id/assign-supervisor` - Assign supervisor
- `PUT /api/attachees/:id/status` - Update status (approve/complete)
- `GET /api/attachees/stats/counts` - Status statistics

### Departments
- `GET /api/departments` - List departments
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Supervisors
- `GET /api/supervisors` - List supervisors
- `POST /api/supervisors` - Create supervisor

### Evaluations
- `GET /api/evaluations` - List evaluations
- `POST /api/evaluations` - Create evaluation

### Reports
- `GET /api/reports/active-attachees` - Active attachees report
- `GET /api/reports/evaluations` - Evaluation report
- `GET /api/reports/departmental-placement` - Department placement
- `GET /api/reports/completion` - Completion report
- `GET /api/reports/supervisor-workload` - Supervisor workload
- `GET /api/reports/attachee/:id` - Full attachee report

## License

MIT - Department of Water, Energy, Environment and Natural Resources, Kisii County Government