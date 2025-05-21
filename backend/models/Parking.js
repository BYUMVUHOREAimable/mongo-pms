const mongoose = require('mongoose');

const parkingSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Parking code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    minlength: [3, 'Parking code must be at least 3 characters long'],
    maxlength: [10, 'Parking code cannot exceed 10 characters']
  },
  name: {
    type: String,
    required: [true, 'Parking name is required'],
    trim: true,
    minlength: [3, 'Parking name must be at least 3 characters long'],
    maxlength: [100, 'Parking name cannot exceed 100 characters']
  },
  availableSpaces: {
    type: Number,
    required: [true, 'Number of available spaces is required'],
    min: [0, 'Available spaces cannot be negative'],
    validate: {
      validator: function(v) {
        return Number.isInteger(v);
      },
      message: 'Available spaces must be an integer'
    }
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    minlength: [3, 'Location must be at least 3 characters long'],
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  chargingFeesPerHour: {
    type: Number,
    required: [true, 'Charging fees per hour is required'],
    min: [0, 'Charging fees cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes
parkingSchema.index({ code: 1 }, { unique: true });
parkingSchema.index({ location: 'text', name: 'text' });

// Pre-save middleware to update the updatedAt timestamp
parkingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to check if parking is full
parkingSchema.methods.isFull = function() {
  return this.availableSpaces <= 0;
};

// Method to check if parking has available spaces
parkingSchema.methods.hasAvailableSpaces = function() {
  return this.availableSpaces > 0;
};

// Static method to find available parking lots
parkingSchema.statics.findAvailable = function() {
  return this.find({ availableSpaces: { $gt: 0 } });
};

module.exports = mongoose.model('Parking', parkingSchema);