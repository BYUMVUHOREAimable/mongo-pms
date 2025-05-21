const mongoose = require('mongoose');

const carEntrySchema = new mongoose.Schema({
  plateNumber: {
    type: String,
    required: [true, 'Plate number is required'],
    trim: true,
    uppercase: true,
    minlength: [3, 'Plate number must be at least 3 characters long'],
    maxlength: [10, 'Plate number cannot exceed 10 characters'],
    match: [/^[A-Z0-9]+$/, 'Plate number must contain only uppercase letters and numbers']
  },
  parking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parking',
    required: [true, 'Parking lot is required']
  },
  entryTime: {
    type: Date,
    required: [true, 'Entry time is required'],
    default: Date.now
  },
  exitTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'completed'],
      message: 'Status must be either active or completed'
    },
    default: 'active'
  },
  fee: {
    type: Number,
    min: [0, 'Fee cannot be negative'],
    default: 0
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User who recorded the entry is required']
  }
}, {
  timestamps: true
});

// Create indexes
carEntrySchema.index({ plateNumber: 1, status: 1 });
carEntrySchema.index({ entryTime: 1 });
carEntrySchema.index({ exitTime: 1 });
carEntrySchema.index({ parking: 1, status: 1 });

// Virtual for ticket number
carEntrySchema.virtual('ticketNumber').get(function() {
  return `TKT-${this._id.toString().slice(-6).toUpperCase()}`;
});

// Method to calculate parking duration in hours
carEntrySchema.methods.getDuration = function() {
  if (!this.exitTime) return null;
  const durationMs = this.exitTime - this.entryTime;
  return Math.ceil(durationMs / (1000 * 60 * 60)); // Convert to hours and round up
};

// Method to calculate fee
carEntrySchema.methods.calculateFee = async function() {
  if (!this.exitTime) return 0;
  
  const duration = this.getDuration();
  if (!duration) return 0;

  const parking = await mongoose.model('Parking').findById(this.parking);
  if (!parking) return 0;

  return duration * parking.chargingFeesPerHour;
};

// Pre-save middleware to validate entry/exit times
carEntrySchema.pre('save', function(next) {
  if (this.exitTime && this.exitTime < this.entryTime) {
    next(new Error('Exit time cannot be earlier than entry time'));
  }
  next();
});

// Static method to find active entries
carEntrySchema.statics.findActive = function() {
  return this.find({ status: 'active' }).populate('parking');
};

// Static method to find entries by date range
carEntrySchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    entryTime: { $gte: startDate },
    $or: [
      { exitTime: { $lte: endDate } },
      { exitTime: null }
    ]
  }).populate('parking');
};

// Static method to find entries by plate number
carEntrySchema.statics.findByPlateNumber = function(plateNumber) {
  return this.find({
    plateNumber: plateNumber.toUpperCase()
  }).populate('parking');
};

module.exports = mongoose.model('CarEntry', carEntrySchema);