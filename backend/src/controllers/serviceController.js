const Service = require('../models/Service');

// Get all active services
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ name: 1 });
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Failed to fetch services' });
  }
};

// Create a new service (admin only)
const createService = async (req, res) => {
  try {
    const { name, description, category, basePrice, imageUrl } = req.body;

    const service = new Service({
      name,
      description,
      category,
      basePrice,
      imageUrl
    });

    await service.save();
    res.status(201).json(service);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Failed to create service' });
  }
};

// Get single service by ID
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (service) {
      res.json(service);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ message: 'Failed to fetch service' });
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  createService
};
