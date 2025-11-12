# TripSync Admin Dashboard Guide

## 🚀 Getting Started

### Backend Setup (Required First!)
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the backend server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   
   The backend will be available at: `http://localhost:8000`
   
   **Note:** The database will automatically seed with default data on first startup!

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies (if not done already):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   
   The frontend will be available at: `http://localhost:5173`

## 📋 Default Login Credentials

### Admin Account
- **Email:** admin@example.com
- **Password:** adminpass

### Test Drivers
- driver1@example.com / default
- driver2@example.com / default
- driver3@example.com / default
- driver4@example.com / default
- driver5@example.com / default

### Test Students
- student1@example.com / default (Roll: 22BEC7001)
- student2@example.com / default (Roll: 22BEC7002)
- ... (25 students total)

## 🎯 Admin Dashboard Features

### 1. **Dashboard View**
- **Stats Cards:** Total buses, drivers, students, and routes
- **Live Map:** Shows real-time location of all buses with custom markers
- **Bus Popup:** Click on bus marker to see details (number, route, driver, last updated time)

### 2. **Buses Management**
✅ **View All Buses:** See all buses with their routes, drivers, and student counts
✅ **Add Bus:** 
   - Click "+ Add Bus" button
   - Enter bus number (e.g., Bus6)
   - Select route from dropdown
   - Optionally assign a driver
   
✅ **Edit Bus:**
   - Click edit icon on any bus card
   - Update route or driver assignment
   
✅ **Delete Bus:**
   - Click delete icon
   - Confirm deletion (only if no students are assigned)

### 3. **Drivers Management**
✅ **View All Drivers:** Table view with name, email, phone, and assigned bus
✅ **Add Driver:**
   - Click "+ Add Driver"
   - Enter name, email, phone, password
   - Driver will be available for bus assignment
   
✅ **Edit Driver:**
   - Click edit icon
   - Update name, email, or phone

### 4. **Students Management**
✅ **View All Students:** Table view with roll number, name, email, bus, and route
✅ **Add Student:**
   - Click "+ Add Student"
   - Enter all required fields:
     * Name
     * Email
     * Roll Number (e.g., 22BEC7026)
     * Password
     * Route (select from dropdown)
     * Boarding Point (e.g., Vijayawada)
     * Assigned Bus (e.g., Bus1)

### 5. **Routes View**
✅ **View All Routes:** See all available routes with stops
✅ **Route Details:** Each route shows:
   - Route name
   - All stops on the route
   - Coverage areas

### 6. **Alerts** (Coming Soon)
- Broadcast messages to students/drivers
- Emergency notifications

## 🔧 API Endpoints Being Used

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new user

### Buses
- `GET /api/buses` - Get all buses
- `POST /api/admin/buses` - Create new bus
- `PATCH /api/admin/buses/{bus_number}` - Update bus
- `DELETE /api/admin/buses/{bus_number}` - Delete bus

### Drivers
- `GET /api/drivers/list` - Get all drivers
- `PATCH /api/drivers/{driver_id}` - Update driver

### Students
- `GET /api/students/list` - Get all students
- Registration handled by auth endpoint

### Routes
- `GET /api/routes` - Get all routes

### Admin Dashboard
- `GET /api/admin/dashboard` - Get dashboard statistics

## 🗺️ Seeded Data

### Routes (5 total):
1. **Vijayawada to VIT AP** (5 stops)
2. **Amaravati to VIT AP** (3 stops)
3. **Guntur to VIT AP** (4 stops)
4. **Eluru to VIT AP** (5 stops)
5. **Mandadam to VIT AP** (3 stops)

### Buses (5 total):
- Bus1 → Vijayawada to VIT AP
- Bus2 → Amaravati to VIT AP
- Bus3 → Guntur to VIT AP
- Bus4 → Eluru to VIT AP
- Bus5 → Mandadam to VIT AP

### Students (25 total):
- 5 students per route
- Roll numbers: 22BEC7001 to 22BEC7025

## 🐛 Troubleshooting

### Issue: Can't see buses on map
**Solution:** 
1. Check if backend is running
2. Login with admin credentials
3. Check browser console for errors
4. Verify API_URL in `.env` file

### Issue: Can't add/edit/delete
**Solution:**
1. Make sure you're logged in as admin
2. Check if backend is running
3. Check network tab for API errors

### Issue: "Operation failed" error
**Solution:**
1. Check backend console for detailed errors
2. Ensure all required fields are filled
3. For bus delete: Make sure no students are assigned

## 📝 Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000/api
```

For production (deployed backend):
```env
VITE_API_URL=https://tripsync-uh0i.onrender.com/api
```

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Go to vercel.com and import repository
3. Set root directory to `frontend`
4. Add environment variable: `VITE_API_URL`
5. Deploy!

### Backend (Already Deployed)
- URL: https://tripsync-uh0i.onrender.com

## 💡 Tips
- Real-time bus location updates every 10 seconds
- Map is centered on VIT AP campus area
- All buses start at their first stop location
- Students are automatically distributed across routes
- Each driver is pre-assigned to one bus

## 📞 Support
For issues or questions, check the browser console and backend logs for detailed error messages.
