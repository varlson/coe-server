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
const route = (0, express_1.Router)();
const multer_1 = __importDefault(require("multer"));
const fileManager_1 = require("../middleware/fileManager");
const post_1 = __importDefault(require("../models/post"));
const types_1 = require("../types/types");
const util_1 = require("../util/util");
const multer_2 = require("../config/multer");
const upload = (0, multer_1.default)({ storage: multer_2.storage });
route.post("/posts", upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, body, author, postType } = req.body;
    const file = req.file;
    if (file) {
        const resp = yield (0, fileManager_1.uploadFile)(file);
        try {
            const newSlide = new post_1.default({
                title,
                body,
                img: "https://drive.google.com/uc?export=view&id=" + resp,
                author,
                postType,
            });
            yield newSlide.save();
            return res.status(200).json({
                newSlide,
                success: true,
            });
        }
        catch (error) {
            return res.status(501).json({
                error: error,
                success: false,
            });
        }
    }
    else {
        return res.status(501).json({
            data: "error",
            success: true,
        });
    }
}));
route.get("/slides", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slides = yield post_1.default.find({ postType: types_1.PostTypes.SLIDE });
        return res.status(200).json({
            msg: "",
            success: true,
            slides: slides,
        });
    }
    catch (error) {
        return res.status(501).json({
            success: false,
            msg: "Houve um erro interno",
            error: error,
        });
    }
}));
route.get("/posts", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slides = yield post_1.default.find({ postType: types_1.PostTypes.NEWS });
        const promises = slides.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            const converted = yield (0, util_1.documentToIpost)(item);
            return converted;
        }));
        return res.status(200).json({
            msg: "",
            success: true,
            slides: slides,
        });
    }
    catch (error) {
        return res.status(501).json({
            success: false,
            msg: "Houve um erro interno",
            error: error,
        });
    }
}));
// route.get("/posts/:id", async (req: Req, res: Res) => {
//   const { id } = req.params;
//   if (!id)
//     return res.status(404).json({
//       msg: "id do item não encontrado",
//       success: false,
//     });
//   try {
//     const post = await PostSchema.findById({ _id: id });
//     if (!post)
//       return res
//         .status(404)
//         .json({ success: false, msg: "O post não encontrado" });
//     return res.status(200).json({
//       msg: "",
//       success: true,
//       post: post,
//     });
//   } catch (error) {
//     return res.status(501).json({
//       success: false,
//       msg: "Houve um erro interno",
//       error: error,
//     });
//   }
// });
route.get("/delete-slide/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id)
        return res.status(501).json({
            msg: "id do objeto nao encontrado",
            success: false,
        });
    console.log("id", id);
    const resp = yield post_1.default.findOneAndDelete({ _id: id });
    if (resp) {
        const file = resp.img.split("=")[2];
        console.log("deleted file");
        console.log(file);
        yield (0, fileManager_1.deleteFile)(file);
        return res.status(200).json({
            data: resp,
            success: true,
            msg: "Item deletado com sucesso",
        });
    }
    return res.status(501).json({
        msg: "erro interno do servidor",
        success: false,
    });
}));
route.get("/", (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1];
    console.log("token");
    console.log(token);
    res.status(200).json({
        success: true,
        msg: "Hello world",
    });
});
route.post("/edit-post/:postId", upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    if (!postId) {
        return res.status(404).json({
            success: false,
            msg: "Post não encontrado",
        });
    }
    const existPost = yield post_1.default.findOne({ _id: postId });
    if (!existPost) {
        return res.status(404).json({
            msg: "Post não encontrado",
            success: false,
        });
    }
    const { title, body, userUpdateId, isSlide } = req.body;
    const file = req.file;
    var post = { title, body, userUpdateId, img: "" };
    if (file) {
        yield (0, fileManager_1.deleteFile)(existPost.img.split("=")[2]);
        const id = yield (0, fileManager_1.uploadFile)(file);
        const img = "https://drive.google.com/uc?export=view&id=" + id;
        post.img = img;
    }
    try {
        post_1.default.findOneAndUpdate({ _id: postId }, post)
            .then((success) => {
            console.log(success);
            return res.status(200).json({
                post: success,
                success: true,
                msg: "Post atualizado com sucesso",
            });
        })
            .catch((error) => {
            console.log(error);
            return res.status(501).json({
                error: error,
                success: false,
                msg: "Houve erro interno",
            });
        });
    }
    catch (error) {
        console.log(error);
        return res.status(501).json({
            error: error,
            success: false,
            msg: "Algo deu errado ",
        });
    }
}));
exports.default = route;
