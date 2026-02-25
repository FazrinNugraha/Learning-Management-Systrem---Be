import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import { mutateCourseSchema, mutateStudentSchema } from "../utils/schema.js";
import fs from "fs";
import path from "path";

export const getStudent = async (req, res) => {
  try {
    const student = await userModel
      .find({
        role: "student",
        manager: req.user._id,
      })
      .select("name courses photo");

    const photoUrl = process.env.APP_URL + "/uploads/students/";

    const response = student.map((item) => {
      return {
        ...item.toObject(),
        photo_url: photoUrl + item.photo,
      };
    });

    return res.status(200).json({
      message: "Get students successfully",
      data: response,
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

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const parse = mutateStudentSchema
      .partial({
        password: true,
      })
      .safeParse(body);

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

    const student = await userModel.findById(id);

    const hashedPassword = parse.data.password
      ? await bcrypt.hashSync(parse.data.password, 12)
      : student.password;

    await userModel.findByIdAndUpdate(id, {
      name: parse.data.name,
      email: parse.data.email,
      password: hashedPassword,
      photo: req.file ? req.file.filename : student.photo,
    });

    await student.save();
    return res.status(201).json({
      message: "Update created successfully",
      data: student,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await userModel.findById(id);

    await userModel.findOneAndUpdate(
      {
        students: id,
      },
      {
        $pull: {
          students: id,
        },
      },
    );

    const dirname = path.resolve();
    const filePath = path.join(
      dirname,
      "public/uploads/students",
      student.photo,
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await userModel.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Delete student successfully",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
