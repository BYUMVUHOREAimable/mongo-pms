const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'XWZ LTD Parking Management System API',
      version: '1.0.0',
      description: 'API documentation for the XWZ LTD Parking Management System',
      contact: {
        name: 'XWZ LTD Support',
        email: 'support@xwz.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            name: {
              type: 'string',
              description: 'User\'s full name',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User\'s email address',
              example: 'john@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User\'s password (min 6 characters)',
              example: 'password123'
            },
            role: {
              type: 'string',
              enum: ['admin', 'parking_attendant'],
              description: 'User\'s role in the system',
              example: 'parking_attendant'
            }
          }
        },
        Parking: {
          type: 'object',
          required: ['code', 'name', 'availableSpaces', 'location', 'chargingFeesPerHour'],
          properties: {
            code: {
              type: 'string',
              description: 'Unique parking lot code',
              example: 'P001'
            },
            name: {
              type: 'string',
              description: 'Name of the parking lot',
              example: 'Downtown Parking'
            },
            availableSpaces: {
              type: 'integer',
              minimum: 0,
              description: 'Number of available parking spaces',
              example: 50
            },
            location: {
              type: 'string',
              description: 'Location of the parking lot',
              example: '123 Main St, City'
            },
            chargingFeesPerHour: {
              type: 'number',
              minimum: 0,
              description: 'Charging fee per hour in RWF',
              example: 1000
            }
          }
        },
        CarEntry: {
          type: 'object',
          required: ['plateNumber', 'parking', 'recordedBy'],
          properties: {
            plateNumber: {
              type: 'string',
              description: 'Vehicle plate number',
              example: 'RAA123A'
            },
            parking: {
              type: 'string',
              description: 'ID of the parking lot',
              example: '507f1f77bcf86cd799439011'
            },
            recordedBy: {
              type: 'string',
              description: 'ID of the user recording the entry',
              example: '507f1f77bcf86cd799439012'
            },
            entryTime: {
              type: 'string',
              format: 'date-time',
              description: 'Entry time (auto-generated)',
              example: '2024-03-20T10:00:00Z'
            },
            exitTime: {
              type: 'string',
              format: 'date-time',
              description: 'Exit time (null if not exited)',
              example: '2024-03-20T12:00:00Z'
            },
            status: {
              type: 'string',
              enum: ['active', 'completed'],
              description: 'Entry status',
              example: 'active'
            },
            fee: {
              type: 'number',
              minimum: 0,
              description: 'Parking fee in RWF',
              example: 2000
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Invalid input data'
            }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./routes/*.js', './controllers/*.js'] // Path to the API routes and controllers
};

const specs = swaggerJsdoc(options);

module.exports = specs; 