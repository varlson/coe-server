import fs from "fs";
import { drive_v3, google } from "googleapis";
import { IPost } from "../types/types";
import UserModel from "../models/user";
import { Document, Types } from "mongoose";
const STORAGE_ID = "1Pd7dliz0UVQLhauoXR0qd5ymqdBphJlp";

const auth = new google.auth.GoogleAuth({
  keyFile: "./credentials.json",
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const driveServices = google.drive({
  version: "v3",
  auth,
});

export const uploadFile = async (file: Express.Multer.File) => {
  const filename = file?.originalname;
  try {
    const fileMetadata = {
      name: filename,
      parents: [STORAGE_ID],
    };

    const media = {
      mimeType: file?.mimetype,
      body: fs.createReadStream(file?.path as string),
    };

    const resp = await driveServices.files.create({
      requestBody: fileMetadata,
      media: media,
    });

    return resp.data.id;
  } catch (error) {
    console.log("error");
    console.log(error);
    return error;
  }
};

export const deleteFile = async (fileId: string) => {
  // driveServices.files.delete({});
  try {
    const resp = await driveServices.files.delete({
      fileId: fileId,
    });

    return resp;
  } catch (error) {
    console.log("error");
    console.log(error);
    return error;
  }
};

// type filtType =
//   | (Document<unknown, {}, IPost> &
//       Omit<
//         IPost & {
//           _id: Types.ObjectId;
//         },
//         never
//       >)
//   | null;

// export const filterUser = async (post: filtType) => {
//   const author = await UserModel.findById({ _id: post?.author });
//   const nPost: IPost | null = {
//     ...post?.toObject(),
//     author: author?.name,
//   };

//   return nPost;
// };
