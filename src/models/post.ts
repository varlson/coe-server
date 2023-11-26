import mongoose, { Schema, Types } from "mongoose";
import { IPost } from "../types/types";

const Post = new Schema<IPost>(
  {
    title: { type: String },
    body: { type: String },
    img: { type: String },
    noticeNumber: { type: String, default: "Nenhum" },
    postType: { type: Number, default: 1 },
    author: { type: Types.ObjectId, ref: "User" },
    edit_by: { type: Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const PostSchema = mongoose.model<IPost>("Post", Post);
export default PostSchema;
