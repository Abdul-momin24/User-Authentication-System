if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// app.js
const express = require('express');
const sequelize = require('./db.js');
const authRoutes = require('./routes/authRoutes.js');



const app = express();
app.use(express.urlencoded({extended:true}));
app.use(express.json());

// Sync the models with the database (create tables if not exist)
sequelize.sync()  // `{ alter: true }` checks and adjusts the schema to match the model
  .then(() => {
    console.log("Database & tables created!");
  })
  .catch((err) => {
    console.error("Error creating tables:", err);
  });
// Routes
app.use('/api/auth', authRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
