import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../.env") });

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set");
  }

  await connectDB();

  const existingAdmin = await Admin.findOne({
    email: email.trim().toLowerCase(),
  });

  if (existingAdmin) {
    console.log("Admin already exists");
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await Admin.create({
    email: email.trim().toLowerCase(),
    password: hashedPassword,
  });

  console.log("Admin account created");
  await mongoose.disconnect();
};

seedAdmin().catch(async (error) => {
  console.error("Seed admin failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
