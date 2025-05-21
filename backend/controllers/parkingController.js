const Parking = require('../models/Parking');

// Get all parking lots with pagination
exports.getParkings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [parkings, total] = await Promise.all([
      Parking.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Parking.countDocuments()
    ]);

    res.json({
      data: parkings,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching parking lots:', error);
    res.status(500).json({
      message: 'Error fetching parking lots',
      details: error.message
    });
  }
};

// Create new parking lot
exports.createParking = async (req, res) => {
  try {
    const { code, name, availableSpaces, location, chargingFeesPerHour } = req.body;

    // Validate required fields
    if (!code || !name || availableSpaces === undefined || !location || chargingFeesPerHour === undefined) {
      return res.status(400).json({
        message: 'Missing required fields',
        details: 'All fields are required'
      });
    }

    // Validate numeric fields
    if (availableSpaces < 0 || chargingFeesPerHour < 0) {
      return res.status(400).json({
        message: 'Invalid values',
        details: 'Available spaces and charging fees must be non-negative'
      });
    }

    // Check if parking code already exists
    const existingParking = await Parking.findOne({ code });
    if (existingParking) {
      return res.status(400).json({
        message: 'Duplicate parking code',
        details: 'A parking lot with this code already exists'
      });
    }

    const parking = new Parking({
      code,
      name,
      availableSpaces,
      location,
      chargingFeesPerHour
    });

    await parking.save();

    res.status(201).json({
      message: 'Parking lot created successfully',
      data: parking
    });
  } catch (error) {
    console.error('Error creating parking lot:', error);
    res.status(500).json({
      message: 'Error creating parking lot',
      details: error.message
    });
  }
};

// Update parking lot
exports.updateParking = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate numeric fields if provided
    if (updates.availableSpaces !== undefined && updates.availableSpaces < 0) {
      return res.status(400).json({
        message: 'Invalid value',
        details: 'Available spaces must be non-negative'
      });
    }

    if (updates.chargingFeesPerHour !== undefined && updates.chargingFeesPerHour < 0) {
      return res.status(400).json({
        message: 'Invalid value',
        details: 'Charging fees must be non-negative'
      });
    }

    // Check if code is being updated and if it's unique
    if (updates.code) {
      const existingParking = await Parking.findOne({ code: updates.code, _id: { $ne: id } });
      if (existingParking) {
        return res.status(400).json({
          message: 'Duplicate parking code',
          details: 'A parking lot with this code already exists'
        });
      }
    }

    const parking = await Parking.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!parking) {
      return res.status(404).json({
        message: 'Parking lot not found',
        details: 'No parking lot exists with the provided ID'
      });
    }

    res.json({
      message: 'Parking lot updated successfully',
      data: parking
    });
  } catch (error) {
    console.error('Error updating parking lot:', error);
    res.status(500).json({
      message: 'Error updating parking lot',
      details: error.message
    });
  }
};

// Delete parking lot
exports.deleteParking = async (req, res) => {
  try {
    const { id } = req.params;

    const parking = await Parking.findByIdAndDelete(id);

    if (!parking) {
      return res.status(404).json({
        message: 'Parking lot not found',
        details: 'No parking lot exists with the provided ID'
      });
    }

    res.json({
      message: 'Parking lot deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting parking lot:', error);
    res.status(500).json({
      message: 'Error deleting parking lot',
      details: error.message
    });
  }
};

// Get parking lot by ID
exports.getParkingById = async (req, res) => {
  try {
    const { id } = req.params;

    const parking = await Parking.findById(id);

    if (!parking) {
      return res.status(404).json({
        message: 'Parking lot not found',
        details: 'No parking lot exists with the provided ID'
      });
    }

    res.json({
      data: parking
    });
  } catch (error) {
    console.error('Error fetching parking lot:', error);
    res.status(500).json({
      message: 'Error fetching parking lot',
      details: error.message
    });
  }
};

// Get parking lots by code
exports.getParkingsByCode = async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({
        message: 'Missing required parameter',
        details: 'Parking code is required'
      });
    }

    const parkings = await Parking.find({ code: code.toUpperCase() });

    res.json({
      data: parkings,
      pagination: {
        total: parkings.length,
        page: 1,
        pages: 1
      }
    });
  } catch (error) {
    console.error('Error fetching parking lots by code:', error);
    res.status(500).json({
      message: 'Error fetching parking lots',
      details: error.message
    });
  }
};