import mongoose, { model, Schema, models } from "mongoose";

const AttachmentSchema = new Schema({
  name: {type: String},
  url: {type: String, required: true},
  courses: {type:mongoose.Types.ObjectId, ref: 'Courses'},
},
{
  timestamps: true,
});

export const Attachment = models.Attachment || model("Attachment", AttachmentSchema);
