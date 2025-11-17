import React from 'react';

const StatsCard = ({ title, value, icon: Icon, bgColor, iconColor }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow" style={{ borderLeftColor: bgColor }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <h3 className="text-3xl font-bold mt-2" style={{ color: bgColor }}>{value}</h3>
        </div>
        <div className="p-4 rounded-full" style={{ backgroundColor: `${bgColor}20` }}>
          <Icon className="text-4xl" style={{ color: iconColor || bgColor }} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
