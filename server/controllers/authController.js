import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import dotenv from 'dotenv';
dotenv.config(); // 👈 load the environment variables here too
const JWT_SECRET = process.env.JWT_SECRET;


// Sign up
export const signup = async (req, res) => {
  const { name, phone, password } = req.body;
  console.log("Received signup:", req.body);
  try {
    const existingUser = await User.findOne({ phone });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, phone, password: hashedPassword });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({ user, token });
    console.log("SIGNUP PAYLOAD", req.body);


  } catch (error) {
    res.status(500).json({ message: "Signup failed", error });
    console.error("Signup error:", error);

  }
};

// Login
export const login = async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = await User.findOne({ name });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
};
