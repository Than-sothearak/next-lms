import mongoose, { model, Schema, models } from "mongoose";

const StripeCustomerSchema = new Schema({
  userId: { type: String,},
  StripeCustomerId: { type: String},
  courses: [{type:mongoose.Types.ObjectId, ref: 'Course'}],
},{
    timestamps: true,
  });

export const StripeCustomer = models.StripeCustomer || model("StripeCustomer", StripeCustomerSchema);
