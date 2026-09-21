import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const DUMMY_HASH =
  "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
    const passwordMatches = await bcrypt.compare(
      password,
      admin?.password || DUMMY_HASH,
    );

    if (!admin || !passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({
        message: "Server configuration error",
      });
    }

    const token = jwt.sign({ id: admin._id }, jwtSecret, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      message: "Login Successful",
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong.",
    });
  }
};
