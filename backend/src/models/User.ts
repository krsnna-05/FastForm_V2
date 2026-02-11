import mongoose from "mongoose";
import type User from "../types/User.DB";

const UserSchema = new mongoose.Schema<User>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  accessToken: { type: String },
  refreshToken: { type: String },
  profilePictureUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const UserModel = mongoose.model<User>("User", UserSchema);

export default UserModel;
