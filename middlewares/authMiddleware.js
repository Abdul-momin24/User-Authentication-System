const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  // Check if the authorization header exists and starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // Extract the token by removing 'Bearer ' from the string
  const token = authHeader.replace('Bearer ', '').trim();

  try {
    // Verify the token and extract the user ID
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    req.user = { id: decoded.id };
    console.log(req.user); // Attach user ID to the request
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    // Log the error for debugging (optional, useful for development)
    console.error(`JWT Verification Error: ${err.message}`);

    // Return a generic error message
    res.status(400).json({ message: `Invalid token ${err.message}` });
  }
};
