const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/login", async (req, res) => {
  const user = await User.findOne({ universityId: req.body.universityId });
  if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(401).send("Invalid credentials");
  }
  user.token = jwt.sign({ id: user._id, userType: user.userType }, "secret");
  await user.save();
  res.send({ token: user.token });
});

router.post("/register", async (req, res) => {
  try {
    const existingUser = await User.findOne({
      universityId: req.body.universityId,
    });

    if (existingUser) {
      return res.status(400).send("User with this universityId already exists");
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      universityId: req.body.universityId,
      password: hashedPassword,
      userType: "dean",
    });
    await newUser.save();
    const token = jwt.sign({ id: newUser._id, userType: newUser.userType }, "secret");

    res.send({ token });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
