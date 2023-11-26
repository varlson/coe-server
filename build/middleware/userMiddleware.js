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
exports.checkUser = void 0;
const user_1 = __importDefault(require("../models/user"));
const checkUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const existUser = yield user_1.default.findOne({ username: username });
        if (existUser) {
            if (!(existUser === null || existUser === void 0 ? void 0 : existUser.activityStatus)) {
                return res.status(403).json({
                    msg: "Usuário desabilitado, contacte Admin",
                    success: false,
                });
            }
            req.user = existUser;
            return next();
        }
        return res.status(404).json({
            success: false,
            msg: "Usuário não encontrado",
        });
    }
    catch (error) {
        return res.status(501).json({
            success: false,
            msg: error.message || "Usuário não encontrado",
            error: error,
        });
    }
});
exports.checkUser = checkUser;
