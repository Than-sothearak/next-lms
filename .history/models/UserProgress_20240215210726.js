import mongoose, { model, Schema, models } from "mongoose";

const UserProgressSchema = new Schema({
  title: { type: String, required: true },
  userId: {type: String},
  videoUrl: { type: String },
  price: { type: Number},
  position: { type: Number},
  isCompleted: {
    type: Boolean,
    default: false
},
  chapterId: {type:mongoose.Types.ObjectId, ref: 'Chapter'},
  userProgress: [ {type:mongoose.Types.ObjectId, ref: 'UserProgress'}]

}, {
  timestamps: true,
});

export const UserProgress = models.UserProgress || model("UserProgress", UserProgressSchema);
