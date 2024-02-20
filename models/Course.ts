import mongoose, { model, Schema, models,Types,Model } from "mongoose";


interface CourseProps {

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


const CourseModel: Model<CourseProps> = mongoose.models.Course || mongoose.model<CourseProps>("Course", CourseSchema);
export { CourseModel as Course };

const CategoryModel: Model<CategoryProps> = mongoose.models.Category || mongoose.model<CategoryProps>("Category", CategorySchema);
export { CategoryModel as Category };
