import React from 'react';

const LoadingSpinner = ({ size = 'md', message = '' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  };

  const borderWidth = {
    sm: 2,
    md: 3,
    lg: 4
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative" style={{ width: size === 'sm' ? '32px' : size === 'md' ? '64px' : '96px', height: size === 'sm' ? '32px' : size === 'md' ? '64px' : '96px' }}>
        <div className="absolute top-0 left-0 w-full h-full border-gray-200 rounded-full" style={{ borderWidth: borderWidth[size] }}></div>
        <div className="absolute top-0 left-0 w-full h-full border-t-yellow-500 rounded-full animate-spin" style={{ borderWidth: borderWidth[size] }}></div>
      </div>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
