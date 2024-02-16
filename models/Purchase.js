import mongoose, { model, Schema, models } from "mongoose";

const PurchaseSchema = new Schema({
  userId: { type: String,},
  courses: [{type:mongoose.Types.ObjectId, ref: 'Course'}],
},{
    timestamps: true,
  });

export const Purchase = models.Purchase || model("Purchase", PurchaseSchema);
