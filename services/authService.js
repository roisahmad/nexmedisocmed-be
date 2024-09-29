const jwt = require("jsonwebtoken");
const { jwtExpiration } = require("../config/config");

exports.generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: jwtExpiration }
  );
};
