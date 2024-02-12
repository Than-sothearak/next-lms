import mongoose, { model, Schema, models } from "mongoose";
import { Category } from "./Category";

const CourseSchema = new Schema({
  title: { type: String, required: true },
  userId: { type: String },
  discription: {type: String},
  images: [{ type: String }],
  price: { type: Number},
  isPublic: {
    type: Boolean,
    default: false
},
  category: {type:mongoose.Types.ObjectId, ref: Category},
  attachment: [{type:String}],

}, {
  timestamps: true,
});

export const Course = models.Course || model("Course", CourseSchema);
