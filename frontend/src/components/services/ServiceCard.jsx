import React from 'react';
import useAuthNavigate from '../../hooks/useAuthNavigate';

const ServiceCard = ({ id, title, description, image }) => {
  const authNavigate = useAuthNavigate();

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
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">{description}</p>

        <div className="mt-auto">
          <button
            onClick={() => authNavigate(`/book-service/${id}`, '/login')}
            className="w-full py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-300 flex items-center justify-center gap-2"
          >
            Book Now
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
