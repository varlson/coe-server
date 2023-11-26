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
const express_1 = require("express");
const slide_1 = __importDefault(require("../models/slide"));
const route = (0, express_1.Router)();
const STORAGE_ID = "1Pd7dliz0UVQLhauoXR0qd5ymqdBphJlp";
const multer_1 = __importDefault(require("multer"));
const file_1 = require("../middleware/file");
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
route.post("/slide", upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, body } = req.body;
    const file = req.file;
    if (file) {
        const resp = (yield (0, file_1.uploadFile)(file));
        const newSlide = new slide_1.default({
            title,
            body,
            img: "https://drive.google.com/uc?export=view&id=" + resp,
        });
        yield newSlide.save();
        return res.status(200).json({
            resp,
        });
    }
    else {
        return res.status(200).json({
            data: "error",
        });
    }
}));
route.post("/edit-slide", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    if (!id) {
        return res.status(501).json({ id: id, msg: "something is wrong" });
    }
    const resp = yield (0, file_1.deleteFile)(id);
    return res.status(200).json({
        msg: "File deleted successfuly",
    });
}));
exports.default = route;
