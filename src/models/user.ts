import mongoose, { Schema } from "mongoose";
import { IUser } from "../types/types";

const PremissionRolesSchema = new Schema({
  SUPER_ADMIN: { type: Number },
  ADMIN: { type: Number },
});

const user = new Schema<IUser>(
  {
    name: { type: String },
    username: { type: String },
    avatar: { type: String },
    password: { type: String },
    activityStatus: { type: Boolean },
    premissionRole: { type: Number },
    passRecovery: { type: String },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model<IUser>("User", user);
export default UserModel;
