const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, name, email, password, role } = req.body;

    // Validate required fields
    if (!username || !name || !email || !password) {
      return res.status(400).json({ 
        message: 'All fields are required',
        details: {
          username: !username ? 'Username is required' : null,
          name: !name ? 'Name is required' : null,
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists',
        details: existingUser.email === email ? 'Email already in use' : 'Username already taken'
      });
    }

    // Validate role
    const validRoles = ['admin', 'parking_attendant'];
    const userRole = role || 'parking_attendant'; // Default to parking_attendant
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({ 
        message: 'Invalid role',
        details: 'Role must be either admin or parking_attendant'
      });
    }

    // Create new user
    const user = new User({
      username,
      name,
      email,
      password,
      role: userRole
    });

    // Save user
    try {
      await user.save();
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      return res.status(500).json({ 
        message: 'Error saving user', 
        error: saveError.message,
        details: saveError.errors // Include validation errors if any
      });
    }

    // Generate JWT token
    const token = user.generateAuthToken();

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error registering user', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate JWT token
    const token = user.generateAuthToken();

    // Split name into first and last name for frontend
    const [firstName, ...lastNameParts] = user.name.split(' ');
    const lastName = lastNameParts.join(' ');

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        firstName,
        lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Error logging in', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get current user data
exports.getCurrentUser = async (req, res) => {
  try {
    // Handle both userId and id in token payload
    const userId = req.user.userId || req.user.id;
    if (!userId) {
      return res.status(401).json({
        error: 'Invalid token',
        details: 'Token payload missing user ID'
      });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        details: 'No user found with the provided ID'
      });
    }

    // Split name into first and last name for frontend
    const [firstName, ...lastNameParts] = user.name.split(' ');
    const lastName = lastNameParts.join(' ');

    res.json({
      id: user._id,
      username: user.username,
      name: user.name,
      firstName,
      lastName,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      error: 'Error fetching user data',
      details: error.message
    });
  }
}; 