"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuth = void 0;
const googleapis_1 = require("googleapis");
const STORAGE_ID = "1Pd7dliz0UVQLhauoXR0qd5ymqdBphJlp";
const googleAuth = () => {
    const auth = new googleapis_1.google.auth.GoogleAuth({
        keyFile: "./credentials.json",
        scopes: ["https://www.googleapis.com/auth/drive"],
    });
    const driveServices = googleapis_1.google.drive({
        version: "v3",
        auth,
    });
    return driveServices;
};
exports.googleAuth = googleAuth;
