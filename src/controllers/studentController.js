import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import { mutateCourseSchema, mutateStudentSchema } from "../utils/schema.js";
import fs from "fs";

export const getStudent = async (req, res) => {
  try {
    const student = await userModel.find({
      role: "student",
      manager: req.user._id,
    });
    return res.status(200).json({
      message: "Get students successfully",
      data: student,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const postStudent = async (req, res) => {
  try {
    const body = req.body;

    const parse = mutateStudentSchema.safeParse(body);

    if (!parse.success) {
      const errorMessages = parse.error.issues.map((e) => e.message);

      if (req?.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        message: "Validation Error",
        data: null,
        errors: errorMessages,
      });
    }

    const hashedPassword = await bcrypt.hashSync(body.password, 12);

    const student = new userModel({
      name: parse.data.name,
      email: parse.data.email,
      password: hashedPassword,
      photo: req.file?.filename,
      role: "student",
      manager: req.user._id,
    });
    await student.save();
    return res.status(201).json({
      message: "Student created successfully",
      data: student,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
