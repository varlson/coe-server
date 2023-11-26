"use strict";
// import { userType } from "./../../types/types";
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
exports.chackRolePremission = exports.checkTokenValidation = exports.isTokenValid = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const token_sec = process.env.JWT_SEC;
const isTokenValid = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, token_sec);
        const { id } = decoded;
        if (id)
            return {
                success: true,
                id: id,
            };
        return { success: false, id: null };
    }
    catch (error) {
        return {
            success: false,
            error: error,
        };
    }
};
exports.isTokenValid = isTokenValid;
const checkTokenValidation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers["authorization"]) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (token) {
            try {
                const resp = (0, exports.isTokenValid)(token);
                if (resp.success) {
                    const { id } = resp;
                    const user = yield user_1.default.findById(id);
                    if (user) {
                        req.user = user;
                        return next();
                    }
                }
                return res.status(501).json({
                    success: false,
                    msg: "User not found",
                    error: resp,
                });
            }
            catch (error) {
                return res.status(501).json({
                    success: false,
                    msg: error,
                });
            }
        }
    }
    catch (error) { }
});
exports.checkTokenValidation = checkTokenValidation;
const chackRolePremission = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user && user.premissionRole == 1) {
        return next();
    }
    return res.status(501).json({
        success: false,
        msg: "Houve um erro interno",
    });
});
exports.chackRolePremission = chackRolePremission;
