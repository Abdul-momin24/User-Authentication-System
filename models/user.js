const { DataTypes } = require('sequelize');
const sequelize = require('../db.js'); // Make sure to point to your database connection

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Unique constraint applied here
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Unique constraint applied here
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

module.exports = User;
