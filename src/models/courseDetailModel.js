import mongoose from "mongoose";
import courseModel from "./courseModel.js";

const courseDetailModel = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["video", "text"],
      deafult: "video",
    },
    youtubeId: String,
    textId: String,

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  },
  { timestamps: true },
);

courseDetailModel.post("findOneAndDelete", async (doc) => {
  if (doc) {
    await courseModel.findByIdAndUpdate(doc.course, {
      $pull: {
        details: doc._id
      },
    });
  }
});

export default mongoose.model("CourseDetail", courseDetailModel);
