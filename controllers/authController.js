const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authService = require("../services/authService");
const User = require("../models/user");
const { successResponse, errorResponse } = require("../utils/response");

exports.register = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      name,
      password: hashedPassword,
      email,
    });
    successResponse(res, 201, "Berhasil membuat user", user);
  } catch (err) {
    console.error(err);
    errorResponse(res, 500, "Internal server error");
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({
      where: { username },
    });

    if (!user) {
      return errorResponse(res, 401, "Invalid credentials");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return errorResponse(res, 401, "Invalid credentials");
    }

    const accessToken = authService.generateAccessToken(user);

    const accessTokenData = jwt.decode(accessToken);
    const accessTokenExpiry = accessTokenData
      ? accessTokenData.exp - Math.floor(Date.now() / 1000)
      : null;

    await user.save();

    const userRes = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
    };

    res.json({
      status: "success",
      message: "Berhasil login",
      accessToken,
      expires: accessTokenExpiry,
      data: userRes,
    });
  } catch (err) {
    console.error(err);
    errorResponse(res, 500, "Internal server error");
  }
};
