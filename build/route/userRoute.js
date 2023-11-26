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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const util_1 = require("../util/util");
const isAuhtenticated_1 = require("../middleware/isAuhtenticated");
const mailjet_1 = require("../config/mailjet");
const htmlPart_1 = require("../static/htmlPart");
// import { htmlGenerator } from "../static/htmlPart";
const userRoute = (0, express_1.Router)();
userRoute.post("/create-user", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, username, password, premissionRole } = req.body;
    const existUser = yield user_1.default.findOne({ username: username });
    if (existUser) {
        return res.status(400).json({
            success: false,
            msg: "Já existe usuario com este email",
        });
    }
    try {
        bcrypt_1.default.genSalt(10).then((salt) => {
            bcrypt_1.default
                .hash(password, salt)
                .then((hashed) => {
                new user_1.default({
                    name,
                    password: hashed,
                    username,
                    activityStatus: true,
                    premissionRole: premissionRole,
                    avatar: "",
                    passRecovery: "",
                })
                    .save()
                    .then((resp) => {
                    return res.status(200).json({
                        data: resp,
                        success: true,
                        msg: "Usuário criado com sucesso",
                    });
                })
                    .catch((error) => {
                    return res.status(500).json({
                        error: error,
                        success: false,
                    });
                });
            })
                .catch((error) => {
                return res.status(500).json({
                    error: error,
                    success: false,
                });
            });
        });
    }
    catch (error) { }
}));
userRoute.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    // console.log("received");
    // console.log(username, password);
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
                    accessToken: accessToken,
                    id: existUser._id,
                    username: existUser.username,
                    name: existUser.name,
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
userRoute.get("/me", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers["authorization"];
        const token_sec = process.env.JWT_SEC;
        if (authHeader) {
            const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1];
            if (token) {
                const payload = (yield jsonwebtoken_1.default.verify(token, token_sec));
                const id = payload === null || payload === void 0 ? void 0 : payload.id;
                if (!id) {
                    return res
                        .status(404)
                        .json({ success: false, msg: "token invalido" });
                }
                const user = (yield user_1.default.findById({ _id: id }));
                if (!user) {
                    return res
                        .status(404)
                        .json({ success: false, msg: "Usuario  não encontrado" });
                }
                return res.status(200).json({
                    msg: "autorizado",
                    success: true,
                    user: {
                        username: user.username,
                        name: user.name,
                        avatar: user.avatar,
                        _id: user._id,
                        premissionRole: user.premissionRole,
                    },
                });
            }
            else {
                return res.status(401).json({ success: false, msg: "something wrong" });
            }
        }
        else {
            return res.status(401).json({ success: false, msg: "something wrong" });
        }
    }
    catch (error) {
        return res.status(401).json({ success: false, msg: error });
    }
}));
userRoute.get("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_1.default.find({}, { password: 0 });
    res.status(200).json({
        success: true,
        users: users,
    });
}));
userRoute.post("/update-user", (req, res) => {
    const { user } = req.body;
    const _a = user, { _id } = _a, _user = __rest(_a, ["_id"]);
    try {
        user_1.default.findOneAndUpdate({ username: _user.username }, _user)
            .then((success) => {
            return res.status(200).json({
                success: true,
                user: success,
            });
        })
            .catch((error) => {
            if (error) {
                return res.status(501).json({
                    msg: "Houve um erro",
                    erro: error,
                    success: false,
                });
            }
        });
    }
    catch (error) {
        if (error) {
            return res.status(501).json({
                msg: "Houve um erro",
                erro: error,
                success: false,
            });
        }
    }
});
userRoute.get("/delete-user/:id", (req, res) => {
    const { id } = req.params;
    if (!id)
        return res
            .status(404)
            .json({ success: false, msg: "Forneça id do usuario" });
    user_1.default.findOneAndDelete({ _id: id })
        .then((success) => {
        if (success) {
            return res.status(200).json({
                msg: "Usuario Deletado com successo",
                success: true,
                user: success,
            });
        }
        return res.status(501).json({
            msg: "Usuario não existe",
            success: false,
        });
    })
        .catch((error) => {
        return res.status(501).json({
            msg: "Houve um erro interno",
            success: false,
            error: error,
        });
    });
});
userRoute.post("/reset-password", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { dest_email } = req.body;
    if (!dest_email) {
        return res.status(404).json({
            success: false,
            msg: "Usuario não encontrado",
        });
    }
    user_1.default.findOne({ username: dest_email })
        .then((user) => __awaiter(void 0, void 0, void 0, function* () {
        if (!user) {
            if (!(user === null || user === void 0 ? void 0 : user.activityStatus)) {
                return res.status(502).json({
                    success: false,
                    msg: "Usuario não encontrado",
                });
            }
        }
        if (!(user === null || user === void 0 ? void 0 : user.activityStatus)) {
            return res.status(502).json({
                success: false,
                msg: "Usuario desabilitado, favor contacte administrador",
            });
        }
        const token = yield (0, util_1.accessTokenGenerator)(user, 60);
        const link = `http://localhost:3000/password-recovery/${user._id}`;
        const html = (0, htmlPart_1.htmlGenerator)(link);
        user.passRecovery = token;
        yield (user === null || user === void 0 ? void 0 : user.save());
        const request = mailjet_1.mailjet.post("send", { version: "v3.1" }).request({
            Messages: [
                {
                    From: {
                        Email: process.env.FROM_EMAIL,
                        Name: "não-responda",
                    },
                    To: [
                        {
                            Email: dest_email,
                            Name: user === null || user === void 0 ? void 0 : user.name,
                        },
                    ],
                    Subject: "Recuperação de Senha",
                    TextPart: "Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
                    HTMLPart: html,
                },
            ],
        });
        request
            .then((result) => {
            // console.log(result.body);
            return res.status(200).json({
                msg: "Um link de recuperação foi enviado para seu email",
                resp: result.body,
                success: true,
            });
        })
            .catch((err) => {
            // console.log(err);
            return res.status(501).json({
                msg: "Houve um erro interno",
                error: err,
                success: false,
            });
        });
    }))
        .catch((error) => {
        return res.status(501).json({
            msg: "Houve um erro interno",
            error: error,
            success: false,
        });
    });
}));
userRoute.get("/set-password/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id)
        return res.status(404).json({
            success: false,
            msg: "Id do usuário não foi encontrado",
        });
    user_1.default.findOne({ _id: id })
        .then((user) => __awaiter(void 0, void 0, void 0, function* () {
        // return res.status(200).json({
        //   user: user,
        //   msg: "deu certo",
        //   success: true,
        // });
        if (!user)
            return res.status(404).json({
                success: false,
                msg: "Usuário não encontrado",
            });
        if (!user.passRecovery) {
            return res.status(404).json({
                success: false,
                msg: "O link para resetar senha expirou",
            });
        }
        const resp = (0, isAuhtenticated_1.isTokenValid)(user === null || user === void 0 ? void 0 : user.passRecovery);
        if (resp.success) {
            // user?.passRecovery = "";
            // await user?.save();
            return res.status(200).json({
                success: true,
                msg: "token válido",
                token: user.passRecovery,
            });
        }
        // user?.passRecovery = "";
        // await user?.save();
        return res.status(502).json({
            success: false,
            msg: resp.error || "Houve um erro interno",
        });
    }))
        .catch((error) => {
        return res.status(502).json({
            success: false,
            error: error || "Houve um erro interno",
        });
    });
}));
userRoute.post("/set-password/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { newPassword, token } = req.body;
    if (!newPassword || !token) {
        return res.status(404).json({
            success: false,
            msg: "Os dados nao encontrado",
            error: "Os dados nao encontrado",
        });
    }
    console.log(newPassword, token);
    const resp = (0, isAuhtenticated_1.isTokenValid)(token);
    if (!resp.success) {
        return res.status(403).json({
            error: resp.error || "Link inválido",
        });
    }
    try {
        const user = yield user_1.default.findOne({ passRecovery: token });
        if (user) {
            try {
                const salt = yield bcrypt_1.default.genSalt(10);
                const hashed = yield bcrypt_1.default.hash(newPassword, salt);
                user.password = hashed;
                user.passRecovery = "";
                yield user.save();
                return res.status(200).json({
                    success: true,
                    msg: "Senha alterada com sucesso",
                    token: token,
                });
            }
            catch (error) {
                console.log("error catch");
                return res.status(200).json({
                    success: false,
                    msg: "Um erro inesperado aconteceu",
                    error: error,
                });
            }
        }
        return res.status(404).json({
            success: false,
            msg: "Usuário não encontrado",
        });
    }
    catch (error) {
        return res.status(404).json({
            success: false,
            msg: "Usuário não encontrado",
        });
    }
}));
userRoute.get("/user/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id)
        return res.status(404).json({
            success: false,
            msg: "O ID de usuário não foi fornecido",
        });
    try {
        const user = yield user_1.default.findOne({ _id: id }, "-password");
        if (!user)
            return res.status(404).json({
                success: false,
                msg: "Usuário não encontrado",
            });
        return res.status(200).json({
            success: true,
            msg: "Usuário encontrado com sucesso!",
            user: user,
        });
    }
    catch (error) {
        return res.status(501).json({
            success: false,
            msg: error.message || "Houve um erro interno!",
            error: error,
        });
    }
}));
userRoute.post("/update-me/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _user } = req.body;
    const user = _user;
    if (!user)
        return res.status(404).json({
            success: false,
            msg: "Os dados não foram informados",
        });
}));
exports.default = userRoute;
