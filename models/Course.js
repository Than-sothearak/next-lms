import mongoose, { model, Schema, models } from "mongoose";

const CourseSchema = new Schema({
  title: { type: String, required: true },
  userId: { type: String },
  description: {type: String},
  imageUrl: { type: String },
  price: { type: Number},
  isPublished: {
    type: Boolean,
    default: false
},
  categoryId: {type:mongoose.Types.ObjectId, ref: 'Category'},
  attachments: [{type:mongoose.Types.ObjectId, ref: 'Attachment'}],
  chapter: [{type:mongoose.Types.ObjectId, ref: 'Chapter'}]

}, {
  timestamps: true,
});



const CategorySchema = new Schema({
  name: { type: String, required: true },
  courses: [{type:mongoose.Types.ObjectId, ref: 'Course'}],
});

export const Category = models.Category || model("Category", CategorySchema);
export const Course = models.Course || model("Course", CourseSchema);
