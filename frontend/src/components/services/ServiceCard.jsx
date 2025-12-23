import React from 'react';

const ServiceCard = ({ title, description, image }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-blue-50 hover:shadow-2xl transition-all duration-300 group flex flex-col h-full overflow-hidden">
      {/* Image Container */}
      <div className="relative w-full h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      
      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-blue-900 mb-3">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default ServiceCard;
