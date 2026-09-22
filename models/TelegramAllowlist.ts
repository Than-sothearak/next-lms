import mongoose, { Model, Schema } from "mongoose";

export interface TelegramAllowlistEntry {
  telegramId: string;
  status?: "pending" | "approved" | "disabled";
  /** Legacy values from the first version of the allowlist. */
  active?: boolean;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  clerkUserId?: string;
  addedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const TelegramAllowlistSchema = new Schema<TelegramAllowlistEntry>(
  {
    telegramId: { type: String, required: true, unique: true, index: true },
    status: { type: String, enum: ["pending", "approved", "disabled"], default: "pending", index: true },
    active: { type: Boolean },
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String },
    photoUrl: { type: String },
    clerkUserId: { type: String },
    addedBy: { type: String, required: true },
  },
  { timestamps: true }
);

export const TelegramAllowlist: Model<TelegramAllowlistEntry> =
  mongoose.models.TelegramAllowlist ||
  mongoose.model<TelegramAllowlistEntry>("TelegramAllowlist", TelegramAllowlistSchema);
