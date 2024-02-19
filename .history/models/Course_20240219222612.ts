import mongoose, { model, Schema, models,Types } from "mongoose";

interface CourseProps {
  title: string;
  userId: string;
  description: string;
  imageUrl: string;
  price: number;
  isPublished: boolean;
  categoryId: Types.ObjectId;
  attachments: mongoose.Types.ObjectId[];
  chapter: {};

}
const CourseSchema = new Schema<CourseProps>({
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
  attachments:  [{type:mongoose.Types.ObjectId, ref:'Attachment'}],
  chapter: [{type:mongoose.Types.ObjectId, ref: 'Chapter'}]

}, {
  timestamps: true,
});


interface CategoryProps {
  name: string;
  courses: {}
}
const CategorySchema = new Schema<CategoryProps>({
  
  name: { type: String, required: true },
  courses: [{type:mongoose.Types.ObjectId, ref: 'Course'}],
});

export const Category = models.Category || model("Category", CategorySchema);
export const Course = models.Course || model("Course", CourseSchema);
