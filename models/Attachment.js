import mongoose, { model, Schema, models } from "mongoose";
import { Course } from "./Course";

const AttachmentSchema = new Schema({
  name: {type: String},
  url: {type: String, required: true},
  courses: {type:mongoose.Types.ObjectId, ref: Course},
},
{
  timestamps: true,
});

export const Attachment = models.Attachment || model("Attachment", AttachmentSchema);
