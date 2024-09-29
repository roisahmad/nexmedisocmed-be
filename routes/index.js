const express = require("express");
const authRoutes = require("./authRoutes");
const feedRoutes = require("./feedRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/feed", feedRoutes);

module.exports = router;
