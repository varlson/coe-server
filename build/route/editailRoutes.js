"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const editalRouter = (0, express_1.Router)();
const post_1 = __importDefault(require("../models/post"));
// LISTAR EDITAIS
editalRouter.get("/notices", (req, res) => {
    try {
        post_1.default.find()
            .then((notices) => {
            return res.status(200).json({
                success: true,
                notices: notices,
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
editalRouter.post("/create-notice", (req, res) => {
    const notice = req.body.notice;
});
// LISTAR UM EDITAL
editalRouter.get("/notice/:id", (req, res) => { });
// DELETAR UM EDITAL
editalRouter.get("/delete-notice/:id", (req, res) => { });
// EDITAR UM EDITAL
editalRouter.post("/update-notice/:id", (req, res) => { });
exports.default = editalRouter;
