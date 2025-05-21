const CarEntry = require('../models/CarEntry');
const Parking = require('../models/Parking');

// Get outgoing cars report with pagination
exports.getOutgoingCars = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({
        message: 'Missing required parameters',
        details: 'Start date and end date are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        message: 'Invalid date format',
        details: 'Dates must be in ISO format'
      });
    }

    if (start > end) {
      return res.status(400).json({
        message: 'Invalid date range',
        details: 'Start date must be before end date'
      });
    }

    // Build query
    const query = {
      exitTime: { $gte: start, $lte: end },
      status: 'completed'
    };

    // Get paginated results and total count
    const [entries, total] = await Promise.all([
      CarEntry.find(query)
        .populate('parking', 'code name location')
        .sort({ exitTime: -1 })
        .skip(skip)
        .limit(limit),
      CarEntry.countDocuments(query)
    ]);

    // Calculate total amount
    const totalAmount = await CarEntry.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$fee' } } }
    ]);

    res.json({
      data: entries,
      totalAmount: totalAmount[0]?.total || 0,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error generating outgoing cars report:', error);
    res.status(500).json({
      message: 'Error generating report',
      details: error.message
    });
  }
};

// Get entered cars report with pagination and statistics
exports.getEnteredCars = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({
        message: 'Missing required parameters',
        details: 'Start date and end date are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        message: 'Invalid date format',
        details: 'Dates must be in ISO format'
      });
    }

    if (start > end) {
      return res.status(400).json({
        message: 'Invalid date range',
        details: 'Start date must be before end date'
      });
    }

    // Build query
    const query = {
      entryTime: { $gte: start, $lte: end }
    };

    // Get paginated results and total count
    const [entries, total] = await Promise.all([
      CarEntry.find(query)
        .populate('parking', 'code name location')
        .sort({ entryTime: -1 })
        .skip(skip)
        .limit(limit),
      CarEntry.countDocuments(query)
    ]);

    // Calculate statistics
    const [currentlyParked, totalRevenue, avgDuration] = await Promise.all([
      // Currently parked cars
      CarEntry.countDocuments({ status: 'active' }),
      
      // Total revenue for the period
      CarEntry.aggregate([
        { $match: { ...query, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$fee' } } }
      ]),
      
      // Average parking duration
      CarEntry.aggregate([
        { $match: { ...query, status: 'completed' } },
        {
          $group: {
            _id: null,
            avgDuration: {
              $avg: {
                $divide: [
                  { $subtract: ['$exitTime', '$entryTime'] },
                  1000 * 60 * 60 // Convert to hours
                ]
              }
            }
          }
        }
      ])
    ]);

    // Calculate revenue per hour
    const totalHours = (end - start) / (1000 * 60 * 60);
    const revenuePerHour = totalRevenue[0]?.total / totalHours || 0;

    res.json({
      data: entries,
      statistics: {
        totalEntries: total,
        currentlyParked,
        totalRevenue: totalRevenue[0]?.total || 0,
        averageDuration: avgDuration[0]?.avgDuration || 0,
        revenuePerHour
      },
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error generating entered cars report:', error);
    res.status(500).json({
      message: 'Error generating report',
      details: error.message
    });
  }
};