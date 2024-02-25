import mongoose, { Document, Model, Schema, Types } from "mongoose";


interface IuserProgress extends Document {
  userId: string;
  isCompleted: boolean;
  chapterId:Types.ObjectId;

}
const UserProgressSchema = new Schema<IuserProgress>({
  userId: {type: String},
  isCompleted: {
    type: Boolean,
    default: false
},
  chapterId: {type: Schema.Types.ObjectId, ref: 'Chapter'},

}, {
  timestamps: true,
});

const UserProgressModel: Model<IuserProgress> = mongoose.models.UserProgress || mongoose.model<IuserProgress>("UserProgress", UserProgressSchema);

export { UserProgressModel as UserProgress };