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
// import { IPost, PostTypes } from "./../types/types";
const express_1 = require("express");
const noticeRouter = (0, express_1.Router)();
const post_1 = __importDefault(require("../models/post"));
const types_1 = require("../types/types");
const iPostValidation_1 = require("../util/iPostValidation");
const multer_1 = __importDefault(require("multer"));
const multer_2 = require("../config/multer");
const fileManager_1 = require("../middleware/fileManager");
const upload = (0, multer_1.default)({ storage: multer_2.storage });
// LISTAR EDITAIS
noticeRouter.get("/", (req, res) => {
    try {
        post_1.default.find({ postType: types_1.PostTypes.NOTICE })
            .then((notices) => {
            if (notices.length)
                return res.status(200).json({
                    success: true,
                    notices: notices,
                });
            return res.status(200).json({
                msg: "Ainda não foram adicionados editais",
                success: true,
            });
        })
            .catch((error) => {
            return res.status(200).json({
                success: false,
                error: error,
                msg: "Algo deu errado",
            });
        });
    }
    catch (error) {
        return res.status(200).json({
            success: false,
            error: error,
            msg: "Ocorreu um erro interno",
        });
    }
});
// CRIAR EDITAIS
noticeRouter.post("/create-notice", upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, body, postType, author } = req.body;
    console.log(title, body, postType, author);
    const notice = { title, body, postType, author, img: "" };
    // const notice = req.body.notice as IPost;
    const validation = (0, iPostValidation_1.IpostValidarion)(notice);
    if (!req.file || !validation.succes) {
        return res.status(404).json({
            success: false,
            msg: validation.msg || "O arquivo não encontrado",
        });
    }
    try {
        const id = yield (0, fileManager_1.uploadFile)(req.file);
        const link = process.env.GOOGLE_LINK + id;
        notice.img = link;
        const newNotice = new post_1.default(notice);
        yield newNotice.save();
        return res.status(200).json({
            success: true,
            msg: "Edital salvo com sucesso",
        });
    }
    catch (error) {
        return res.status(200).json({
            success: false,
            msg: "Houve um erro interno",
            error: error,
        });
    }
}));
// LISTAR UM EDITAL
noticeRouter.get("/:id", (req, res) => {
    const { id } = req.params;
    if (!id)
        return res.status(404).json({
            success: false,
            msg: "Id do post não encontrado",
        });
    post_1.default.findOne({ _id: id })
        .then((notice) => {
        return res.status(200).json({
            success: true,
            msg: "Edital encontrado com successo",
            notice: notice,
        });
    })
        .catch((error) => {
        return res.status(501).json({
            success: false,
            msg: "Id do post não encontrado",
            error: error,
        });
    });
});
// DELETAR UM EDITAL
noticeRouter.get("/delete/:id", (req, res) => {
    const { id } = req.params;
    if (!id)
        return res.status(404).json({
            success: false,
            msg: "Id do post não encontrado",
        });
    post_1.default.findOneAndDelete({ _id: id })
        .then((success) => __awaiter(void 0, void 0, void 0, function* () {
        if (!success) {
            return res.status(200).json({
                success: false,
                msg: "Editar não encontrado",
            });
        }
        yield (0, fileManager_1.deleteFile)(success.img.split("=")[2]);
        return res.status(200).json({
            success: true,
            msg: "Editar deletado com successo",
        });
    }))
        .catch((error) => {
        return res.status(501).json({
            success: false,
            msg: "Houve um erro, post não pode ser apagado",
            error: error,
        });
    });
});
// EDITAR UM EDITAL
noticeRouter.post("/update/:id", upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id)
        return res.status(404).json({
            success: false,
            msg: "Id de post não encontrado",
        });
    const existedPost = yield post_1.default.findOne({ _id: id });
    if (!existedPost)
        return res.status(404).json({
            success: false,
            msg: "Post não encontrado",
        });
    const file = req.file;
    const { title, body, edit_by } = req.body;
    const notice = {
        title,
        edit_by,
        body,
        img: existedPost.img,
    };
    if (file) {
        (0, fileManager_1.deleteFile)(existedPost.img.split("=")[2]);
        const id = yield (0, fileManager_1.uploadFile)(file);
        notice.img = process.env.GOOGLE_LINK + id;
    }
    post_1.default.findOneAndUpdate({ _id: id }, notice)
        .then((update) => {
        if (update)
            return res.status(200).json({
                success: true,
                msg: "Edital atualizado com successo",
            });
        return res.status(501).json({
            success: false,
            msg: "Houve um erro interno, edital não pode ser atualizado",
        });
    })
        .catch((error) => {
        return res.status(501).json({
            success: false,
            msg: "Houve um erro interno, edital não pode ser atualizado",
            error: error,
        });
    });
}));
exports.default = noticeRouter;
