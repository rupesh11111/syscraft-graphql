const jwt = require("jsonwebtoken");
const {User} = require("../model");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, "secret-key"); // Replace 'your-secret-key' with your actual JWT secret key
      req.user = await User.findById(decoded.id);
      const user = req.user;
      req.context = { user };
      next();
    } catch (err) {
      res.status(401).json({ message: "Authentication failed" });
    }
  } else {
    next();
  }
};

module.exports = authMiddleware;