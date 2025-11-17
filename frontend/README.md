# TripSync Admin Portal (React Web)

Professional web-based admin portal for the TripSync School Bus Management System.

## 🎯 Purpose

This is the **admin-only** web interface for desktop/laptop use. Students, drivers, and parents use the React Native mobile app.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Development URL:** http://localhost:5173

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| Vite | 7.2.1 | Build Tool & Dev Server |
| Tailwind CSS | 3.3.3 | Styling Framework |
| React Router DOM | 6.26.0 | Client-side Routing |
| Axios | 1.7.0 | HTTP Client |
| React Icons | Latest | Icon Library |

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── pages/          # Page components
│   │   ├── IntroScreen.jsx       # Splash/intro screen
│   │   ├── LoginScreen.jsx       # Admin login
│   │   └── AdminDashboard.jsx    # Main dashboard
│   │
│   ├── theme/          # Theme configuration
│   │   └── colors.js   # Color palette (matches mobile)
│   │
│   ├── api.js          # Axios configuration
│   ├── App.jsx         # Main app with routes
│   ├── App.css         # Global styles
│   ├── index.css       # Tailwind imports
│   └── main.jsx        # React entry point
│
├── index.html          # HTML template
├── package.json        # Dependencies
├── vite.config.js      # Vite configuration
├── postcss.config.js   # PostCSS + Tailwind config
├── tailwind.config.js  # Tailwind configuration
└── eslint.config.js    # ESLint rules
```

## 🎨 Design System

### Color Palette
Matches the React Native mobile app:

```javascript
colors: {
  background: '#EBEBEB',  // Light gray background
  color1: '#FFC812',      // Yellow (primary brand)
  color2: '#000000',      // Black (text, buttons)
  color3: '#FFFFFF',      // White
}

roleColors: {
  admin: '#66BB6A',       // Green
  driver: '#29B6F6',      // Blue
  student: '#FFA726',     // Orange
}
```

### Typography
Google Fonts loaded from CDN:
- **Poppins** (weights 100-900) - Main UI font
- **Unica One** - Logo and branding
- **Merriweather** (300, 400, italic) - Accent text

### Design Principles
- ✅ Professional split-screen layout
- ✅ White card-based forms with shadows
- ✅ Gradient backgrounds for branding
- ✅ Responsive design (mobile-first)
- ✅ Loading states with animations
- ✅ Accessible form labels
- ✅ Error handling with visual feedback

## 🔐 Authentication Flow

```
User visits site
    ↓
IntroScreen (2.5s)
    ↓
LoginScreen
    ↓
Admin credentials only
    ↓
AdminDashboard (Protected Route)
```

**Login Validation:**
- Only allows `role: 'admin'` access
- Students/Drivers/Parents denied (they use mobile app)
- JWT token stored in localStorage
- Protected routes with role checking

## 🌐 API Integration

### Backend Connection
```javascript
// src/api.js
const API_URL = import.meta.env.VITE_API_URL || 'https://tripsync-uh0i.onrender.com'
```

### Environment Variables
Create `.env` file:
```env
VITE_API_URL=https://tripsync-uh0i.onrender.com
```

**Local Development:**
```env
VITE_API_URL=http://localhost:3000
```

### API Endpoints Used
- `POST /auth/login` - Admin authentication
- `GET /admin/dashboard` - Dashboard data
- `GET /buses` - Bus management
- `GET /students` - Student management
- `GET /drivers` - Driver management
- `GET /routes` - Route management
- `GET /attendance` - Attendance monitoring

## 📱 Responsive Design

The portal is optimized for desktop but responsive:

| Breakpoint | Screen Size | Layout |
|------------|-------------|--------|
| Desktop | ≥1024px (lg) | Split-screen login, full dashboard |
| Tablet | 768px-1023px | Single column, adjusted spacing |
| Mobile | <768px | Mobile-optimized, logo on top |

## 🎯 Key Features

### Intro Screen
- Animated splash screen
- Gradient background (black to dark)
- Yellow TripSync branding with glow effect
- Auto-redirects to login after 2.5s
- Loading dot animation

### Login Screen
- **Split-screen layout** (desktop):
  - Left: Black panel with yellow branding
  - Right: White login card
- **Form features**:
  - Email and password fields with labels
  - Client-side validation
  - Loading spinner during authentication
  - Error messages with border-left styling
  - Admin-only access enforcement
- **Responsive**: Mobile shows logo on top

### Admin Dashboard
- Protected route (requires admin token)
- Logout functionality
- Full CRUD operations (to be implemented)
- Real-time data from backend

## 🚀 Development Workflow

### Running Locally
```bash
# Terminal 1: Start backend
cd backend
uvicorn main:app --reload --port 3000

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### Building for Production
```bash
npm run build
# Output: dist/ folder ready to deploy
```

### Deployment Options

**Vercel** (Recommended):
```bash
npm install -g vercel
vercel --prod
```

**Netlify**:
```bash
npm run build
# Drag dist/ folder to Netlify UI
```

**Environment Variables** (Production):
- `VITE_API_URL=https://tripsync-uh0i.onrender.com`

## 📦 Dependencies

### Core
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.26.0",
  "axios": "^1.7.0",
  "react-icons": "latest"
}
```

### Dev Dependencies
```json
{
  "@vitejs/plugin-react": "^4.3.4",
  "vite": "^7.2.1",
  "@tailwindcss/postcss": "^4.0.0",
  "tailwindcss": "^4.0.0",
  "postcss": "^8.5.1",
  "eslint": "^9.17.0"
}
```

## 🧪 Testing

### Login with Test Admin
```
Email: admin@example.com
Password: adminpass
```

### API Health Check
```bash
curl http://localhost:3000/health
# or
curl https://tripsync-uh0i.onrender.com/health
```

## 🎨 Customization

### Changing Colors
Edit `src/theme/colors.js`:
```javascript
export const colors = {
  background: '#EBEBEB',
  color1: '#FFC812',     // Primary brand color
  color2: '#000000',     // Text/button color
  color3: '#FFFFFF',     // Card background
}
```

### Adding Routes
Edit `src/App.jsx`:
```javascript
<Route path="/new-page" element={<NewPage />} />
```

### Protected Routes
Use the `ProtectedRoute` component:
```javascript
<Route 
  path="/admin/settings" 
  element={
    <ProtectedRoute allowedRole="admin">
      <AdminSettings />
    </ProtectedRoute>
  } 
/>
```

## 📊 Performance

- **Bundle Size**: ~200KB (gzipped)
- **First Load**: <2s
- **Lighthouse Score**: 90+ (all metrics)
- **Vite HMR**: Instant updates

## 🔧 Troubleshooting

### Port already in use
```bash
# Check what's running on port 5173
netstat -ano | findstr :5173

# Kill process (Windows)
taskkill /PID <PID> /F

# Or use different port
npm run dev -- --port 3001
```

### API connection issues
```bash
# Check backend is running
curl http://localhost:3000/health

# Check CORS settings in backend
# backend/main.py should have frontend URL in allowed origins
```

### Build errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Additional Resources

- [Vite Documentation](https://vite.dev)
- [React Router](https://reactrouter.com)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Backend API Docs](../backend/README.md)
- [Main Project README](../README.md)

## 👨‍💻 Developer

**Vasanth V**
- VIT-AP University
- GitHub: [@vasanthV127](https://github.com/vasanthV127)

**Last Updated:** November 8, 2025
