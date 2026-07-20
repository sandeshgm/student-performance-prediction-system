import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, ".env") });

const app = express();

const corsOptions = {
  origin(origin, callback) {
    // Dynamically allow any origin (needed for ngrok and different developer laptops)
    callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "ngrok-skip-browser-warning",
  ],
};

app.use(cors(corsOptions));

app.options(/.*/, cors(corsOptions));

// Middlewares
app.use(express.json());

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/students", studentRoutes);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log("DB Connection Error:", error.message);
  }
};

startServer();
