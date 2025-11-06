# TripSync - College Bus Management System

A comprehensive full-stack college bus management system connecting students, drivers, and administrators.

## 🏗️ Project Structure

```
TripSync/
├── backend/          # FastAPI Backend
│   ├── app/         # Application code
│   ├── main.py      # Entry point
│   └── requirements.txt
│
└── frontend/        # React Frontend
    ├── src/         # React components
    ├── public/      # Static assets
    └── package.json
```

## 🚀 Quick Start

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs on: `http://localhost:3000`
API Docs: `http://localhost:3000/docs`

### Frontend (React + Vite + Tailwind)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

## 🛠️ Tech Stack

**Backend:**
- FastAPI (Python)
- MongoDB
- JWT Authentication
- Motor (Async MongoDB driver)

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios

## 📱 Features

### For Students
- Real-time bus tracking
- Driver alerts and notifications
- Bus-specific group chat
- Attendance marking
- Complaint submission

### For Drivers
- Send alerts to assigned students
- Leave request management
- View assigned students
- Schedule management

### For Admin
- Complete dashboard
- Bus management
- Student management
- Driver management
- Route management
- Complaint resolution
- Leave approval

## 🌐 Deployment

### Backend (Render)
```bash
# Configure in render.yaml
# Deploy: Connect GitHub repo to Render
```

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

## 📝 Environment Variables

### Backend (.env)
```
MONGO_URI=your_mongodb_connection_string
MONGO_DB=tripsync
JWT_SECRET=your_jwt_secret
SECRET_KEY=your_secret_key
APP_HOST=0.0.0.0
APP_PORT=3000
GROQ_API_KEY=your_groq_api_key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
```

## 📚 API Documentation

Access Swagger UI at: `http://localhost:3000/docs`

## 👥 User Roles

- **Student**: Track buses, chat, mark attendance
- **Driver**: Send alerts, manage leaves
- **Admin**: Full system control

## 🔐 Authentication

JWT-based authentication with role-based access control (RBAC)

## 📦 Database Collections

- users
- buses
- routes
- messages
- groups
- complaints
- leave_requests
- attendance

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License

## 👨‍💻 Author

Vasanth V
