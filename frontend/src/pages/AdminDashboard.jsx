import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { FaBus, FaUserTie, FaUserGraduate, FaRoute, FaBell, FaBars, FaTimes, FaPlus, FaEdit, FaTrash, FaChartBar, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaExclamationTriangle, FaSearch, FaCamera, FaUsers } from 'react-icons/fa'
import { colors } from '../theme/colors'
import api from '../api'
import { useToast, ToastContainer } from '../components/Toast'
import FaceEnrollment from '../components/FaceEnrollment'
import StudentsView from '../components/admin/StudentsView'
import StatsCard from '../components/shared/StatsCard'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Component to update map center dynamically - DISABLED to prevent auto-centering
function MapCenterUpdater({ center }) {
  // Auto-centering disabled - users can manually pan the map
  return null
}

// Custom bus icon - Yellow location pin with bus symbol
const busIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="45" height="60">
      <!-- Location Pin Shape -->
      <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z" fill="#FFC107"/>
      
      <!-- White Circle Background -->
      <circle cx="192" cy="192" r="120" fill="white"/>
      
      <!-- Bus Icon -->
      <g transform="translate(192, 192)">
        <!-- Bus Body -->
        <rect x="-45" y="-30" width="90" height="60" rx="8" fill="#FFC107" stroke="#333" stroke-width="3"/>
        
        <!-- Bus Roof -->
        <rect x="-45" y="-30" width="90" height="15" fill="#FFB300"/>
        
        <!-- Windows -->
        <rect x="-38" y="-20" width="22" height="18" rx="2" fill="#87CEEB" stroke="#333" stroke-width="2"/>
        <rect x="-10" y="-20" width="22" height="18" rx="2" fill="#87CEEB" stroke="#333" stroke-width="2"/>
        <rect x="18" y="-20" width="22" height="18" rx="2" fill="#87CEEB" stroke="#333" stroke-width="2"/>
        
        <!-- Lower Windows -->
        <rect x="-38" y="5" width="22" height="15" rx="2" fill="#87CEEB" stroke="#333" stroke-width="2"/>
        <rect x="-10" y="5" width="22" height="15" rx="2" fill="#87CEEB" stroke="#333" stroke-width="2"/>
        <rect x="18" y="5" width="22" height="15" rx="2" fill="#87CEEB" stroke="#333" stroke-width="2"/>
        
        <!-- Wheels -->
        <circle cx="-28" cy="35" r="7" fill="#333"/>
        <circle cx="28" cy="35" r="7" fill="#333"/>
      </g>
    </svg>
  `),
  iconSize: [45, 60],
  iconAnchor: [22.5, 60],
  popupAnchor: [0, -60]
})

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { toast, toasts, removeToast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [buses, setBuses] = useState([])
  const [drivers, setDrivers] = useState([])
  const [students, setStudents] = useState([])
  const [parents, setParents] = useState([])
  const [routes, setRoutes] = useState([])
  const [stats, setStats] = useState({})
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedBus, setSelectedBus] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [formData, setFormData] = useState({})
  const [showFaceEnrollment, setShowFaceEnrollment] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loadingAttendance, setLoadingAttendance] = useState(false)

  // Fetch all data on mount
  useEffect(() => {
    fetchDashboardData()
    // Refresh bus locations every 10 seconds
    const interval = setInterval(() => {
      fetchBuses()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchBuses(),
        fetchDrivers(),
        fetchStudents(),
        fetchParents(),
        fetchRoutes(),
        fetchStats(),
        fetchComplaints()
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBuses = async () => {
    try {
      const response = await api.get('/api/admin/buses')
      const busesData = response.data?.buses || []
      setBuses(busesData)
    } catch (error) {
      console.error('❌ Error fetching buses:', error)
      console.error('Error details:', error.response?.data)
      setBuses([])
    }
  }

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/api/drivers/list')
      setDrivers(response.data?.drivers || [])
    } catch (error) {
      console.error('Error fetching drivers:', error)
      setDrivers([])
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await api.get('/api/admin/students')
      const students = response.data?.students || []
      // Normalize boarding field - ensure both boarding and boardingPoint are available
      const normalizedStudents = students.map(student => ({
        ...student,
        boardingPoint: student.boardingPoint || student.boarding,
        boarding: student.boarding || student.boardingPoint
      }))
      setStudents(normalizedStudents)
    } catch (error) {
      console.error('Error fetching students:', error)
      setStudents([])
    }
  }

  const fetchParents = async () => {
    try {
      const response = await api.get('/api/admin/parents')
      setParents(response.data?.parents || [])
    } catch (error) {
      console.error('Error fetching parents:', error)
      setParents([])
    }
  }

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/api/admin/routes')
      setRoutes(response.data?.routes || [])
    } catch (error) {
      console.error('Error fetching routes:', error)
      setRoutes([])
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/admin/dashboard')
      setStats(response.data?.statistics || {})
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats({})
    }
  }

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/api/messages/admin/complaints')
      setComplaints(response.data?.complaints || [])
    } catch (error) {
      console.error('Error fetching complaints:', error)
      setComplaints([])
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    navigate('/')
  }

  const openModal = (type, data = {}) => {
    setModalType(type)
    // For edit bus, store the original number for API call
    if (type === 'editBus') {
      setFormData({ ...data, originalNumber: data.number })
    } else if (type === 'editStudent') {
      // Normalize boarding point field name
      setFormData({ 
        ...data, 
        boardingPoint: data.boardingPoint || data.boarding || ''
      })
    } else if (type === 'viewAttendance') {
      // Fetch attendance records for this student
      setFormData(data)
      fetchAttendanceHistory(data.roll_no)
    } else {
      setFormData(data)
    }
    setShowModal(true)
  }

  const fetchAttendanceHistory = async (rollNo) => {
    setLoadingAttendance(true)
    try {
      const response = await api.get(`/api/attendance?roll_no=${rollNo}`)
      setAttendanceRecords(response.data?.records || [])
    } catch (error) {
      console.error('Error fetching attendance:', error)
      toast.error('Failed to load attendance history')
      setAttendanceRecords([])
    } finally {
      setLoadingAttendance(false)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setModalType(null)
    setFormData({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (modalType === 'addBus') {
        const busData = {
          number: formData.number,
          driverId: formData.driverId || null,
          route: formData.route || null
        }
        await api.post('/api/admin/buses', busData)
      } else if (modalType === 'editBus') {
        // Use original number for the API endpoint
        const updateData = {
          driverId: formData.driverId || null,
          route: formData.route || null
        }
        // If bus number changed, include it in the update
        if (formData.number !== formData.originalNumber) {
          updateData.newNumber = formData.number
        }
        await api.patch(`/api/admin/buses/${formData.originalNumber}`, updateData)
      } else if (modalType === 'deleteBus') {
        await api.delete(`/api/admin/buses/${formData.number}`)
      } else if (modalType === 'addDriver') {
        await api.post('/api/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password || 'default',
          phone: formData.phone,
          role: 'driver'
        })
      } else if (modalType === 'editDriver') {
        await api.patch(`/api/drivers/${formData._id}`, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        })
      } else if (modalType === 'addStudent') {
        // Use new admin endpoint that sets default password and sends email
        const response = await api.post('/api/admin/students', {
          roll_no: formData.roll_no,
          name: formData.name,
          email: formData.email,
          route: formData.route || null,
          boarding: formData.boarding || null,
          assignedBus: formData.assignedBus || null
        })
        
        // Show different message based on email status
        if (response.data.emailSent) {
          toast.success(`Student created! Welcome email sent to ${formData.email}`, 4000)
        } else {
          toast.success(
            `Student created successfully!\n\nCredentials (share manually):\nRoll No: ${response.data.rollNo}\nPassword: ${response.data.defaultPassword}\nEmail: ${formData.email}`,
            8000
          )
        }
      } else if (modalType === 'editStudent') {
        await api.patch(`/api/admin/students/${formData.roll_no}`, {
          name: formData.name,
          email: formData.email,
          route: formData.route || null,
          boardingPoint: formData.boardingPoint || null,
          assignedBus: formData.assignedBus || null
        })
      } else if (modalType === 'deleteStudent') {
        await api.delete(`/api/admin/students/${formData.roll_no}`)
      } else if (modalType === 'addParent') {
        await api.post('/api/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password || 'default',
          phone: formData.phone || '',
          role: 'parent',
          child: formData.child || null
        })
      } else if (modalType === 'editParent') {
        await api.patch(`/api/admin/parents/${formData._id}`, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          child: formData.child
        })
      } else if (modalType === 'deleteParent') {
        await api.delete(`/api/admin/parents/${formData._id}`)
      } else if (modalType === 'addRoute') {
        const stops = formData.stops ? formData.stops.split(',').map(s => s.trim()).filter(s => s) : []
        const coverageAreas = formData.coverageAreas ? formData.coverageAreas.split(',').map(s => s.trim()).filter(s => s) : []
        await api.post('/api/admin/routes', {
          name: formData.name,
          stops: stops,
          coverageAreas: coverageAreas
        })
      } else if (modalType === 'editRoute') {
        const stops = formData.stops ? formData.stops.split(',').map(s => s.trim()).filter(s => s) : []
        const coverageAreas = formData.coverageAreas ? formData.coverageAreas.split(',').map(s => s.trim()).filter(s => s) : []
        await api.patch(`/api/admin/routes/${formData.name}`, {
          stops: stops,
          coverageAreas: coverageAreas
        })
      } else if (modalType === 'deleteRoute') {
        await api.delete(`/api/admin/routes/${formData.name}`)
      } else if (modalType === 'broadcastAll') {
        await api.post('/api/messages/admin/broadcast/all-students', {
          content: formData.content
        })
      } else if (modalType === 'broadcastDrivers') {
        await api.post('/api/messages/admin/broadcast/all-drivers', {
          content: formData.content
        })
      } else if (modalType === 'broadcastRoute') {
        await api.post('/api/messages/admin/broadcast/route', {
          routeName: formData.routeName,
          content: formData.content,
          recipientType: formData.recipientType || 'students'
        })
      } else if (modalType === 'updateComplaint') {
        await api.patch(`/api/messages/admin/complaints/${formData._id}`, {
          status: formData.status,
          adminResponse: formData.adminResponse
        })
      }
      closeModal()
      await fetchDashboardData()
      toast.success('Operation successful!')
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.response?.data?.detail || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  // Sidebar menu items
  const menuItems = [
    { id: 'dashboard', icon: FaChartBar, label: 'Dashboard' },
    { id: 'buses', icon: FaBus, label: 'Buses' },
    { id: 'drivers', icon: FaUserTie, label: 'Drivers' },
    { id: 'students', icon: FaUserGraduate, label: 'Students' },
    { id: 'parents', icon: FaUsers, label: 'Parents' },
    { id: 'routes', icon: FaRoute, label: 'Routes' },
    { id: 'alerts', icon: FaBell, label: 'Alerts' },
  ]

  // Calculate map center from first bus with valid location, or use VIT-AP default
  const getMapCenter = () => {
    const busWithLocation = buses.find(bus => 
      bus.currentLocation && 
      bus.currentLocation.lat && 
      bus.currentLocation.long
    )
    
    if (busWithLocation) {
      const center = [busWithLocation.currentLocation.lat, busWithLocation.currentLocation.long]
      return center
    }
    
    // Default to VIT-AP MH1 Hostel location
    return [16.5096, 80.6470]
  }
  
  const mapCenter = getMapCenter()

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: colors.background }}>
      {/* Sidebar */}
      <div 
        className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden bg-white shadow-lg flex flex-col`}
      >
        <div className="p-4 border-b flex items-center justify-between" style={{ backgroundColor: colors.color2 }}>
          <h2 className="text-xl font-bold" style={{ color: colors.color1, fontFamily: "'Poppins', sans-serif" }}>
            TripSync Admin
          </h2>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <FaTimes style={{ color: colors.color1 }} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 transition ${
                activeSection === item.id ? 'bg-gray-100 border-l-4' : 'hover:bg-gray-50'
              }`}
              style={{
                borderLeftColor: activeSection === item.id ? colors.color1 : 'transparent',
                fontFamily: "'Poppins', sans-serif"
              }}
            >
              <item.icon className="text-lg" style={{ color: activeSection === item.id ? colors.color1 : '#666' }} />
              <span className={activeSection === item.id ? 'font-semibold' : ''}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full py-2 rounded-lg transition hover:opacity-90"
            style={{ 
              backgroundColor: colors.color2,
              color: colors.color1,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="text-2xl">
                <FaBars />
              </button>
            )}
            <h1 className="text-2xl font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{stats.totalBuses || 0}</span> Buses • 
              <span className="font-medium ml-2">{stats.totalDrivers || 0}</span> Drivers • 
              <span className="font-medium ml-2">{stats.totalStudents || 0}</span> Students
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-t-yellow-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-lg font-medium text-gray-600" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Loading dashboard...
                </p>
              </div>
            </div>
          ) : (
            <>
              {activeSection === 'dashboard' && <DashboardView buses={buses} stats={stats} mapCenter={mapCenter} busIcon={busIcon} />}
              {activeSection === 'buses' && <BusesView buses={buses} openModal={openModal} fetchBuses={fetchBuses} />}
              {activeSection === 'drivers' && <DriversView drivers={drivers} openModal={openModal} />}
              {activeSection === 'students' && <StudentsView students={students} openModal={openModal} onEnrollFace={(student) => { 
                setSelectedStudent(student);
                setShowFaceEnrollment(true);
              }} />}
              {activeSection === 'parents' && <ParentsView parents={parents} students={students} openModal={openModal} />}
              {activeSection === 'routes' && <RoutesView routes={routes} openModal={openModal} />}
              {activeSection === 'alerts' && <AlertsView complaints={complaints} routes={routes} openModal={openModal} fetchComplaints={fetchComplaints} />}
            </>
          )}
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal 
          type={modalType}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={closeModal}
          routes={routes}
          drivers={drivers}
          buses={buses}
          students={students}
          submitting={submitting}
          attendanceRecords={attendanceRecords}
          loadingAttendance={loadingAttendance}
        />
      )}

      {/* Face Enrollment Modal */}
      {showFaceEnrollment && selectedStudent && (
        <FaceEnrollment 
          student={selectedStudent}
          onSuccess={() => { 
            setShowFaceEnrollment(false); 
            fetchDashboardData(); 
          }}
          onClose={() => setShowFaceEnrollment(false)}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

// Dashboard View with Map
function DashboardView({ buses, stats, mapCenter, busIcon }) {
  // Generate a unique key based on bus locations to force map re-render when locations change
  const mapKey = buses
    .filter(b => b.currentLocation?.lat && b.currentLocation?.long)
    .map(b => `${b.number}-${b.currentLocation.lat}-${b.currentLocation.long}`)
    .join('_') || 'default-map'
  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Buses" value={stats.totalBuses || 0} icon={FaBus} color="#FFC812" />
        <StatCard title="Active Drivers" value={stats.totalDrivers || 0} icon={FaUserTie} color="#29B6F6" />
        <StatCard title="Students" value={stats.totalStudents || 0} icon={FaUserGraduate} color="#FFA726" />
        <StatCard title="Routes" value={stats.totalRoutes || 0} icon={FaRoute} color="#66BB6A" />
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
        <MapContainer 
          key={mapKey}
          center={mapCenter} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <MapCenterUpdater center={mapCenter} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {buses.map((bus, idx) => {
            if (bus.currentLocation && bus.currentLocation.lat && bus.currentLocation.long) {
              return (
                <Marker 
                  key={idx}
                  position={[bus.currentLocation.lat, bus.currentLocation.long]}
                  icon={busIcon}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold text-lg">{bus.number}</h3>
                      <p className="text-sm">Route: {bus.route}</p>
                      <p className="text-sm">Driver: {bus.driver?.name || 'Not Assigned'}</p>
                      <p className="text-xs text-gray-500">
                        Lat: {bus.currentLocation.lat.toFixed(4)}, Long: {bus.currentLocation.long.toFixed(4)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Last updated: {new Date(bus.currentLocation.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )
            }
            return null
          })}
        </MapContainer>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
      <div className="p-3 rounded-full" style={{ backgroundColor: color + '20' }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div>
        <p className="text-sm text-gray-600" style={{ fontFamily: "'Poppins', sans-serif" }}>{title}</p>
        <p className="text-3xl font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>{value}</p>
      </div>
    </div>
  )
}

// Buses View
function BusesView({ buses, openModal, fetchBuses }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRoute, setFilterRoute] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Get unique routes for filters
  const uniqueRoutes = [...new Set(buses.map(b => b.route).filter(Boolean))]

  // Filter and search buses
  const filteredBuses = buses.filter(bus => {
    const matchesSearch = searchTerm === '' || 
      bus.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.driver?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRoute = filterRoute === '' || bus.route === filterRoute
    const matchesStatus = filterStatus === '' || 
      (filterStatus === 'active' && bus.driver) ||
      (filterStatus === 'idle' && !bus.driver)

    return matchesSearch && matchesRoute && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Buses</h2>
        <button
          onClick={() => openModal('addBus')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition hover:opacity-90"
          style={{ backgroundColor: colors.color2, color: colors.color1 }}
        >
          <FaPlus /> Add Bus
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Bus
            </label>
            <input
              type="text"
              placeholder="Search by bus number or driver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Filter by Route */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Route
            </label>
            <select
              value={filterRoute}
              onChange={(e) => setFilterRoute(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">All Routes</option>
              {uniqueRoutes.map((route, idx) => (
                <option key={idx} value={route}>{route}</option>
              ))}
            </select>
          </div>

          {/* Filter by Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="idle">Idle</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterRoute('')
                setFilterStatus('')
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredBuses.length} of {buses.length} buses
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBuses.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
            <FaBus className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              {buses.length === 0 ? 'No buses found' : 'No buses match your filters'}
            </p>
            <p className="text-gray-400 text-sm">
              {buses.length === 0 
                ? 'Click "Add Bus" to create your first bus'
                : 'Try adjusting your search or filter criteria'}
            </p>
          </div>
        ) : (
          filteredBuses.map((bus, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 border-l-4" style={{ borderLeftColor: colors.color2 }}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.color2}20` }}>
                    <FaBus className="text-2xl" style={{ color: colors.color2 }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl" style={{ color: colors.color1 }}>{bus.number}</h3>
                    <p className="text-sm text-gray-500">
                      {bus.driver ? (
                        <span className="flex items-center gap-1">
                          <FaCheckCircle className="text-green-500" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <FaTimesCircle className="text-gray-400" />
                          Idle
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openModal('editBus', bus)} 
                    className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition"
                    title="Edit Bus"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button 
                    onClick={() => openModal('deleteBus', bus)} 
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"
                    title="Delete Bus"
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FaRoute className="text-gray-400" />
                    Route
                  </span>
                  <span className="font-semibold text-gray-800">{bus.route || 'Not Assigned'}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FaUserTie className="text-gray-400" />
                    Driver
                  </span>
                  <span className="font-semibold text-gray-800">{bus.driver?.name || 'Not Assigned'}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FaUserGraduate className="text-gray-400" />
                    Students
                  </span>
                  <span className="font-semibold px-3 py-1 rounded-full text-white text-xs" style={{ backgroundColor: colors.color2 }}>
                    {bus.studentCount || 0}
                  </span>
                </div>
              </div>

              {bus.currentLocation && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-gray-400" />
                    Last Location: {bus.currentLocation.lat.toFixed(4)}, {bus.currentLocation.long.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Drivers View
function DriversView({ drivers, openModal }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBus, setFilterBus] = useState('')

  // Get unique buses for filters
  const uniqueBuses = [...new Set(drivers.map(d => d.assignedBus).filter(Boolean))]

  // Filter and search drivers
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = searchTerm === '' || 
      driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesBus = filterBus === '' || driver.assignedBus === filterBus

    return matchesSearch && matchesBus
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Drivers</h2>
        <button
          onClick={() => openModal('addDriver')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition hover:opacity-90"
          style={{ backgroundColor: colors.color2, color: colors.color1 }}
        >
          <FaPlus /> Add Driver
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Driver
            </label>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Filter by Bus */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Bus
            </label>
            <select
              value={filterBus}
              onChange={(e) => setFilterBus(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">All Buses</option>
              {uniqueBuses.map((bus, idx) => (
                <option key={idx} value={bus}>{bus}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterBus('')
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredDrivers.length} of {drivers.length} drivers
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Bus</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDrivers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12">
                  <div className="text-center">
                    <FaUserTie className="mx-auto text-6xl text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg mb-2">
                      {drivers.length === 0 ? 'No drivers found' : 'No drivers match your filters'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {drivers.length === 0 
                        ? 'Click "Add Driver" to create your first driver'
                        : 'Try adjusting your search or filter criteria'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredDrivers.map((driver, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{driver.name}</td>
                  <td className="px-6 py-4">{driver.email}</td>
                  <td className="px-6 py-4">{driver.phone || 'N/A'}</td>
                  <td className="px-6 py-4">{driver.assignedBus || 'Not Assigned'}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => openModal('editDriver', driver)} className="text-blue-500 hover:text-blue-700 mr-3">
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Parents View
function ParentsView({ parents, students, openModal }) {
  const [searchTerm, setSearchTerm] = useState('')

  // Filter and search parents
  const filteredParents = parents.filter(parent => {
    const matchesSearch = searchTerm === '' || 
      parent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.child?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  // Get student name from roll_no
  const getStudentName = (childRollNo) => {
    if (!childRollNo) return 'Not Assigned'
    const student = students.find(s => s.roll_no === childRollNo)
    return student ? `${student.name} (${student.roll_no})` : childRollNo
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Parents</h2>
        <button
          onClick={() => openModal('addParent')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition hover:opacity-90"
          style={{ backgroundColor: colors.color2, color: colors.color1 }}
        >
          <FaPlus /> Add Parent
        </button>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Parent
            </label>
            <input
              type="text"
              placeholder="Search by name, email, or assigned student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => setSearchTerm('')}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Clear Search
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredParents.length} of {parents.length} parents
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredParents.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <FaUsers size={48} className="mb-3 opacity-30" />
                    <p className="text-lg font-medium">No Parents Found</p>
                    <p className="text-sm mt-1">
                      {searchTerm ? 'Try adjusting your search criteria' : 'Click "Add Parent" to create a new parent account'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredParents.map((parent, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{parent.name}</td>
                  <td className="px-6 py-4">{parent.email}</td>
                  <td className="px-6 py-4">{parent.phone || 'N/A'}</td>
                  <td className="px-6 py-4">{getStudentName(parent.child)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openModal('editParent', parent)} 
                        className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition"
                        title="Edit Parent"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button 
                        onClick={() => openModal('deleteParent', parent)} 
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"
                        title="Delete Parent"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Routes View
function RoutesView({ routes, openModal }) {
  const [searchTerm, setSearchTerm] = useState('')

  // Filter and search routes
  const filteredRoutes = routes.filter(route => {
    const matchesSearch = searchTerm === '' || 
      route.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.stops?.some(stop => 
        (typeof stop === 'string' ? stop : stop.name)?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    
    return matchesSearch
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Routes</h2>
        <button
          onClick={() => openModal('addRoute')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition hover:opacity-90"
          style={{ backgroundColor: colors.color2, color: colors.color1 }}
        >
          <FaPlus /> Add Route
        </button>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Routes
            </label>
            <input
              type="text"
              placeholder="Search by route name or stop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Clear Search */}
          <div className="flex items-end">
            <button
              onClick={() => setSearchTerm('')}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Clear Search
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredRoutes.length} of {routes.length} routes
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRoutes.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
            <FaRoute className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              {routes.length === 0 ? 'No routes found' : 'No routes match your search'}
            </p>
            <p className="text-gray-400 text-sm">
              {routes.length === 0 
                ? 'Click "Add Route" to create your first route'
                : 'Try adjusting your search criteria'}
            </p>
          </div>
        ) : (
          filteredRoutes.map((route, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 border-l-4" style={{ borderLeftColor: colors.color2 }}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.color2}20` }}>
                    <FaRoute className="text-2xl" style={{ color: colors.color2 }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl" style={{ color: colors.color1 }}>{route.name}</h3>
                    <p className="text-sm text-gray-500">{route.stops?.length || 0} stops</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openModal('editRoute', route)} 
                    className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition"
                    title="Edit Route"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button 
                    onClick={() => openModal('deleteRoute', route)} 
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"
                    title="Delete Route"
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FaBus className="text-gray-400" />
                    Buses
                  </span>
                  <span className="font-semibold px-3 py-1 rounded-full text-white text-xs" style={{ backgroundColor: colors.color2 }}>
                    {route.busCount || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FaUserGraduate className="text-gray-400" />
                    Students
                  </span>
                  <span className="font-semibold px-3 py-1 rounded-full text-white text-xs" style={{ backgroundColor: colors.color2 }}>
                    {route.studentCount || 0}
                  </span>
                </div>
              </div>

              {route.stops && route.stops.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Stops:</p>
                  <div className="max-h-32 overflow-y-auto">
                    <ul className="space-y-1">
                      {route.stops.slice(0, 5).map((stop, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                          <span className="text-gray-400 mt-1">•</span>
                          <span>{typeof stop === 'object' ? stop.name : stop}</span>
                        </li>
                      ))}
                      {route.stops.length > 5 && (
                        <li className="text-xs text-gray-400 italic">+{route.stops.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {route.coverageAreas && route.coverageAreas.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Coverage Areas:</p>
                  <p className="text-xs text-gray-600">{route.coverageAreas.join(', ')}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Alerts View with Messaging and Complaints
function AlertsView({ complaints, routes, openModal, fetchComplaints }) {
  const [activeTab, setActiveTab] = useState('broadcast')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredComplaints = filterStatus === 'all' 
    ? complaints 
    : complaints.filter(c => c.status === filterStatus)

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`px-4 py-2 font-medium ${activeTab === 'broadcast' ? 'border-b-2 text-blue-600' : 'text-gray-600'}`}
          style={{ borderColor: activeTab === 'broadcast' ? colors.color1 : 'transparent' }}
        >
          Broadcast Messages
        </button>
        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-4 py-2 font-medium ${activeTab === 'complaints' ? 'border-b-2 text-blue-600' : 'text-gray-600'}`}
          style={{ borderColor: activeTab === 'complaints' ? colors.color1 : 'transparent' }}
        >
          Complaints ({complaints.length})
        </button>
      </div>

      {activeTab === 'broadcast' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Send Broadcast Messages</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Broadcast to All Students */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <FaUserGraduate className="text-orange-500" />
                All Students
              </h3>
              <p className="text-sm text-gray-600 mb-4">Send message to all students in the system</p>
              <button
                onClick={() => openModal('broadcastAll', {})}
                className="w-full py-2 px-4 rounded-lg transition hover:opacity-90"
                style={{ backgroundColor: colors.color2, color: colors.color1 }}
              >
                Send Message
              </button>
            </div>

            {/* Broadcast to All Drivers */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <FaUserTie className="text-blue-500" />
                All Drivers
              </h3>
              <p className="text-sm text-gray-600 mb-4">Send message to all drivers in the system</p>
              <button
                onClick={() => openModal('broadcastDrivers', {})}
                className="w-full py-2 px-4 rounded-lg transition hover:opacity-90"
                style={{ backgroundColor: colors.color2, color: colors.color1 }}
              >
                Send Message
              </button>
            </div>

            {/* Broadcast to Route */}
            <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <FaRoute className="text-green-500" />
                Route-Specific Message
              </h3>
              <p className="text-sm text-gray-600 mb-4">Send message to students/drivers on a specific route</p>
              <button
                onClick={() => openModal('broadcastRoute', {})}
                className="w-full py-2 px-4 rounded-lg transition hover:opacity-90"
                style={{ backgroundColor: colors.color2, color: colors.color1 }}
              >
                Send to Route
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'complaints' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Student Complaints</h2>
            <div className="flex gap-2">
              {['all', 'pending', 'in_progress', 'resolved'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1 rounded text-sm ${
                    filterStatus === status ? 'bg-yellow-500 text-black' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {status.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredComplaints.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <FaExclamationTriangle className="mx-auto text-6xl text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg mb-2">No complaints found</p>
                <p className="text-gray-400 text-sm">
                  {filterStatus !== 'all' 
                    ? `No ${filterStatus.replace('_', ' ')} complaints at this time` 
                    : 'Complaints will appear here when students submit them'}
                </p>
              </div>
            ) : (
              filteredComplaints.map((complaint, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold">{complaint.studentName}</h3>
                      <p className="text-sm text-gray-600">Roll No: {complaint.rollNo}</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${
                      complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {complaint.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">{complaint.category}</span>
                    <span className="text-xs text-gray-500 ml-2">Bus: {complaint.busNumber}</span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2">{complaint.description}</p>
                  
                  {complaint.adminResponse && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-2 mb-2">
                      <p className="text-xs font-semibold text-blue-700">Admin Response:</p>
                      <p className="text-sm text-blue-900">{complaint.adminResponse}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">
                      {new Date(complaint.submittedAt).toLocaleDateString()}
                    </span>
                    {complaint.status !== 'resolved' && (
                      <button
                        onClick={() => openModal('updateComplaint', complaint)}
                        className="text-sm px-3 py-1 rounded transition hover:opacity-90"
                        style={{ backgroundColor: colors.color2, color: colors.color1 }}
                      >
                        Update Status
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Main AdminDashboard component continues below with other view components...

// Modal Component
function Modal({ type, formData, setFormData, onSubmit, onClose, routes, drivers, buses, students, submitting, attendanceRecords, loadingAttendance }) {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{type.replace(/([A-Z])/g, ' $1').trim()}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={submitting}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {type === 'addBus' || type === 'editBus' ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Bus Number</label>
                <input
                  name="number"
                  placeholder="Bus Number (e.g., Bus1)"
                  value={formData.number || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                />
                {type === 'editBus' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Warning: Changing the bus number will affect all related records
                  </p>
                )}
              </div>
              <select
                name="route"
                value={formData.route || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Select Route</option>
                {routes.map((route, idx) => (
                  <option key={idx} value={route.name}>{route.name}</option>
                ))}
              </select>
              <select
                name="driverId"
                value={formData.driverId || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Select Driver (Optional)</option>
                {drivers.map((driver, idx) => (
                  <option key={idx} value={driver._id}>{driver.name}</option>
                ))}
              </select>
            </>
          ) : type === 'addDriver' || type === 'editDriver' ? (
            <>
              <input
                name="name"
                placeholder="Driver Name"
                value={formData.name || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                name="phone"
                placeholder="Phone"
                value={formData.phone || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
              {type === 'addDriver' && (
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                />
              )}
            </>
          ) : type === 'addStudent' ? (
            <>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Password will be automatically set to the student's roll number. 
                  A welcome email with login credentials will be sent automatically.
                </p>
              </div>
              <input
                name="roll_no"
                placeholder="Roll Number (e.g., 22BEC7001)"
                value={formData.roll_no || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                name="name"
                placeholder="Student Name"
                value={formData.name || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
              <select
                name="route"
                value={formData.route || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Select Route (Optional)</option>
                {routes.map((route, idx) => (
                  <option key={idx} value={route.name}>{route.name}</option>
                ))}
              </select>
              
              {/* Boarding point dropdown - shows stops from selected route */}
              <select
                name="boarding"
                value={formData.boarding || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                disabled={!formData.route}
              >
                <option value="">
                  {formData.route ? 'Select Boarding Point' : 'Select Route First'}
                </option>
                {formData.route && (() => {
                  const selectedRoute = routes.find(r => r.name === formData.route);
                  const stops = selectedRoute?.stops || [];
                  
                  if (stops.length === 0) {
                    return <option disabled>No stops available for this route</option>;
                  }
                  
                  return stops.map((stop, idx) => (
                    <option key={idx} value={typeof stop === 'object' ? stop.name : stop}>
                      {typeof stop === 'object' ? stop.name : stop}
                    </option>
                  ));
                })()}
              </select>
              
              {/* Bus dropdown - shows only buses assigned to the selected route */}
              <select
                name="assignedBus"
                value={formData.assignedBus || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Select Bus (Optional)</option>
                {buses
                  .filter(bus => !formData.route || bus.route === formData.route)
                  .map((bus, idx) => (
                    <option key={idx} value={bus.number}>
                      {bus.number} {bus.route ? `(${bus.route})` : '(No Route)'}
                    </option>
                  ))
                }
              </select>
            </>
          ) : type === 'editStudent' ? (
            <>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Update student information. Changes will be reflected immediately.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Roll Number</label>
                <input
                  name="roll_no"
                  placeholder="Roll Number"
                  value={formData.roll_no || ''}
                  onChange={handleChange}
                  required
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Roll number cannot be changed</p>
              </div>
              <input
                name="name"
                placeholder="Student Name"
                value={formData.name || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
              <select
                name="route"
                value={formData.route || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Select Route (Optional)</option>
                {routes.map((route, idx) => (
                  <option key={idx} value={route.name}>{route.name}</option>
                ))}
              </select>
              
              {/* Boarding point dropdown */}
              <select
                name="boardingPoint"
                value={formData.boardingPoint || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                disabled={!formData.route}
              >
                <option value="">
                  {formData.route ? 'Select Boarding Point' : 'Select Route First'}
                </option>
                {formData.route && (() => {
                  const selectedRoute = routes.find(r => r.name === formData.route);
                  const stops = selectedRoute?.stops || [];
                  
                  if (stops.length === 0) {
                    return <option disabled>No stops available for this route</option>;
                  }
                  
                  return stops.map((stop, idx) => (
                    <option key={idx} value={typeof stop === 'object' ? stop.name : stop}>
                      {typeof stop === 'object' ? stop.name : stop}
                    </option>
                  ));
                })()}
              </select>
              
              {/* Bus dropdown */}
              <select
                name="assignedBus"
                value={formData.assignedBus || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Select Bus (Optional)</option>
                {buses
                  .filter(bus => !formData.route || bus.route === formData.route)
                  .map((bus, idx) => (
                    <option key={idx} value={bus.number}>
                      {bus.number} {bus.route ? `(${bus.route})` : '(No Route)'}
                    </option>
                  ))
                }
              </select>
            </>
          ) : type === 'deleteStudent' ? (
            <div className="space-y-3">
              <p className="text-gray-600">
                Are you sure you want to delete this student?
              </p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><strong>Roll No:</strong> {formData.roll_no}</p>
                <p><strong>Name:</strong> {formData.name}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Route:</strong> {formData.route || 'Not Assigned'}</p>
                <p><strong>Bus:</strong> {formData.assignedBus || 'Not Assigned'}</p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-500 p-3">
                <p className="text-sm text-red-700">
                  <strong>Warning:</strong> This action cannot be undone. The student will be permanently removed from the system.
                </p>
              </div>
            </div>
          ) : type === 'viewAttendance' ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg space-y-2 mb-4">
                <p><strong>Roll No:</strong> {formData.roll_no}</p>
                <p><strong>Name:</strong> {formData.name}</p>
                <p><strong>Route:</strong> {formData.route || 'Not Assigned'}</p>
                <p><strong>Bus:</strong> {formData.assignedBus || 'Not Assigned'}</p>
              </div>
              
              {loadingAttendance ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : attendanceRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No attendance records found for this student.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bus</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Boarding</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceRecords.map((record, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{record.date}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{record.time}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{record.busNumber}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{record.boarding || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              record.status === 'Boarded' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 text-sm text-gray-600 text-center">
                    Total Records: {attendanceRecords.length}
                  </div>
                </div>
              )}
            </div>
          ) : type === 'addParent' || type === 'editParent' ? (
            <>
              <input
                name="name"
                placeholder="Parent Name"
                value={formData.name || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                name="phone"
                placeholder="Phone Number"
                value={formData.phone || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
              {type === 'addParent' && (
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                />
              )}
              <select
                name="child"
                value={formData.child || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Select Assigned Student (Optional)</option>
                {students.map((student, idx) => (
                  <option key={idx} value={student.roll_no}>
                    {student.name} ({student.roll_no})
                  </option>
                ))}
              </select>
            </>
          ) : type === 'deleteParent' ? (
            <div className="space-y-3">
              <p className="text-gray-600">
                Are you sure you want to delete this parent?
              </p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><strong>Name:</strong> {formData.name}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Assigned Student:</strong> {formData.child || 'Not Assigned'}</p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-500 p-3">
                <p className="text-sm text-red-700">
                  <strong>Warning:</strong> This action cannot be undone. The parent account will be permanently removed from the system.
                </p>
              </div>
            </div>
          ) : type === 'addRoute' || type === 'editRoute' ? (
            <>
              <input
                name="name"
                placeholder="Route Name (e.g., Route A)"
                value={formData.name || ''}
                onChange={handleChange}
                required
                disabled={type === 'editRoute'}
                className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-100"
              />
              <textarea
                name="stops"
                placeholder="Stops (comma-separated, e.g., Vijayawada, Guntur, Tenali)"
                value={Array.isArray(formData.stops) ? formData.stops.join(', ') : formData.stops || ''}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <textarea
                name="coverageAreas"
                placeholder="Coverage Areas (comma-separated, optional)"
                value={Array.isArray(formData.coverageAreas) ? formData.coverageAreas.join(', ') : formData.coverageAreas || ''}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </>
          ) : type === 'deleteRoute' ? (
            <p className="text-gray-600">
              Are you sure you want to delete route <strong>{formData.name}</strong>?
              {formData.busCount > 0 && (
                <span className="block mt-2 text-red-600">
                  Warning: {formData.busCount} buses are assigned to this route.
                </span>
              )}
              {formData.studentCount > 0 && (
                <span className="block mt-1 text-red-600">
                  Warning: {formData.studentCount} students are assigned to this route.
                </span>
              )}
            </p>
          ) : type === 'deleteBus' ? (
            <p>Are you sure you want to delete bus <strong>{formData.number}</strong>?</p>
          ) : type === 'broadcastAll' || type === 'broadcastDrivers' ? (
            <>
              <label className="block text-sm font-medium mb-2">Message Content</label>
              <textarea
                name="content"
                placeholder="Enter your message here..."
                value={formData.content || ''}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <p className="text-xs text-gray-500">
                This message will be sent to {type === 'broadcastAll' ? 'all students' : 'all drivers'}
              </p>
            </>
          ) : type === 'broadcastRoute' ? (
            <>
              <label className="block text-sm font-medium mb-2">Select Route</label>
              <select
                name="routeName"
                value={formData.routeName || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Select Route</option>
                {routes.map((route, idx) => (
                  <option key={idx} value={route.name}>{route.name}</option>
                ))}
              </select>
              
              <label className="block text-sm font-medium mb-2">Recipient Type</label>
              <select
                name="recipientType"
                value={formData.recipientType || 'students'}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="students">Students Only</option>
                <option value="drivers">Drivers Only</option>
                <option value="all">Students & Drivers</option>
              </select>
              
              <label className="block text-sm font-medium mb-2">Message Content</label>
              <textarea
                name="content"
                placeholder="Enter your message here..."
                value={formData.content || ''}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </>
          ) : type === 'updateComplaint' ? (
            <>
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p className="text-sm font-semibold">Student: {formData.studentName}</p>
                <p className="text-sm">Roll No: {formData.rollNo}</p>
                <p className="text-sm">Category: {formData.category}</p>
                <p className="text-sm mt-2">{formData.description}</p>
              </div>
              
              <label className="block text-sm font-medium mb-2">Update Status</label>
              <select
                name="status"
                value={formData.status || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              
              <label className="block text-sm font-medium mb-2">Admin Response</label>
              <textarea
                name="adminResponse"
                placeholder="Add your response to the student..."
                value={formData.adminResponse || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </>
          ) : null}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {type === 'viewAttendance' ? 'Close' : 'Cancel'}
            </button>
            {type !== 'viewAttendance' && (
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 rounded-lg transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: colors.color2, color: colors.color1 }}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {type.includes('delete') ? 'Deleting...' : 
                     type.includes('add') ? 'Creating...' : 
                     type.includes('broadcast') || type.includes('Complaint') ? 'Sending...' :
                     'Saving...'}
                  </>
                ) : (
                  type.includes('delete') ? 'Delete' : 
                  type.includes('add') ? 'Create' :
                  type.includes('broadcast') || type.includes('Complaint') ? 'Send' :
                  'Save'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

