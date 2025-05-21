const CarEntry = require('../models/CarEntry');
const Parking = require('../models/Parking');
const mongoose = require('mongoose');

exports.createEntry = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { plateNumber, parking, recordedBy } = req.body;

    // Validate input
    if (!plateNumber || !parking || !recordedBy) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          plateNumber: !plateNumber ? 'Plate number is required' : null,
          parking: !parking ? 'Parking lot is required' : null,
          recordedBy: !recordedBy ? 'User who recorded the entry is required' : null
        }
      });
    }

    // Find parking lot with session
    const parkingLot = await Parking.findById(parking).session(session);
    if (!parkingLot) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        error: 'Invalid parking lot',
        details: 'Parking lot not found'
      });
    }

    // Check available spaces with session
    if (parkingLot.availableSpaces <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        error: 'No available spaces',
        details: 'Parking lot is full'
      });
    }

    // Check if car is already parked with session
    const existingEntry = await CarEntry.findOne({
      plateNumber,
      status: 'active'
    }).session(session);

    if (existingEntry) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: 'Car already parked',
        details: `Car with plate number ${plateNumber} is already parked`
      });
    }

    // Create entry with session
    const entry = new CarEntry({
      plateNumber,
      parking,
      recordedBy,
      status: 'active',
      entryTime: new Date()
    });

    await entry.save({ session });

    // Update parking spaces with session
    parkingLot.availableSpaces -= 1;
    await parkingLot.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Get updated parking lot info
    const updatedParkingLot = await Parking.findById(parking);

    res.status(201).json({ 
      ticket: entry.ticketNumber,
      entry: {
        id: entry._id,
        plateNumber: entry.plateNumber,
        parking: {
          code: updatedParkingLot.code,
          name: updatedParkingLot.name,
          availableSpaces: updatedParkingLot.availableSpaces
        },
        entryTime: entry.entryTime,
        status: entry.status
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Car entry error:', error);
    res.status(500).json({ 
      error: 'Failed to create car entry',
      details: error.message
    });
  }
};

exports.updateExit = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: 'Invalid entry ID format',
        details: 'Entry ID must be a valid MongoDB ObjectId'
      });
    }

    // Find entry and populate parking details with session
    const entry = await CarEntry.findById(id).populate('parking').session(session);
    if (!entry) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        error: 'Entry not found',
        details: 'No car entry found with the provided ID'
      });
    }

    // Check if car has already exited
    if (entry.status === 'completed') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: 'Car already exited',
        details: `Car with plate number ${entry.plateNumber} has already exited`
      });
    }

    // Get parking lot from populated entry
    const parkingLot = entry.parking;
    if (!parkingLot) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: 'Parking lot not found',
        details: 'Associated parking lot no longer exists'
      });
    }

    // Calculate bill
    const exitTime = new Date();
    const durationMs = exitTime - entry.entryTime;
    const hours = Math.ceil(durationMs / (1000 * 60 * 60)); // Round up to nearest hour
    const chargedAmount = hours * parkingLot.chargingFeesPerHour;

    // Update entry with session
    entry.exitTime = exitTime;
    entry.status = 'completed';
    entry.fee = chargedAmount;
    await entry.save({ session });

    // Update parking spaces with session
    parkingLot.availableSpaces += 1;
    await parkingLot.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.json({ 
      bill: { 
        hours: parseFloat(hours.toFixed(2)),
        rate: parkingLot.chargingFeesPerHour,
        chargedAmount,
        currency: 'RWF'
      },
      exit: {
        id: entry._id,
        plateNumber: entry.plateNumber,
        entryTime: entry.entryTime,
        exitTime: entry.exitTime,
        status: entry.status,
        parking: {
          code: parkingLot.code,
          name: parkingLot.name,
          availableSpaces: parkingLot.availableSpaces
        }
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Car exit error:', error);
    res.status(500).json({ 
      error: 'Failed to record car exit',
      details: error.message
    });
  }
};

exports.getEntryById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid entry ID format',
        details: 'Entry ID must be a valid MongoDB ObjectId'
      });
    }

    const entry = await CarEntry.findById(id)
      .populate('parking', 'code name availableSpaces')
      .populate('recordedBy', 'name email');

    if (!entry) {
      return res.status(404).json({
        error: 'Entry not found',
        details: 'No car entry found with the provided ID'
      });
    }

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    console.error('Get entry by ID error:', error);
    res.status(500).json({
      error: 'Failed to get car entry',
      details: error.message
    });
  }
};

exports.getEntries = async (req, res) => {
  try {
    const { status, startDate, endDate, plateNumber } = req.query;
    const query = {};

    // Add filters if provided
    if (status) {
      query.status = status;
    }
    if (plateNumber) {
      query.plateNumber = { $regex: plateNumber, $options: 'i' };
    }
    if (startDate || endDate) {
      query.entryTime = {};
      if (startDate) {
        query.entryTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.entryTime.$lte = new Date(endDate);
      }
    }

    const entries = await CarEntry.find(query)
      .populate('parking', 'code name availableSpaces')
      .populate('recordedBy', 'name email')
      .sort({ entryTime: -1 });

    res.json({
      success: true,
      data: entries
    });
  } catch (error) {
    console.error('Get entries error:', error);
    res.status(500).json({
      error: 'Failed to get car entries',
      details: error.message
    });
  }
};