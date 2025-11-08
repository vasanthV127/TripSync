import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { colors, roleColors } from '../theme/colors'
import { FaUserGraduate, FaBus, FaUserShield } from 'react-icons/fa'

export default function RoleSelectionScreen() {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState(null)

  const roles = [
    { name: 'Student', icon: FaUserGraduate, color: roleColors.Student },
    { name: 'Driver', icon: FaBus, color: roleColors.Driver },
    { name: 'Admin', icon: FaUserShield, color: roleColors.Admin },
  ]

  const handleRoleSelect = (role) => {
    setSelectedRole(role.name)
    setTimeout(() => {
      navigate('/login', { state: { role: role.name } })
    }, 200)
  }

  return (
    <div 
      className="min-h-screen flex flex-col justify-center p-5"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-md w-full mx-auto">
        <h1 
          className="text-[45px] mb-10"
          style={{ 
            color: '#333',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 300,
          }}
        >
          Choose your role
        </h1>
        
        <div className="flex flex-wrap justify-center gap-5">
          {roles.map((role) => {
            const Icon = role.icon
            const isSelected = selectedRole === role.name
            
            return (
              <button
                key={role.name}
                onClick={() => handleRoleSelect(role)}
                className="w-[100px] h-[100px] flex flex-col items-center justify-center gap-1 p-3 rounded-[15px] border transition-all hover:shadow-lg active:scale-95"
                style={{
                  backgroundColor: isSelected ? role.color : colors.color3,
                  borderColor: role.color,
                  borderWidth: '1px',
                }}
              >
                <Icon 
                  size={30} 
                  color={isSelected ? colors.color3 : role.color}
                />
                <span 
                  className="text-[18px]"
                  style={{
                    color: isSelected ? colors.color3 : role.color,
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 400,
                  }}
                >
                  {role.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
