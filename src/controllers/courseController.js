import courseModel from "../models/courseModel.js";
import fs from "fs";
import { mutateCourseSchema } from "../utils/schema.js";
import userModel from "../models/userModel.js";
import categoryModel from "../models/categoryModel.js";
import path, { resolve } from "path";
import courseDetailModel from "../models/courseDetailModel.js";

export const getCourses = async (req, res) => {
  try {
    console.log("req.user._id:", req.user?._id);
    const courses = await courseModel
      .find({
        manager: req.user?._id,
      })

      .select("name thumbnail")
      .populate({
        path: "category",
        select: "name -_id",
      })

      .populate({
        path: "students",
        select: "name ",
      });

    const imageUrl = process.env.APP_URL + "/uploads/courses/";

    const response = courses.map((item) => {
      return {
        ...item.toObject(),
        thumbnailUrl: imageUrl + item.thumbnail,
        totalStudents: item.students.length,
      };
    });

    return res.json({
      message: "Get courses succses",
      data: response,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Internal Error Server",
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find();

    return res.json({
      message: "Get categories success",
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await courseModel.findById(id).populate("details");

    return res.json({
      message: "Get course by id success",
      data: course,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const postCourse = async (req, res) => {
  try {
    const body = req.body;
    console.log("req.body:", body);

    // Validasi input pakai Zod
    const parse = mutateCourseSchema.safeParse(body);
    if (!parse.success) {
      const errorMessages = parse.error.issues.map((e) => e.message);

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

export const updateCourse = async (req, res) => {
  try {
    const body = req.body;

    const courseId = req.params.id;

    // Validasi input pakai Zod
    const parse = mutateCourseSchema.safeParse(body);
    if (!parse.success) {
      const errorMessages = parse.error.issues.map((e) => e.message);

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
    const oldCourse = await courseModel.findById(courseId);

    if (!category) {
      return res.status(400).json({
        message: "Category not found",
      });
    }

    await courseModel.findByIdAndUpdate(courseId, {
      name: parse.data.name,
      category: category._id,
      description: parse.data.description,
      tagline: parse.data.tagline,
      thumbnail: req?.file ? req.file?.filename : oldCourse.thumbnail,
      manager: req.user._id,
    });

    return res.status(201).json({
      message: "Updated courses successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await courseModel.findById(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const dirname = path.resolve();
    const filePath = path.join(
      dirname,
      "public/uploads/courses",
      course.thumbnail,
    );

    // jika thumbnail ada, hapus filenya
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // tetap hapus course dari database
    await courseModel.findByIdAndDelete(id);

    return res.json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const postContentCourse = async (req, res) => {
  try {
    const body = req.body;

    const course = await courseModel.findById(body.courseId);

    const postContent = new courseDetailModel({
      title: body.title,
      type: body.type,
      course: course._id,
      youtubeId: body.youtubeId,
      text: body.text,
    });
    await postContent.save();
    await courseModel.findByIdAndUpdate(
      course._id,
      {
        $push: { details: postContent._id },
      },
      { new: true },
    );
    return res.status(201).json({
      message: "Content created successfully",
      data: postContent,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const updateContentCourse = async (req, res) => {
  try {
    const { id } = req.params
    const body = req.body;

    const course = await courseModel.findById(body.courseId);

    await courseDetailModel.findByIdAndUpdate(id, {
      title: body.title,
      type: body.type,
      course: course._id,
      youtubeId: body.youtubeId,
      text: body.text,
    }, { new: true });


    return res.status(201).json({
      message: "Content created successfully"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const deleteContentCourse = async (req, res) => {
  try {
    const { id } = req.params;

    await courseDetailModel.findByIdAndDelete(id);

    return res.json({
      message: "Content deleted successfully"
    })
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}
