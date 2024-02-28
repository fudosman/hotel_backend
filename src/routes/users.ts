import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { check, validationResult } from "express-validator";

import User from "../models/user";
const router = express.Router();

router.post(
  "/register",
  [
    check("firstname")
      .notEmpty()
      .isString()
      .withMessage("Firstname is required"),
    check("lastname").notEmpty().withMessage("Lastname is required").isString(),
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
      if (user) {
        return res
          .status(400)
          .json({ success: false, message: "User already exists" });
      }

      const newUser = new User(req.body);
      await newUser.save();

      const token = jwt.sign(
        {
          userId: newUser.id,
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
        message: "User registered successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "An error occurred while saving the user",
      });
    }
  }
);

export default router;
