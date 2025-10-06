const jwt = require("jsonwebtoken");

const ticketAuth = (req, res, next) => {
   const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({status:401, message: "Access Denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET_KEY);

    if (!decoded.ticketId) {
      return res.status(403).json({ status: 403, message: "Not a valid ticket token" });
    }

    req.ticket = decoded; 
    next();
  } catch (error) {
    return res.status(401).json({ status: 401, message: "Invalid or expired token" });
  }
};

module.exports = ticketAuth;
