// routes/authRoutes.js
const express = require('express');

const { register, login, refreshToken, updateUsername, deleteUser } = require('../controllers/authController');
const authenticateToken = require('../middlewares/authMiddleware.js') 

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
// Route to update username
router.put('/updateUsername', authenticateToken,updateUsername);

router.delete('/user/:id',authenticateToken, deleteUser )

module.exports = router;
