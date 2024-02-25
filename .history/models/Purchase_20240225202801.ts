import mongoose, { Document, Model, Schema, Types } from "mongoose";

interface IPurchase extends Document {
  userId: string;
  courseId: Types.Array<Types.ObjectId>;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema: Schema<IPurchase> = new Schema(
  {
    userId: { type: String },
    courseId: [{ type: Types.ObjectId, ref: "Course" }],
  },
  {
    timestamps: true,
  }
);

const PurchaseModel: Model<IPurchase> = mongoose.models.Purchase || mongoose.model<IPurchase>("Purchase", PurchaseSchema);

export { PurchaseModel as Purchase };
