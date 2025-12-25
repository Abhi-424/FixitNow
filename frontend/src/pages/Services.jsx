import React from 'react';
import { useNavigate } from "react-router-dom";
import ServiceList from "../components/services/ServiceList";
import useAuthNavigate from "../hooks/useAuthNavigate";

const Services = () => {
  const navigate = useNavigate();
  const authNavigate = useAuthNavigate();

  return (
    <div className="font-sans text-gray-800 bg-white pt-20">
      {/* Hero Section */}
      <section className="bg-blue-50 py-20 text-center">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">Our Services</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our wide range of professional home services designed to make your life easier.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <ServiceList />

      {/* CTA Section */}
      <section className="py-20 text-center bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">Ready To Fix Your Home?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Register now and submit your complaint. We'll get back to you within 24 hours.
          </p>
          <button
            onClick={() => authNavigate('/dashboard/user', '/register')}
            className="px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-lg text-lg transition transform hover:scale-105"
          >
            Book a Service
          </button>
        </div>
      </section>
    </div>
  );
};

export default Services;
