import mongoose, { model, Schema, models } from "mongoose";

const CategorySchema = new Schema({
  name: { type: String, required: true },
  courses: {type:mongoose.Types.ObjectId, ref:'Category'},
});

export const Category = models.Category || model("Category", CategorySchema);
