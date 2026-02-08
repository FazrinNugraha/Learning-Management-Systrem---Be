import mongoose from "mongoose";

const courseDetailModel = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['video', 'text'],
        deafult: 'video'
    },
    youtubeId: String,
    textId: String,

    course:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
    },
    
},{timestamps: true,})

export default mongoose.model("CourseDetail", courseDetailModel);   