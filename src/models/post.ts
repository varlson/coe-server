import { tagBuilder } from "./../util/util";
import mongoose, { Schema, Types } from "mongoose";
import { IPost, userType } from "../types/types";
import UserModel from "./user";

const Post = new Schema<IPost>(
  {
    title: { type: String },
    resumo: { type: String },
    body: { type: String },
    img: { type: String },
    noticeNumber: { type: String, default: "Nenhum" },
    postType: { type: Number, default: 1 },
    author: { type: Types.ObjectId, ref: "User" },
    edit_by: { type: Types.ObjectId, ref: "User" },
    tags: { type: [String] },
  },
  {
    timestamps: true,
  }
);

Post.pre("save", async function as(next) {
  const user = (await UserModel.findById(this.author)) as userType;
  const userName = user.name || "";
  const tags = (await tagBuilder(this.title, userName, "")) as string[];
  this.tags = tags;
  next();
});

const PostSchema = mongoose.model<IPost>("Post", Post);
export default PostSchema;
