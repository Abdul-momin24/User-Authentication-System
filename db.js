// models/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create a new Sequelize instance with database credentials
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false,
},
);

// Export the Sequelize instance
module.exports = sequelize;
