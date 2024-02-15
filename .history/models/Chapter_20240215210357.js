import mongoose, { model, Schema, models } from "mongoose";

const ChapterSchema = new Schema({
  title: { type: String, required: true },
  description: {type: String},
  videoUrl: { type: String },
  price: { type: Number},
  isPublic: {
    type: Boolean,
    default: false
},
  courseId: {type:mongoose.Types.ObjectId, ref: 'Courses'},

}, {
  timestamps: true,
});

export const Chapter = models.Chapter || model("Chapter", ChapterSchema);
