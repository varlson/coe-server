import { Request as ExpressRequest } from "express";
import { Document, Types } from "mongoose";

export interface IPost extends Document {
  noticeNumber?: string;
  title: string;
  img: string;
  body: string;
  resumo: string;
  createdAt?: Date;
  updatedAt?: Date;
  postType: number;
  author: IUser["_id"];
  edit_by?: IUser["_id"];
  tags: string[];
}

export enum PremissionRoles {
  SUPER_ADMIN,
  ADMIN,
}

export enum PostTypes {
  SLIDE = 1,
  NEWS,
  NOTICE,
}

export interface IUser extends Document {
  name: string;
  username: string;
  password: string;
  avatar: string;
  activityStatus: boolean;
  createdAt: Date;
  updatedAt: Date;
  premissionRole: number;
  passRecovery?: string;
}

export interface Request extends ExpressRequest {
  uploadedId: string;
}

export type postParamType = (Document<unknown, {}, IPost> &
  Omit<
    IPost & {
      _id: Types.ObjectId;
    },
    never
  >)[];

export type userType = {
  name: string;
  username: string;
  _id?: string;
  avatar?: string;
  premissionRole?: number | string;
  activityStatus?: boolean;
  password?: string;
};
