import React from 'react';
import ServiceCard from './ServiceCard';

const ServiceList = () => {
  const services = [
    {
      id: 1,
      title: "Plumbing",
      desc: "Leak repairs, pipe installation, and bathroom fittings.",
      image: "https://www.kdinfratech.com/assets/plumb-C2HSztNl.jpg",
    },
    {
      id: 2,
      title: "Electrical",
      desc: "Wiring, switchboard repairs, and appliance installation.",
      image: "https://www.imaginebuddy.com/files/preview/1280x853/11697609728zvcvwo9p3y2qxg20hizsdqsqag4mgtkdk1eq1yktezureixhg3fnzkrs2wzdql9eksc1wfka2huwlr0lywbhsa6kosertomrkypp.jpg",
    },
    {
      id: 3,
      title: "Home Repairs",
      desc: "Furniture assembly, carpentry, and general maintenance.",
      image: "https://images.unsplash.com/photo-1645597454479-14cb0e8bcabe?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: 4,
      title: "AC Repair",
      desc: "Installation, servicing, and gas refilling for all AC types.",
      image: "https://gauravacrepairservice.in/wp-content/uploads/2024/02/indian-man-setting-up-air-conditioner-RJ9VBA6-1.jpg",
    },
    {
      id: 5,
       title: "Painting",
       desc: "Interior and exterior painting services for homes and offices.",
      image: "https://aapkapainter.com/blog/wp-content/uploads/2018/11/istockphoto-1198703852-170667a.jpg",
    },
    {
      id: 6,
       title: "Cleaning",
       desc: "Deep cleaning for homes, kitchens, washrooms, and sofas.",
      image: "https://digishiftindia.in/wp-content/uploads/2021/02/home-deep-cleaning-services-in-delhi.jpg",
    }
  ];

  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              description={service.desc}
              image={service.image}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceList;
