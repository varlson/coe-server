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
const bcrypt_1 = __importDefault(require("bcrypt"));
const express_1 = require("express");
const user_1 = __importDefault(require("../models/user"));
const util_1 = require("../util/util");
const loginRoute = (0, express_1.Router)();
loginRoute.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    console.log("username, password");
    console.log(username, password);
    const existUser = yield user_1.default.findOne({ username: username });
    if (existUser) {
        if (!(existUser === null || existUser === void 0 ? void 0 : existUser.activityStatus)) {
            return res.status(403).json({
                msg: "Usuário desabilitado, contacte Admin",
                success: false,
            });
        }
        bcrypt_1.default.compare(password, existUser.password, (error, result) => __awaiter(void 0, void 0, void 0, function* () {
            if (error) {
                return res.status(401).json({
                    success: false,
                    msg: "Um erro interno ocorreu, por favor tente mais tarde!",
                    error: "Um erro interno ocorreu, por favor tente mais tarde!",
                });
            }
            if (result) {
                const accessToken = yield (0, util_1.accessTokenGenerator)(existUser);
                // console.log(accessToken);
                return res.status(200).json({
                    success: true,
                    user: {
                        accessToken: accessToken,
                        id: existUser._id,
                        username: existUser.username,
                        name: existUser.name,
                    },
                });
            }
            return res.status(401).json({
                success: false,
                msg: "Senha incorreta",
                error: "Senha incorreta",
            });
        }));
    }
    else {
        return res.status(404).json({
            success: false,
            msg: "Usuario não encontrado!",
            error: "Usuario não encontrado!",
        });
    }
}));
exports.default = loginRoute;
