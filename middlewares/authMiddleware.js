const jwt = require("jsonwebtoken");
// const { jwtSecret } = require("../config/config");

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ error: "Unauthorized", message: "Missing access token" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ error: "Forbidden", message: "Invalid access token" });
    }
    req.user = user;
    next();
  });
};
