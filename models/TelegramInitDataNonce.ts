import mongoose, { Model, Schema } from "mongoose";

interface TelegramInitDataNonceProps {
  digest: string;
  expiresAt: Date;
}

const TelegramInitDataNonceSchema = new Schema<TelegramInitDataNonceProps>({
  digest: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, expires: 0 },
});

export const TelegramInitDataNonce: Model<TelegramInitDataNonceProps> =
  mongoose.models.TelegramInitDataNonce ||
  mongoose.model<TelegramInitDataNonceProps>("TelegramInitDataNonce", TelegramInitDataNonceSchema);
