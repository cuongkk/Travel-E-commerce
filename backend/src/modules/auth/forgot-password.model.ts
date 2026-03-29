import mongoose, { Document, Schema } from "mongoose";

export interface IForgotPassword extends Document {
  email: string;
  otp: string;
  expireAt: Date;
}

const schema = new Schema<IForgotPassword>(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expireAt: {
      type: Date,
      expires: 0,
    },
  },
  {
    timestamps: true,
  },
);

const ForgotPassword = mongoose.model<IForgotPassword>("ForgotPassword", schema, "forgot-password");

export default ForgotPassword;
