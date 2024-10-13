const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('../db'); // Adjust the path if necessary
const User = require("../models/user.js");
const RefreshToken = require("../models/refreshToken.js") // Assuming you have a User model // Create a RefreshToken model to handle refresh tokens

// Helper function to generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken };
};

// Register User
exports.register = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const user = await User.create({
      username,
      password: hashedPassword,
      email
    });

    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (err) {
    if (err.name == 'SequelizeUniqueConstraintError') {
      const duplicateField = err.errors[0].path; // This will give you the field that caused the duplicate error (e.g., 'username' or 'email')
      return res.status(400).json({ message: `Duplicate entry: The ${duplicateField} is already taken.` });
    }

    console.error("Error registering user:", err);
    res.status(500).json({ message: 'Error registering user', error: err });
  }
};

// Login User
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({
      where: {
        username: username,
      }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: 'Invalid password' });

    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token in database (use refreshToken, not accessToken)
    await RefreshToken.create({
      token: refreshToken,
      userId: user.id,
      expiryDate: sequelize.literal("DATE_ADD(NOW(), INTERVAL 1 DAY)")
    });

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: 'Error logging in', error: err });
  }
};

// Refresh Token
// Refresh Token
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const tokenData = await RefreshToken.findOne({
      where: {
        token: refreshToken,
      }
    });

    if (!tokenData) return res.status(403).json({ message: 'Invalid refresh token' });

    // Check if the refresh token is expired
    if (new Date(tokenData.expiryDate) < new Date()) {
      return res.status(403).json({ message: 'Refresh token expired' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(payload.id);

    // Update the refresh token in the database
    tokenData.token = newRefreshToken;
    tokenData.expiryDate = sequelize.literal("DATE_ADD(NOW(), INTERVAL 7 DAY)");
    await tokenData.save();

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
    return res.status(403).json({ message: 'Refresh token expired' });
  }
  return res.status(403).json({ message: 'Invalid token', error: err });
}}


// Update User's Username
exports.updateUsername = async (req, res) => {
  const { username: newUsername } = req.body;
  console.log(newUsername);
  const userId = req.user.id; 
  console.log("User ID:", userId);// Get userId from token

  try {
    // Find the user by their ID
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the new username already exists
    const existingUser = await User.findOne({ where: { username: newUsername } });
    if (existingUser) {
      return res.status(409).json({ message: 'Username is already taken' });
    }

    // Update the username
    user.username = newUsername; // Use direct assignment or user.update
    await user.save(); 

    console.log("ye walaa",user.username);

    res.status(200).json({ message: 'Username updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Error updating username', error: err });
  }
};


exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    await sequelize.transaction(async (t) => {
      await RefreshToken.destroy({ where: { userId }, transaction: t });
      const result = await User.destroy({ where: { id: userId }, transaction: t });
      if (!result) throw new Error('User not found');
    });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};
