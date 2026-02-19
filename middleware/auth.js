const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get the token from header
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;

  // Check if not token
  if (!token) {
    return res.status(401).json({
      success: false,
      msg: "No token, authorization denied",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      msg: "Token is not valid",
    });
  }
};
