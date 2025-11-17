import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { FaCamera, FaCheckCircle, FaTimesCircle, FaUserCircle } from 'react-icons/fa';
import api from '../api';

const FaceEnrollment = ({ student, onSuccess, onClose }) => {
  const [images, setImages] = useState({
    front: null,
    left: null,
    right: null
  });
  
  const [previews, setPreviews] = useState({
    front: null,
    left: null,
    right: null
  });
  
  const [capturedViews, setCapturedViews] = useState({
    front: false,
    left: false,
    right: false
  });
  
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const fileInputRefs = {
    front: useRef(null),
    left: useRef(null),
    right: useRef(null)
  };
  
  const handleImageSelect = (view, event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }
    
    setImages(prev => ({ ...prev, [view]: file }));
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews(prev => ({ ...prev, [view]: reader.result }));
      setCapturedViews(prev => ({ ...prev, [view]: true }));
    };
    reader.readAsDataURL(file);
    
    setError('');
  };
  
  const handleEnroll = async () => {
    // Validate all images captured
    if (!images.front || !images.left || !images.right) {
      setError('Please capture all three face views (front, left, right)');
      return;
    }
    
    setUploading(true);
    setError('');
    setSuccess('');
    
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('roll_no', student.roll_no);
      formData.append('front_image', images.front);
      formData.append('left_image', images.left);
      formData.append('right_image', images.right);
      
      // Send to backend
      const response = await api.post('/api/face/enroll', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess(`✓ Face enrollment successful! ${response.data.encoded_views.length} views encoded.`);
      
      // Call success callback after 2 seconds
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
      
    } catch (err) {
      console.error('Enrollment error:', err);
      setError(err.response?.data?.detail || 'Failed to enroll face. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  const handleRemove = (view) => {
    setImages(prev => ({ ...prev, [view]: null }));
    setPreviews(prev => ({ ...prev, [view]: null }));
    setCapturedViews(prev => ({ ...prev, [view]: false }));
    if (fileInputRefs[view].current) {
      fileInputRefs[view].current.value = '';
    }
  };
  
  const ImageCaptureCard = ({ view, title, instruction }) => (
    <div className="bg-white rounded-lg shadow-md p-4 border-2 border-gray-200">
      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
        {capturedViews[view] ? (
          <FaCheckCircle className="text-green-500" />
        ) : (
          <FaCamera className="text-gray-400" />
        )}
        {title}
      </h3>
      
      <p className="text-sm text-gray-600 mb-3">{instruction}</p>
      
      {previews[view] ? (
        <div className="relative">
          <img 
            src={previews[view]} 
            alt={`${view} view`}
            className="w-full h-48 object-cover rounded-lg border-2 border-green-500"
          />
          <button
            onClick={() => handleRemove(view)}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
          >
            <FaTimesCircle />
          </button>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRefs[view].current?.click()}
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#FFC812] hover:bg-gray-50 transition"
        >
          <FaUserCircle className="text-6xl text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">Click to select image</p>
          <p className="text-xs text-gray-400 mt-1">or drag and drop</p>
        </div>
      )}
      
      <input
        ref={fileInputRefs[view]}
        type="file"
        accept="image/*"
        onChange={(e) => handleImageSelect(view, e)}
        className="hidden"
      />
    </div>
  );
  
  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FFC812] to-yellow-500 p-6 text-black rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Face Enrollment</h2>
              <p className="text-sm mt-1">
                Student: {student.name} ({student.roll_no})
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-black hover:text-gray-800 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="p-6 bg-blue-50 border-l-4 border-blue-500">
          <h3 className="font-semibold text-blue-900 mb-2">📸 Photo Guidelines</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Ensure good lighting on the face</li>
            <li>• Face should be clearly visible and in focus</li>
            <li>• Remove glasses if possible (optional)</li>
            <li>• Maintain neutral expression</li>
            <li>• Background should be plain</li>
            <li>• Distance: 1-2 meters from camera</li>
          </ul>
        </div>
        
        {/* Image Capture Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <ImageCaptureCard
              view="front"
              title="Front View"
              instruction="Face directly towards camera, looking straight ahead"
            />
            <ImageCaptureCard
              view="left"
              title="Left View"
              instruction="Turn head slightly to the left (30-45 degrees)"
            />
            <ImageCaptureCard
              view="right"
              title="Right View"
              instruction="Turn head slightly to the right (30-45 degrees)"
            />
          </div>
          
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p className="flex items-center gap-2">
                <FaTimesCircle />
                {error}
              </p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
              <p className="flex items-center gap-2">
                <FaCheckCircle />
                {success}
              </p>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              onClick={handleEnroll}
              disabled={!capturedViews.front || !capturedViews.left || !capturedViews.right || uploading}
              className={`px-6 py-3 rounded-lg transition flex items-center gap-2 ${
                capturedViews.front && capturedViews.left && capturedViews.right && !uploading
                  ? 'bg-[#FFC812] text-black hover:bg-yellow-500'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                  Processing...
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  Enroll Student Face
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default FaceEnrollment;
