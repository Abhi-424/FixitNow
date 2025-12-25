const mongoose = require('mongoose');
const Service = require('./src/models/Service');
require('dotenv').config();

const servicesData = [
  {
    name: "Plumbing",
    category: "Plumbing",
    description: "Leak repairs, pipe installation, bathroom fittings, and drain cleaning.",
    basePrice: 50,
    imageUrl: "https://www.kdinfratech.com/assets/plumb-C2HSztNl.jpg"
  },
  {
    name: "Electrical",
    category: "Electrical",
    description: "Wiring, switchboard repairs, appliance installation, and safety checks.",
    basePrice: 60,
    imageUrl: "https://www.imaginebuddy.com/files/preview/1280x853/11697609728zvcvwo9p3y2qxg20hizsdqsqag4mgtkdk1eq1yktezureixhg3fnzkrs2wzdql9eksc1wfka2huwlr0lywbhsa6kosertomrkypp.jpg"
  },
  {
    name: "Home Repairs",
    category: "Carpentry",
    description: "Furniture assembly, door/window repairs, and general carpentry work.",
    basePrice: 45,
    imageUrl: "https://images.unsplash.com/photo-1645597454479-14cb0e8bcabe?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "AC Repair",
    category: "Appliance",
    description: "Installation, servicing, gas refilling, and repair for all AC types.",
    basePrice: 80,
    imageUrl: "https://gauravacrepairservice.in/wp-content/uploads/2024/02/indian-man-setting-up-air-conditioner-RJ9VBA6-1.jpg"
  },
  {
    name: "Painting",
    category: "Painting",
    description: "Interior and exterior painting, wall textures, and waterproofing.",
    basePrice: 150,
    imageUrl: "https://aapkapainter.com/blog/wp-content/uploads/2018/11/istockphoto-1198703852-170667a.jpg"
  },
  {
    name: "Cleaning",
    category: "Cleaning",
    description: "Deep cleaning for homes, kitchens, bathrooms, and sofa/carpet cleaning.",
    basePrice: 70,
    imageUrl: "https://digishiftindia.in/wp-content/uploads/2021/02/home-deep-cleaning-services-in-delhi.jpg"
  },
  {
    name: "Pest Control",
    category: "Pest Control",
    description: "Safe and effective treatment for termites, cockroaches, rodents, and bugs.",
    basePrice: 90,
    imageUrl: "https://www.thepackersmovers.com/blog/wp-content/uploads/2022/04/Reliable-Pest-Control-Companies-in-India.jpg"
  },
  {
    name: "Gardening",
    category: "Gardening",
    description: "Lawn mowing, plant care, landscaping, and garden maintenance.",
    basePrice: 40,
    imageUrl: "https://images.pexels.com/photos/1301981/pexels-photo-1301981.jpeg"
  },
  {
    name: "Smart Home Installation",
    category: "Technology",
    description: "Installation of smart locks, cameras, lighting systems, and hubs.",
    basePrice: 100,
    imageUrl: "https://www.dish.com/content/dish/us/en/home/smart-home-services/_jcr_content/root/container/flexcontainer_copy_c/row3/column0/image.coreimg.jpeg/1742305837919/smart-thermostat-pp-installation.jpeg"
  },
  {
    name: "Pet Care",
    category: "Pets",
    description: "Dog walking, pet sitting, grooming, and basic veterinary assistance.",
    basePrice: 35,
    imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2069&auto=format&fit=crop"
  },
  {
    name: "Moving Help",
    category: "Moving",
    description: "Packing, unpacking, loading, and local moving assistance.",
    basePrice: 120,
    imageUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2070&auto=format&fit=crop"
  },
  {
    name: "Holiday Decoration",
    category: "Decorating",
    description: "Festival lighting setup, home decoration, and removal services.",
    basePrice: 85,
    imageUrl: "https://images.unsplash.com/photo-1544132890-53a479ff6849?q=80&w=2070&auto=format&fit=crop"
  },
  {
    name: "Event Support",
    category: "Event",
    description: "Stage setup, seating arrangement, and on-site event assistance.",
    basePrice: 100,
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop"
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing services to avoid duplicates and ensure updates
    await Service.deleteMany({});
    console.log('Cleared existing services');

    // Insert new services
    await Service.insertMany(servicesData);
    console.log('Added updated services with images');

    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
