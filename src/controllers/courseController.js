import courseModel from "../models/courseModel.js";
import fs from 'fs';
import { mutateCourseSchema } from "../utils/schema.js";
import userModel from "../models/userModel.js";
import categoryModel from "../models/categoryModel.js";

export const getCourses = async (req, res) => {
    try {
        const courses = await courseModel.find({
            manager: req.user?._id
        })

        .select('name thumbnail')
        .populate({
            path: 'category',
            select: 'name -_id'
        })

        .populate({
            path: 'students' ,
            select: 'name '
        })

        return res.json({
            message: "Get courses succses",
            data: courses
        })
    } catch (error) {
        return res.status(400).json ({
            message: "Internal Error Server"
        })
    }
}

export const postCourse = async (req, res) => {
  try {
    const body = req.body;
    console.log("req.body:", body);

    // Validasi input pakai Zod
    const parse = mutateCourseSchema.safeParse(body);
    if (!parse.success) {
      const errorMessages = parse.error.issues.map(e => e.message);

      // Hapus file kalau ada, tapi validasi gagal
      if (req?.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        message: "Validation Error",
        data: null,
        errors: errorMessages,
      });
    }

    // ✅ Cari kategori di collection Category
    const category = await categoryModel.findById(parse.data.categoryId);
    if (!category) {
      return res.status(400).json({
        message: "Category not found",
      });
    }

    // ✅ Buat course baru
    const course = new courseModel({
      name: parse.data.name,
      category: category._id,
      description: parse.data.description,
      tagline: parse.data.tagline,
      thumbnail: req.file?.filename, // bukan filname
      manager: req.user?._id,
    });

    await course.save();

    // Update category dan user
    await categoryModel.findByIdAndUpdate(category._id, {
      $push: { courses: course._id },
    });

    await userModel.findByIdAndUpdate(req.user?._id, {
      $push: { courses: course._id },
    });

    return res.status(201).json({
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};