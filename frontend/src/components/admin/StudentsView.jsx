import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCamera, FaUserGraduate } from 'react-icons/fa';
import { colors } from '../../theme/colors';

const StudentsView = ({ students, openModal, onEnrollFace }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRoute, setFilterRoute] = useState('');
  const [filterBus, setFilterBus] = useState('');

  // Get unique routes and buses for filters
  const uniqueRoutes = [...new Set(students.map(s => s.route).filter(Boolean))];
  const uniqueBuses = [...new Set(students.map(s => s.assignedBus).filter(Boolean))];

  // Filter and search students
  const filteredStudents = students.filter(student => {
    const matchesSearch = searchTerm === '' || 
      student.roll_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRoute = filterRoute === '' || student.route === filterRoute;
    const matchesBus = filterBus === '' || student.assignedBus === filterBus;

    return matchesSearch && matchesRoute && matchesBus;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Students</h2>
        <button
          onClick={() => openModal('addStudent')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition hover:opacity-90"
          style={{ backgroundColor: colors.color2, color: colors.color1 }}
        >
          <FaPlus /> Add Student
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search by Roll Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Student
            </label>
            <input
              type="text"
              placeholder="Search by roll no, name, or email..."
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
                setSearchTerm('');
                setFilterRoute('');
                setFilterBus('');
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredStudents.length} of {students.length} students
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Roll No</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Bus</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Route</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-12">
                  <div className="text-center">
                    <FaUserGraduate className="mx-auto text-6xl text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg mb-2">
                      {students.length === 0 ? 'No students found' : 'No students match your filters'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {students.length === 0 
                        ? 'Click "Add Student" to create your first student'
                        : 'Try adjusting your search or filter criteria'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{student.roll_no}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{student.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{student.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{student.assignedBus || 'Not Assigned'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{student.route || 'Not Assigned'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          console.log('Camera button clicked!', student);
                          alert('Camera clicked for: ' + student.name);
                          onEnrollFace(student);
                        }} 
                        className="p-2 rounded-lg text-green-500 hover:bg-green-50 transition"
                        title="Enroll Face"
                      >
                        <FaCamera size={16} />
                      </button>
                      <button 
                        onClick={() => openModal('editStudent', student)} 
                        className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition"
                        title="Edit Student"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button 
                        onClick={() => openModal('deleteStudent', student)} 
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"
                        title="Delete Student"
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
  );
};

export default StudentsView;
