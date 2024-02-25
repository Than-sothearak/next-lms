import mongoose, { Document, Model, Schema, Types } from "mongoose";

interface IChapter  {
  title: string;
  description?: string;
  videoUrl?: string;
  price?: number;
  position?: number;
  isPublished: boolean;
  isFree: boolean;
  courseId: Types.ObjectId;
  userProgress: Types.Array<Types.ObjectId>;
  createdAt: Date;
  updatedAt: Date;
}

const ChapterSchema: Schema<IChapter> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String },
    price: { type: Number },
    position: { type: Number },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    userProgress: [{ type: Schema.Types.ObjectId, ref: "UserProgress" }],
  },
  {
    timestamps: true,
  }
);

const ChapterModel: Model<IChapter> = mongoose.models.Chapter || mongoose.model<IChapter>("Chapter", ChapterSchema);

export { ChapterModel as Chapter };
