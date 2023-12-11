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
const postRoutes = (0, express_1.Router)();
//CREATE POST
postRoutes.post("/create", upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, body, author, postType, noticeNumber, resumo } = req.body;
    const file = req.file;
    const postContent = { title, body, author, postType, resumo };
    if (postType == types_1.PostTypes.NOTICE) {
        postContent.noticeNumber = noticeNumber;
    }
    if (file) {
        const resp = yield (0, fileManager_1.uploadFile)(file);
        postContent.img = "https://drive.google.com/uc?export=view&id=" + resp;
        try {
            const newSlide = new post_1.default(postContent);
            yield newSlide.save();
            return res.status(200).json({
                content: newSlide,
                success: true,
                msg: "Post criado com sucesso",
            });
        }
        catch (error) {
            return res.status(501).json({
                error: error,
                success: false,
                msg: (error === null || error === void 0 ? void 0 : error.message) ||
                    "Houve um erro interno, post nnão pode ser criado",
            });
        }
    }
    else {
        return res.status(501).json({
            data: "error",
            success: false,
            msg: "A imagem não foi enviada",
        });
    }
}));
//EDIT POST
postRoutes.post("/update/:id", upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id)
        return res.status(404).json({
            success: false,
            msg: "O item não encontrado",
        });
    const existedPost = yield post_1.default.findOne({ _id: id });
    if (!existedPost)
        return res.status(404).json({
            success: false,
            msg: "O item não encontrado",
        });
    const { title, body, edit_by, postType, resumo } = req.body;
    // console.log({ title, body, edit_by, postType });
    const post = { title, body, edit_by, postType, resumo };
    const file = req.file;
    if (file) {
        const resp = yield (0, fileManager_1.uploadFile)(file);
        yield (0, fileManager_1.deleteFile)(existedPost.img.split("=")[2]);
        post.img = "https://drive.google.com/uc?export=view&id=" + resp;
    }
    try {
        post_1.default.findOneAndUpdate({ _id: id }, post)
            .then((success) => {
            if (!success) {
                return res.status(502).json({
                    success: false,
                    msg: "Erro interno de servidor!",
                    post: success,
                });
            }
            return res.status(200).json({
                success: true,
                msg: "Item atualizado com sucesso!",
                post: success,
            });
        })
            .catch((error) => {
            return res.status(200).json({
                success: false,
                msg: "Ocorreu um erro interno",
                error: error,
            });
        });
    }
    catch (error) {
        return res.status(501).json({
            error: error,
            success: false,
            msg: (error === null || error === void 0 ? void 0 : error.message) || "Houve um erro interno, post nnão pode ser criado",
        });
    }
}));
//DELETE POST
postRoutes.get("/delete/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id)
        return res.status(501).json({
            msg: "id do objeto nao encontrado",
            success: false,
        });
    const resp = yield post_1.default.findOneAndDelete({ _id: id });
    if (resp) {
        const file = resp.img.split("=")[2];
        yield (0, fileManager_1.deleteFile)(file);
        return res.status(200).json({
            data: resp,
            success: true,
            msg: "Item deletado com sucesso",
        });
    }
    return res.status(501).json({
        msg: "erro interno do servidor, item não pode ser apagado",
        success: false,
    });
}));
postRoutes.get("/:postId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    if (!postId)
        return res.status(404).json({
            success: false,
            msg: "Id do item não encontrado",
        });
    try {
        const post = yield post_1.default.findOne({ _id: postId });
        if (!post)
            return res.status(404).json({
                success: false,
                msg: "Post não encontrado",
            });
        return res.status(200).json({
            success: true,
            post: post,
            msg: "Post encontrado com successo!",
        });
    }
    catch (error) {
        return res.status(501).json({
            success: false,
            msg: error.name == "CastError"
                ? "Post não encontrado"
                : "Post encontrado com successo!",
        });
    }
}));
//LIST POSTS
postRoutes.get("/lists/:postType/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postType } = req.params;
    try {
        const posts = yield post_1.default.find({ postType: parseInt(postType) });
        if (!posts) {
            return res.status(501).json({
                success: false,
                msg: "Houve um erro interno",
                posts: posts,
            });
        }
        return res.status(200).json({
            msg: "",
            success: true,
            posts: posts,
        });
    }
    catch (error) {
        return res.status(501).json({
            success: false,
            msg: "Houve um erro interno de servidor",
            error: error,
        });
    }
}));
postRoutes.post("/search", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.body.query;
    const searchParams = yield (0, util_1.tagBuilder)(query, "", "");
    try {
        const results = yield post_1.default.find({ tags: { $in: searchParams } });
        return res.status(200).json({
            success: true,
            msg: "",
            posts: results,
        });
    }
    catch (error) {
        return res.status(501).json({
            success: false,
            msg: "",
            error: error,
        });
    }
}));
exports.default = postRoutes;
