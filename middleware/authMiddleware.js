import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const protect = async (req, res, next) => {
  console.log("===== PROTECT =====");
  console.log(req.headers.authorization);
  try {
    //console.log("Received Authorization Header:", req.headers.authorization);
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized, token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Not authorized, token missing",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({
        message: "Server configuration error: JWT_SECRET is not set",
      });
    }

    const decoded = jwt.verify(token, jwtSecret);

    const admin = await Admin.findById(decoded.id).select("_id email");

    if (!admin) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    req.admin = admin;
    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Not authorized, token failed",
    });
  }
};
