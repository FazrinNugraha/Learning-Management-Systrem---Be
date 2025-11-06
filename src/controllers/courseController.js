import courseModel from "../models/courseModel.js";

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