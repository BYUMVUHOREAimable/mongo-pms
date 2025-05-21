# XWZ LTD Parking Management System

A modern parking management system for XWZ LTD, built with a microservices architecture using Node.js, Express, MongoDB, and React.

## Features

- 🔐 **Authentication & Authorization**
  - User registration and login
  - Role-based access control (Admin, Parking Attendant, Driver)
  - JWT-based authentication

- 🅿️ **Parking Management**
  - Create, update, and delete parking lots
  - Track available spaces
  - Real-time parking status

- 🚗 **Car Entry/Exit Management**
  - Record car entries and exits
  - Generate parking tickets
  - Calculate parking fees
  - Track vehicle history

- 📊 **Reporting**
  - Generate reports for car entries/exits
  - Filter reports by date range
  - Export report data

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- Swagger for API documentation
- Jest for testing

### Frontend
- React with React Router
- Tailwind CSS for styling
- Axios for API calls
- React Query for data fetching

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/BYUMVUHOREAimable/xwz-parking-system.git
cd xwz-parking-system
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/xwz-parking
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

5. Start the development servers:

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

## API Usage Guide

### Authentication

#### Using Swagger UI
1. Open http://localhost:5000/api-docs in your browser
2. Navigate to the "Authentication" section
3. Use the `/api/users/register` endpoint to create a new user
4. Use the `/api/users/login` endpoint to get your JWT token
5. Click the "Authorize" button at the top and enter your token

#### Using Postman
1. Create a new collection for XWZ Parking API
2. Set up environment variables:
   - `base_url`: http://localhost:5000
   - `token`: (your JWT token)

3. Authentication Endpoints:
   ```
   POST {{base_url}}/api/users/register
   Content-Type: application/json

   {
     "name": "Admin User",
     "email": "admin@xwz.com",
     "password": "admin123",
     "role": "admin"
   }
   ```

   ```
   POST {{base_url}}/api/users/login
   Content-Type: application/json

   {
     "email": "admin@xwz.com",
     "password": "admin123"
   }
   ```

4. Add Authorization Header:
   - Key: `Authorization`
   - Value: `Bearer {{token}}`

### API Endpoints

#### Parking Management
- `GET /api/parking` - Get all parking lots
- `POST /api/parking` - Create a new parking lot (Admin only)
- `PUT /api/parking/:id` - Update a parking lot (Admin only)
- `DELETE /api/parking/:id` - Delete a parking lot (Admin only)

#### Car Entry/Exit
- `POST /api/car-entries` - Record a new car entry
- `PUT /api/car-entries/:id/exit` - Record car exit and generate bill
- `GET /api/car-entries` - Get all car entries
- `GET /api/car-entries/:id` - Get a specific car entry

#### Reports
- `GET /api/reports/outgoing` - Get report of outgoing cars (Admin only)
- `GET /api/reports/entered` - Get report of entered cars (Admin only)

### Example API Calls

#### Create a Parking Lot (Admin)
```bash
curl -X POST http://localhost:5000/api/parking \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Parking",
    "location": "Downtown",
    "totalSpaces": 100,
    "ratePerHour": 1000
  }'
```

#### Record Car Entry
```bash
curl -X POST http://localhost:5000/api/car-entries \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "plateNumber": "RAA123A",
    "parking": "parking_lot_id_here"
  }'
```

## User Roles and Permissions

### Admin
- Full access to all features
- Can manage parking lots
- Can view all reports
- Can manage car entries/exits

### Parking Attendant
- Can record car entries/exits
- Can view parking lot status
- Cannot access reports or manage parking lots

### Driver
- Can view parking lot status
- Cannot access management features

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Code Style
- Backend follows ESLint configuration
- Frontend uses Prettier for formatting

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Support
For support, email aimablebyumvuhore@gmail.com or create an issue in the repository. 