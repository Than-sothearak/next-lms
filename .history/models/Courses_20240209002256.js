import mongoose, { model, Schema, models } from "mongoose";

const CourseSchema = new Schema({
  title: { type: String, required: true },
  discription: {type: String},
  images: [{ type: String }],

}, {
  timestamps: true,
});

export const Course = models.Course || model("Course", CourseSchema);
