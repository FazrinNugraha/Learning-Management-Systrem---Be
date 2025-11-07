import courseModel from "../models/courseModel.js";
import fs from 'fs';
import { mutateCourseSchema } from "../utils/schema.js";
import userModel from "../models/userModel.js";

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
        const body = req.body

        const parse = mutateCourseSchema.parse(body)

        if (!parse.success) {
            const errorMessages = parse.error.errors.map(e => e.message)

            if(req?.file?.path && fs.existsSync(req?.file?.path)) {
                fs.unlinkSync (req?.file?.path)

        }

        return res.status(400).json ({
            message: "Validation Error",
            errors: errorMessages
        })

    }
    const category = await courseModel.findById(parse.data.categoryId)

    if (!category) {
        return res.status(400).json ({
            message: "Category not found"
        })
    }

    const course = new courseModel ({
        name: parse.data.name,
        category: category._id,
        desctiption: parse.data.description,
        tagline: parse.data.tagline,
        thumbnail: req.file?.filname,
        manager: user._id,
    })

    await course.save()

    await categoryModel.findByIdAndUpdate(category._id, {
        $push: {
            courses: course._id
        },
    }, {new: true})

     await userModel.findByIdAndUpdate(category._id, {
        $push: {
            courses: course._id
        },
    }, {new: true})

    return res.json ({
        message: "Course created successfully",
        data: course
    })


    } catch (error) {
        console.log(error)
        return res.status(500).json ({
            message: "Internal Server Error"
        })
    }
}