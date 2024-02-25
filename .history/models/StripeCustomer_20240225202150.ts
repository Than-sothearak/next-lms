import mongoose, { Document, Model, Schema, Types } from "mongoose";

interface IStripeCustomer extends Document {
  userId?: string;
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StripeCustomerSchema: Schema<IStripeCustomer> = new Schema(
  {
    userId: { type: String },
    stripeCustomerId:  { type: String },
  },
  {
    timestamps: true,
  }
);

const StripeCustomerModel: Model<IStripeCustomer> = mongoose.models.StripeCustomer || mongoose.model<IStripeCustomer>("StripeCustomer", StripeCustomerSchema);

export { StripeCustomerModel as StripeCustomer };
