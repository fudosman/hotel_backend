import cors from "cors";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import morgan from "morgan";
import userRoutes from "./routes/users";
import authRoutes from "./routes/auth";

dotenv.config();
const PORT = process.env.PORT || 3000;

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL!);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

async function startServer() {
  const app = express();
  app.use(cookieParser());

  // Middleware
  app.use(
    morgan(
      ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms'
    )
  ); // Morgan logging middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    })
  );

  // Route handler
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

async function initialize() {
  try {
    await connectDB();
    await startServer();
  } catch (error) {
    console.error("Error initializing app:", error);
    process.exit(1);
  }
}

initialize();
