import mongoose, { model, Schema, models,Types } from "mongoose";


interface CourseProps {
  _id: Types.ObjectId;
  title: string;
  userId: string;
  description: string;
  imageUrl: string;
  price: number;
  isPublished: boolean;
  categoryId: Types.ObjectId;
  attachments: Types.ObjectId[];
  chapter: Types.ObjectId[];

}
const CourseSchema = new Schema<CourseProps>({
  _id: { type: Schema.Types.ObjectId},
  title: { type: String, required: true },
  userId: { type: String },
  description: {type: String},
  imageUrl: { type: String },
  price: { type: Number},
  isPublished: {
    type: Boolean,
    default: false
},
  categoryId: {type: Schema.Types.ObjectId, ref: 'Category'},
  attachments:  [{type: Schema.Types.ObjectId, ref:'Attachment'}],
  chapter: [{type: Schema.Types.ObjectId, ref: 'Chapter'}]

}, {
  timestamps: true,
});


interface CategoryProps {
  name: string;
  courses: Types.ObjectId[]
}
const CategorySchema = new Schema<CategoryProps>({
  
  name: { type: String, required: true },
  courses: [{type: Schema.Types.ObjectId, ref: 'Course'}],
});

export const Category = models.Category || model("Category", CategorySchema);
export const Course = models.Course || model("Course", CourseSchema);
