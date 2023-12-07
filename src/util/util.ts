// import { IPost } from "./../types/types";
import jwt from "jsonwebtoken";
import { Document, Types } from "mongoose";
import { IPost, PostTypes, postParamType } from "../types/types";
import UserModel from "../models/user";

export const credentialsVerifier = (username: string, password: string) => {
  interface errorHandlersType {
    username: string | boolean;
    password: string | boolean;
  }
};

export const accessTokenGenerator = async (
  user: any,
  expire_time: string | number = "120s"
) => {
  const { username, _id } = user;
  const payload = { id: _id, username: username };
  const sec = process.env.JWT_SEC as string;
  console.log("env");
  console.log(sec);
  const accessToken = await jwt.sign(payload, sec, {
    expiresIn: expire_time,
  });

  return accessToken;
};

type ModelType =
  | (Document<unknown, {}, IPost> &
      Omit<
        IPost & {
          _id: Types.ObjectId;
        },
        never
      >)
  | null;

export const documentToIpost = async (post: ModelType) => {
  const auth = await UserModel.findById({ _id: post?.author });
  const _post: Pick<
    IPost,
    | "title"
    | "body"
    | "createdAt"
    | "updatedAt"
    | "author"
    | "img"
    | "postType"
    | "_id"
  > = {
    title: post?.title || "",
    body: post?.body || "",
    createdAt: post?.createdAt || new Date(),
    updatedAt: post?.updatedAt || new Date(),
    author: auth?._id,
    img: post?.img || "",
    postType: post?.postType || PostTypes.SLIDE,
    _id: post?._id,
  };

  return _post;
};

export const getAuthorNames = async (posts: postParamType) => {
  const updatedPosts: any = [];

  return new Promise((resolve, reject) => {
    posts.map(async (post) => {
      const user = await UserModel.findOne({ _id: post.author });
      const tempPost = {
        _id: post._id,
        title: post.title,
        body: post.body,
        img: post.img,
        postType: post.postType,
        author: user?.name || "Unknown",
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };
      updatedPosts.push(tempPost);
    });

    resolve(updatedPosts);
  });
};

export const tagBuilder = async (
  title: string,
  author: string,
  resume: string
) => {
  const res = await extractor(title + " " + author + " " + resume);
  return res;
};

export const extractor = async (value: string) => {
  return new Promise((resolve, reject) => {
    const lower = value.toLocaleLowerCase();
    const signRemoved = lower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const nonSig = signRemoved.replace(/[,.!?]/g, "");
    const unique = Array.from(new Set(nonSig.split(" "))).filter(
      (item) => item.length >= 4
    );
    resolve(unique);
  });
};
