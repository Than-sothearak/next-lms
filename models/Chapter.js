import mongoose, { model, Schema, models } from "mongoose";

const ChapterSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String },
    price: { type: Number },
    position: { type: Number },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    courseId: { type: mongoose.Types.ObjectId, required: true, ref: "Course" },
    userProgress: [{ type: mongoose.Types.ObjectId, ref: "UserProgress" }],
  },
  {
    timestamps: true,
  }
);

export const Chapter = models.Chapter || model("Chapter", ChapterSchema);
