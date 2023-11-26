"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const fs_1 = __importDefault(require("fs"));
const googleapis_1 = require("googleapis");
const STORAGE_ID = "1Pd7dliz0UVQLhauoXR0qd5ymqdBphJlp";
const uploadFile = (file) => __awaiter(void 0, void 0, void 0, function* () {
    const auth = new googleapis_1.google.auth.GoogleAuth({
        keyFile: "./credentials.json",
        scopes: ["https://www.googleapis.com/auth/drive"],
    });
    const driveServices = googleapis_1.google.drive({
        version: "v3",
        auth,
    });
    const filename = file === null || file === void 0 ? void 0 : file.originalname;
    try {
        const fileMetadata = {
            name: filename,
            parents: [STORAGE_ID],
        };
        const media = {
            mimeType: file === null || file === void 0 ? void 0 : file.mimetype,
            body: fs_1.default.createReadStream(file === null || file === void 0 ? void 0 : file.path),
        };
        const resp = yield driveServices.files.create({
            requestBody: fileMetadata,
            media: media,
        });
    }
    catch (error) {
        console.log("error");
        console.log(error);
        return error;
    }
});
exports.uploadFile = uploadFile;
// export const deleteFile = async (fileLink: string) => {
//   const fileId = fileLink.split("=")[2];
//   try {
//     await driveServices.files.delete({ fileId });
//     console.info("File delete successfuly");
//     return true;
//   } catch (error) {
//     console.info("An error ocoured, file cant be deleted");
//     console.log(error);
//     return true;
//   }
// };
