const Service = require('../models/Service');

// Get all active services (public)
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ name: 1 });
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Failed to fetch services' });
  }
};

// Get all services including inactive (admin only)
const getAllServicesAdmin = async (req, res) => {
  try {
    const services = await Service.find({}).sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    console.error('Error fetching admin services:', error);
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

// Update service (admin only)
const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category, basePrice, imageUrl, isActive } = req.body;
        
        const service = await Service.findById(id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        
        service.name = name || service.name;
        service.description = description || service.description;
        service.category = category || service.category;
        service.basePrice = basePrice || service.basePrice;
        service.imageUrl = imageUrl || service.imageUrl;
        // Explicit check for boolean
        if (typeof isActive !== 'undefined') {
            service.isActive = isActive;
        }
        
        await service.save();
        res.json(service);
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ message: 'Failed to update service' });
    }
};

// Delete service (Soft delete usually, but here hard delete for now or toggle active)
const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        // Logical delete is safer
        const service = await Service.findById(id);
         if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        
        // Actually we will just toggle isActive to false instead of deleting to preserve Booking history
        service.isActive = false; 
        await service.save();
        
        res.json({ message: 'Service deactivated successfully' });
    } catch (error) {
         console.error('Error deleting service:', error);
        res.status(500).json({ message: 'Failed to delete service' });
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
  getAllServicesAdmin,
  getServiceById,
  createService,
  updateService,
  deleteService
};
