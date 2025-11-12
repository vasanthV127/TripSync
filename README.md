# TripSync - School Bus Management System

A comprehensive full-stack school bus management system with React Native mobile apps for students, drivers, and parents, and a professional React web admin portal.

## 🏗️ Project Structure

```
TripSync/
├── backend/              # FastAPI Backend
│   ├── app/             # Application code
│   │   ├── routers/     # API endpoints
│   │   ├── models/      # Database models
│   │   ├── core/        # Config & security
│   │   └── utils/       # Utilities
│   ├── main.py          # Entry point
│   └── requirements.txt
│
├── frontend/            # React Web (Admin Portal)
│   ├── src/            # React components
│   │   ├── pages/      # Page components
│   │   ├── theme/      # Color theme
│   │   └── App.jsx     # Main app
│   ├── public/         # Static assets
│   └── package.json
│
└── reactnative_frontend/ # React Native (Mobile)
    ├── src/             # Mobile app code
    │   ├── ui/          # Screen components
    │   ├── navigation/  # App navigation
    │   └── theme/       # Mobile theme
    └── package.json
```

## 🎯 Platform Distribution

- **React Native Mobile**: Students, Drivers, Parents
- **React Web Portal**: Admin only (Desktop/Laptop)

## 🚀 Quick Start

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 3000
```

**Backend URLs:**
- API: `http://localhost:3000`
- API Docs: `http://localhost:3000/docs`
- **Live Production**: `https://tripsync-uh0i.onrender.com`

### Frontend - Admin Web Portal (React + Vite + Tailwind)

```bash
cd frontend
npm install
npm run dev
```

**Frontend URL:** `http://localhost:5173`

### Mobile App (React Native)

```bash
cd reactnative_frontend
npm install
npm start
```

## 🛠️ Tech Stack

### Backend
- **FastAPI** (Python 3.x)
- **MongoDB** with Motor (async driver)
- **JWT Authentication** with bcrypt
- **Pydantic** for validation
- **Uvicorn** ASGI server

### Frontend - Web Admin Portal
- **React 19.1.1**
- **Vite 7.2.2** (build tool)
- **Tailwind CSS 3.3.3**
- **React Router DOM 7.1.1**
- **Axios 1.7.9**
- **React Icons 5.4.0**
- **React Leaflet 4.2.1** (maps)
- **Leaflet 1.9.4** (mapping library)

### Mobile App
- **React Native** (Expo)
- **React Navigation**
- **Custom UI Components**

## 📱 Features

### Admin Portal (Web)
- ✅ Professional split-screen login with role-based routing
- ✅ Comprehensive dashboard with real-time statistics
- ✅ **Bus Management** (Full CRUD)
  - Modern card-based UI with status indicators
  - Search and filter by route, status (Active/Idle)
  - Edit, delete, and assign drivers
- ✅ **Student Management** (Full CRUD)
  - Search by roll number, name, or email
  - Filter by route and bus
  - Edit student details, delete students
  - Auto-password generation (roll number)
  - Automated welcome email with credentials
  - Boarding point dropdown (route-specific)
  - Bus dropdown (route-filtered)
- ✅ **Driver Management**
  - Search by name, email, or phone
  - Filter by assigned bus
  - Edit driver information
- ✅ **Route Management** (Full CRUD)
  - Create, edit, and delete routes
  - Search by route name or stop
  - Dynamic stop management
  - Bus and student count per route
- ✅ **Alerts & Messaging**
  - Broadcast messages to all students
  - Broadcast messages to all drivers
  - Route-specific messages
  - Complaint management with status tracking
  - Admin response system
- ✅ **Custom Toast Notifications**
  - Non-blocking success/error/info/warning messages
  - Auto-dismiss with manual close option
  - Branded design matching app theme
- ✅ Real-time bus tracking on interactive map
- ✅ Leave request approval system
- ✅ Attendance monitoring

### Student App (Mobile)
- Real-time bus tracking
- Driver alerts and notifications
- Bus-specific group chat
- Attendance marking
- Complaint submission
- Route information

### Driver App (Mobile)
- Send alerts to assigned students
- Leave request management
- View assigned students
- Update bus location
- Schedule management

### Parent App (Mobile)
- Track child's bus
- View attendance history
- Receive notifications
- Contact driver

## 🌐 Deployment

### Backend - Deployed on Render ✅
**Live URL:** `https://tripsync-uh0i.onrender.com`

```yaml
# render.yaml configuration
services:
  - type: web
    name: tripsync-backend
    runtime: python
    buildCommand: pip install -r backend/requirements.txt
    startCommand: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

### Frontend - Ready for Vercel/Netlify
```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel or Netlify
```

**Environment Variables for Production:**
```env
VITE_API_URL=https://tripsync-uh0i.onrender.com
```

## 📝 Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb+srv://your_connection_string
MONGO_DB=tripsync
JWT_SECRET=your_jwt_secret_key
SECRET_KEY=your_app_secret_key
APP_HOST=0.0.0.0
APP_PORT=3000

# Email Configuration (for student welcome emails)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

### Frontend (.env)
```env
VITE_API_URL=https://tripsync-uh0i.onrender.com
```

## 🎨 Design System

### Color Palette
```javascript
colors: {
  background: '#EBEBEB',  // Light gray
  color1: '#FFC812',      // Yellow (primary)
  color2: '#000000',      // Black (text/buttons)
  color3: '#FFFFFF',      // White
}

roleColors: {
  student: '#FFA726',     // Orange
  driver: '#29B6F6',      // Blue
  admin: '#66BB6A',       // Green
}
```

### Fonts (Google Fonts)
- **Poppins** (100-900) - Main UI font
- **Unica One** - Logo/branding
- **Merriweather** (300, 400, italic) - Accents

## 📚 API Documentation

Access Interactive Swagger UI: 
- **Local**: `http://localhost:3000/docs`
- **Production**: `https://tripsync-uh0i.onrender.com/docs`

## 👥 User Roles & Access

| Role | Platform | Access |
|------|----------|--------|
| **Admin** | Web Portal | Full system control |
| **Driver** | Mobile App | Bus updates, alerts, attendance |
| **Student** | Mobile App | Tracking, chat, attendance |
| **Parent** | Mobile App | Child tracking, notifications |

## 🔐 Authentication

- **JWT-based** authentication
- **Role-based access control** (RBAC)
- **Bcrypt** password hashing
- **Protected routes** on frontend
- **Token expiration** handling

## 📦 Database Collections

```
MongoDB Collections:
├── users           # All user types (admin, driver, student, parent)
├── buses           # Bus information and real-time locations
├── routes          # Route details with stops and coordinates
├── messages        # Group chat messages
├── groups          # Chat groups (bus-specific)
├── complaints      # Student complaints
├── leave_requests  # Driver leave requests
└── attendance      # Student attendance records
```

## 🔑 Seeded Test Data

**Admin:**
- Email: `admin@example.com`
- Password: `adminpass`

**Drivers (5):**
- Email: `driver1@example.com` to `driver5@example.com`
- Password: `default`

**Students (25):**
- Email: `student1@example.com` to `student25@example.com`
- Password: `default`
- Roll: `22BEC7001` to `22BEC7025`

## 🚦 Development Workflow

1. **Backend**: Start FastAPI server on port 3000
2. **Frontend**: Start Vite dev server on port 5173
3. **Mobile**: Start Expo on default port
4. **Test**: Use seeded credentials
5. **Deploy**: Push to GitHub, auto-deploy via Render

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License

## 👨‍💻 Author

**Vasanth V**
- GitHub: [@vasanthV127](https://github.com/vasanthV127)
- Institution: VIT-AP University

---

## 🎯 Project Status

- ✅ Backend API (FastAPI + MongoDB)
- ✅ Admin Web Portal (React + Tailwind + Leaflet Maps)
- ✅ Mobile Apps (React Native)
- ✅ Backend Deployed (Render)
- ✅ Email System (SMTP with Gmail)
- ✅ Custom Toast Notifications
- ✅ Complete CRUD Operations (Buses, Routes, Students, Drivers)
- ✅ Advanced Search & Filter Functionality
- ✅ Complaint Management System
- ⏳ Frontend Deployment (Pending)
- ⏳ Mobile App Polish (In Progress)

**Last Updated:** November 13, 2025

---

## 🎉 Recent Updates (November 2025)

### ✨ New Features
1. **Advanced Search & Filtering**
   - Students: Search by roll no, name, email; Filter by route and bus
   - Buses: Search by number/driver; Filter by route and status
   - Routes: Search by name or stop
   - Drivers: Search by name/email/phone; Filter by bus

2. **Student Management Enhancements**
   - Full CRUD operations (Create, Read, Update, Delete)
   - Auto-password generation using roll number
   - Automated welcome email with login credentials
   - Smart dropdowns for boarding points and buses
   - Email integration with Gmail SMTP

3. **Custom Toast Notification System**
   - Replaced browser alerts with professional toast notifications
   - Success, error, info, and warning types
   - Auto-dismiss with manual close option
   - Slide-in animations with gradient backgrounds
   - Non-blocking UX

4. **UI/UX Improvements**
   - Modern card-based layouts for buses and routes
   - Enhanced tables with hover effects
   - Real-time result counters for filters
   - Clear filter buttons
   - Consistent design across all sections
   - Professional loading states

5. **Backend Enhancements**
   - Student DELETE endpoint
   - Improved student UPDATE endpoint
   - Support for both `boarding` and `boardingPoint` fields
   - Enhanced error handling
   - Better API response structures

### 🐛 Bug Fixes
- Fixed boarding point display showing "Not Set" for all students
- Fixed complaint section variable name error
- Fixed API endpoint paths for admin routes
- Corrected hash_password import in student creation
- Fixed SMTP server configuration

---
