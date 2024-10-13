// models/refreshToken.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db.js'); // Adjust this path to your Sequelize instance

const RefreshToken = sequelize.define('Refreshtoken', {
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // 'users' refers to the table name of the User model
      key: 'id',
    },
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: false, // Adjust based on your preference
});

module.exports = RefreshToken;
