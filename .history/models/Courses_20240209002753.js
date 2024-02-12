import mongoose, { model, Schema, models } from "mongoose";
import { boolean } from "zod";

const CourseSchema = new Schema({
  title: { type: String, required: true },
  discription: {type: String},
  images: [{ type: String }],
  price: { type: Number, required: true },
  isPublic: {
    type: Boolean,
    default: false
},
  category: {type: String},
  attachment: {type:Object},

}, {
  timestamps: true,
});

export const Course = models.Course || model("Course", CourseSchema);
