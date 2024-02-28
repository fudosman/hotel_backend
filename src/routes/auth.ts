import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { check, validationResult } from "express-validator";

import User from "../models/user";
const router = express.Router();

router.post(
  "/login",
  [
    check("email")
      .notEmpty()
      .isEmail()
      .withMessage("a valid email is required"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
      }
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "User not found" });
      }
      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Credentials" });
      }
      const token = jwt.sign(
        {
          userId: user.id,
        },
        process.env.JWT_SECRET_KEY!,
        { expiresIn: "1d" }
      );

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        maxAge: 86400000,
      });

      return res.status(201).json({
        success: true,
        message: "User logged in successfully",
        userId: user._id,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: `Login error: something went wrong`,
      });
    }
  }
);

export default router;
