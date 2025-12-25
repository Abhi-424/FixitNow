import React, { useState, useEffect } from 'react';
import ServiceCard from './ServiceCard';
import api from '../../services/api';
import Loader from '../common/Loader';

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/services');
        setServices(response.data);
      } catch (err) {
        console.error("Error fetching services:", err);
        setError("Failed to load services.");
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) return <div className="py-20"><Loader fullScreen={false} /></div>;

  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {services.map((service) => (
            <ServiceCard
              key={service._id}
              id={service._id} // Pass ID for booking
              title={service.name}
              description={service.description}
              image={service.imageUrl || "https://dummyimage.com/600x400/e0e0e0/000000&text=Service"}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceList;
