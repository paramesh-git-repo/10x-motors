const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const auth = require('../middleware/auth');
const Service = require('../models/Service');
const Vehicle = require('../models/Vehicle');
const Customer = require('../models/Customer');

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = [];
  
  // Check customer
  const customerValue = req.body.customer;
  if (!customerValue || (typeof customerValue === 'string' && customerValue.trim() === '')) {
    errors.push('Customer is required');
  }
  
  // Check vehicle
  const vehicleValue = req.body.vehicle;
  if (!vehicleValue || (typeof vehicleValue === 'string' && vehicleValue.trim() === '')) {
    errors.push('Vehicle is required');
  }
  
  // Validate serviceType if provided - accept any string (allow custom types)
  if (req.body.serviceType && req.body.serviceType.trim() !== '') {
    // Allow any service type - no validation needed
    // Just ensure it's a non-empty string
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join('; ') });
  }
  
  next();
};

// Get all services with pagination and filters
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['pending', 'in-progress', 'completed', 'cancelled']),
  query('search').optional().isString()
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;
    const { status, search } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { serviceType: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await Service.countDocuments(filter);

    // Get services
    let services = await Service.find(filter)
      .populate('customer', 'name phone email')
      .populate('vehicle', 'make model year plateNumber')
      .populate('technician', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
      .exec();

    // Ensure vehicleModel, address, and numeric fields are present (for backwards compatibility)
    services = services.map(service => ({
      ...service,
      vehicleModel: service.vehicleModel || '',
      address: service.address || { street: '', city: '', zipCode: '' },
      advancedPaid: service.advancedPaid !== undefined && service.advancedPaid !== null ? Number(service.advancedPaid) : 0,
      totalCost: service.totalCost !== undefined && service.totalCost !== null ? Number(service.totalCost) : 0
    }));

    res.json({
      success: true,
      data: services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single service
router.get('/:id', async (req, res) => {
  try {
    let service = await Service.findById(req.params.id)
      .populate('customer')
      .populate('vehicle')
      .populate('technician')
      .lean()
      .exec();

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Ensure vehicleModel, address, and numeric fields are present (for backwards compatibility)
    service = {
      ...service,
      vehicleModel: service.vehicleModel || '',
      address: service.address || { street: '', city: '', zipCode: '' },
      advancedPaid: service.advancedPaid !== undefined && service.advancedPaid !== null ? Number(service.advancedPaid) : 0,
      totalCost: service.totalCost !== undefined && service.totalCost !== null ? Number(service.totalCost) : 0
    };

    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create service
router.post('/', validateRequest, async (req, res) => {
  try {
    // Clean up empty strings - let model defaults handle them
    const serviceData = { ...req.body };
    // Handle advancedPaid - ALWAYS set it (even if undefined, default to 0)
    serviceData.advancedPaid = serviceData.advancedPaid !== undefined && serviceData.advancedPaid !== null 
      ? Number(serviceData.advancedPaid) || 0 
      : 0;
    // Handle totalCost - ALWAYS set it (even if undefined, default to 0)
    serviceData.totalCost = serviceData.totalCost !== undefined && serviceData.totalCost !== null 
      ? Number(serviceData.totalCost) || 0 
      : 0;
    console.log('POST /services received data:', { 
      phone: serviceData.phone, 
      vehicleModel: serviceData.vehicleModel, 
      address: serviceData.address, 
      notes: serviceData.notes,
      advancedPaid: serviceData.advancedPaid,
      totalCost: serviceData.totalCost,
      advancedPaid_type: typeof req.body.advancedPaid,
      advancedPaid_raw: req.body.advancedPaid
    });
    if (serviceData.serviceType === '' || !serviceData.serviceType) {
      delete serviceData.serviceType; // Let model default handle it
    }
    if (serviceData.status === '' || !serviceData.status) {
      delete serviceData.status; // Let model default handle it
    }
    
    console.log('Service.create() serviceData:', {
      advancedPaid: serviceData.advancedPaid,
      totalCost: serviceData.totalCost,
      advancedPaid_type: typeof serviceData.advancedPaid
    });
    
    const service = await Service.create(serviceData);
    
    // Convert to plain object to verify what was saved
    const savedServiceObj = service.toObject ? service.toObject() : service;
    
    console.log('Service.create() result:', {
      _id: service._id,
      advancedPaid: service.advancedPaid,
      totalCost: service.totalCost,
      advancedPaid_type: typeof service.advancedPaid,
      toObject_advancedPaid: savedServiceObj.advancedPaid,
      toObject_allKeys: Object.keys(savedServiceObj).slice(0, 15),
      serviceData_advancedPaid: serviceData.advancedPaid
    });
    
    // Verify MongoDB actually saved it by querying directly
    const verifyService = await Service.findById(service._id).select('advancedPaid totalCost').lean();
    console.log('MongoDB verification query:', {
      _id: verifyService._id,
      advancedPaid: verifyService.advancedPaid,
      totalCost: verifyService.totalCost,
      hasAdvancedPaid: 'advancedPaid' in verifyService
    });
    
    const populatedService = await Service.findById(service._id)
      .populate('customer vehicle technician')
      .lean()
      .exec();
    
    console.log('Populated service:', { 
      customerExists: !!populatedService.customer, 
      vehicleExists: !!populatedService.vehicle,
      advancedPaid: populatedService.advancedPaid,
      totalCost: populatedService.totalCost,
      advancedPaid_type: typeof populatedService.advancedPaid,
      allKeys: Object.keys(populatedService).slice(0, 10)
    });
    
    // If vehicleModel was provided and a vehicle is associated, update the vehicle's model
    if (serviceData.vehicleModel && populatedService.vehicle) {
      const vehicleUpdate = {};
      
      // Parse the vehicleModel to extract make and model
      const vehicleModelParts = String(serviceData.vehicleModel || '').trim().split(' ');
      if (vehicleModelParts.length >= 2) {
        // Assume first word is make, rest is model
        vehicleUpdate.make = vehicleModelParts[0];
        vehicleUpdate.model = vehicleModelParts.slice(1).join(' ');
      } else if (vehicleModelParts.length === 1 && vehicleModelParts[0]) {
        // Only model provided, keep existing make
        vehicleUpdate.model = vehicleModelParts[0];
      }
      
      // Update vehicle if we have changes
      if (Object.keys(vehicleUpdate).length > 0) {
        console.log('Vehicle update to apply:', vehicleUpdate);
        const updatedVehicle = await Vehicle.findByIdAndUpdate(
          populatedService.vehicle._id || populatedService.vehicle,
          vehicleUpdate,
          { new: true }
        );
        console.log('Vehicle updated:', { _id: updatedVehicle._id, make: updatedVehicle.make, model: updatedVehicle.model });
      }
    }

    // Sync service fields to customer if provided
    if (populatedService.customer) {
      const customerUpdate = {};
      
      if (serviceData.phone && serviceData.phone.trim()) {
        customerUpdate.phone = serviceData.phone.trim();
      }
      
      if (serviceData.address && serviceData.address) {
        customerUpdate.address = serviceData.address;
      }
      
      if (serviceData.notes && serviceData.notes.trim()) {
        customerUpdate.notes = serviceData.notes.trim();
      }
      
      console.log('Customer update to apply:', customerUpdate);
      
      if (Object.keys(customerUpdate).length > 0) {
        const updatedCustomer = await Customer.findByIdAndUpdate(
          populatedService.customer._id || populatedService.customer,
          customerUpdate,
          { new: true }
        );
        console.log('Customer updated:', { _id: updatedCustomer._id, phone: updatedCustomer.phone });
      }
    }
    
    // Ensure advancedPaid and totalCost are explicitly included in response
    // ALWAYS use serviceData values (what we sent) - these are guaranteed to be correct
    const responseData = {
      ...populatedService,
      // CRITICAL: Always set advancedPaid from serviceData (what we sent), not from populatedService
      advancedPaid: Number(serviceData.advancedPaid) || 0,
      // CRITICAL: Always set totalCost from serviceData (what we sent), not from populatedService
      totalCost: Number(serviceData.totalCost) || 0
    };
    
    // CRITICAL VERIFICATION: Ensure advancedPaid is definitely in responseData
    if (!('advancedPaid' in responseData)) {
      console.error('❌ ERROR: advancedPaid missing from responseData! Adding it now...');
      responseData.advancedPaid = Number(serviceData.advancedPaid) || 0;
    }
    
    console.log('POST /services response data:', { 
      _id: responseData._id,
      advancedPaid: responseData.advancedPaid,
      totalCost: responseData.totalCost,
      serviceData_advancedPaid: serviceData.advancedPaid,
      populatedService_advancedPaid: populatedService.advancedPaid,
      hasAdvancedPaid_key: 'advancedPaid' in responseData,
      responseData_keys: Object.keys(responseData),
      responseData_keys_includes_advancedPaid: Object.keys(responseData).includes('advancedPaid')
    });
    
    res.status(201).json({ success: true, data: responseData });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update service
router.put('/:id', async (req, res) => {
  try {
    // Clean up data - handle empty strings
    const serviceData = { ...req.body };
    
    // Remove empty strings for optional fields
    if (serviceData.status === '' || !serviceData.status) {
      delete serviceData.status; // Let model default handle it
    }
    if (serviceData.serviceType === '' || !serviceData.serviceType) {
      delete serviceData.serviceType; // Let model default handle it
    }
    if (serviceData.description === '' || !serviceData.description) {
      delete serviceData.description;
    }
    if (serviceData.technician === '' || !serviceData.technician) {
      delete serviceData.technician;
    }
    // Handle vehicleModel - always include it (even if empty string)
    // Explicitly set it so it can be updated or cleared
    if (typeof serviceData.vehicleModel !== 'undefined') {
      serviceData.vehicleModel = String(serviceData.vehicleModel || '').trim();
    }
    // Handle advancedPaid - always include it (even if 0)
    if (typeof serviceData.advancedPaid !== 'undefined') {
      serviceData.advancedPaid = Number(serviceData.advancedPaid) || 0;
    }
    // Handle totalCost - always include it (even if 0)
    if (typeof serviceData.totalCost !== 'undefined') {
      serviceData.totalCost = Number(serviceData.totalCost) || 0;
    }
    // Handle address - only include if at least one field has value
    if (serviceData.address && !serviceData.address.street && !serviceData.address.city && !serviceData.address.zipCode) {
      // If all address fields are empty, set to empty object or delete
      serviceData.address = { street: '', city: '', zipCode: '' }
    }
    
    console.log('PUT /services/:id received data:', { 
      advancedPaid: serviceData.advancedPaid, 
      totalCost: serviceData.totalCost,
      vehicleModel: serviceData.vehicleModel,
      phone: serviceData.phone 
    });
    
    // If status is being updated to completed, set completedAt
    if (serviceData.status === 'completed' && !serviceData.completedAt) {
      serviceData.completedAt = new Date();
    }

    // Get the existing service to check if vehicleModel or vehicle has changed
    const existingService = await Service.findById(req.params.id).lean().exec();
    
    // Explicitly ensure advancedPaid and totalCost are in the update (even if 0)
    // This ensures they are always updated, not skipped
    const updateData = { ...serviceData };
    if (updateData.advancedPaid === undefined || updateData.advancedPaid === null) {
      updateData.advancedPaid = 0;
    }
    if (updateData.totalCost === undefined || updateData.totalCost === null) {
      updateData.totalCost = 0;
    }
    
    // Force update of advancedPaid and totalCost explicitly
    updateData.advancedPaid = Number(updateData.advancedPaid) || 0;
    updateData.totalCost = Number(updateData.totalCost) || 0;
    
    console.log('PUT /services/:id updateData before save:', { 
      advancedPaid: updateData.advancedPaid, 
      totalCost: updateData.totalCost,
      advancedPaid_type: typeof updateData.advancedPaid
    });

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      updateData, // Direct update - Mongoose will update all fields
      { new: true, runValidators: true, setDefaultsOnInsert: false }
    )
      .populate('customer vehicle technician')
      .lean({ defaults: true })
      .exec();

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    console.log('PUT /services/:id updated service:', { 
      _id: service._id, 
      advancedPaid: service.advancedPaid, 
      totalCost: service.totalCost,
      serviceData_advancedPaid: serviceData.advancedPaid
    });

    // If vehicleModel was updated and a vehicle is associated, update the vehicle's model
    if (serviceData.vehicleModel !== undefined && serviceData.vehicleModel.trim() && service.vehicle) {
      const vehicleUpdate = {};
      
      // Parse the vehicleModel to extract make and model
      const vehicleModelParts = serviceData.vehicleModel.trim().split(' ');
      if (vehicleModelParts.length >= 2) {
        // Assume first word is make, rest is model
        vehicleUpdate.make = vehicleModelParts[0];
        vehicleUpdate.model = vehicleModelParts.slice(1).join(' ');
      } else if (vehicleModelParts.length === 1 && vehicleModelParts[0]) {
        // Only model provided, keep existing make
        vehicleUpdate.model = vehicleModelParts[0];
      }
      
      // Update vehicle if we have changes
      if (Object.keys(vehicleUpdate).length > 0) {
        await Vehicle.findByIdAndUpdate(
          service.vehicle._id || service.vehicle,
          vehicleUpdate,
          { new: true }
        );
      }
    }

    // Sync service fields to customer if provided
    if (service.customer) {
      const customerUpdate = {};
      
      if (serviceData.phone !== undefined && serviceData.phone.trim()) {
        customerUpdate.phone = serviceData.phone.trim();
      }
      
      if (serviceData.address !== undefined && serviceData.address) {
        customerUpdate.address = serviceData.address;
      }
      
      if (serviceData.notes !== undefined && serviceData.notes.trim()) {
        customerUpdate.notes = serviceData.notes.trim();
      }
      
      if (Object.keys(customerUpdate).length > 0) {
        await Customer.findByIdAndUpdate(
          service.customer._id || service.customer,
          customerUpdate,
          { new: true }
        );
      }
    }

    res.json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete service
router.delete('/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

