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
exports.extractor = exports.tagBuilder = exports.getAuthorNames = exports.documentToIpost = exports.accessTokenGenerator = exports.credentialsVerifier = void 0;
// import { IPost } from "./../types/types";
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const types_1 = require("../types/types");
const user_1 = __importDefault(require("../models/user"));
const credentialsVerifier = (username, password) => {
};
exports.credentialsVerifier = credentialsVerifier;
const accessTokenGenerator = (user, expire_time = "120s") => __awaiter(void 0, void 0, void 0, function* () {
    const { username, _id } = user;
    const payload = { id: _id, username: username };
    const sec = process.env.JWT_SEC;
    console.log("env");
    console.log(sec);
    const accessToken = yield jsonwebtoken_1.default.sign(payload, sec, {
        expiresIn: expire_time,
    });
    return accessToken;
});
exports.accessTokenGenerator = accessTokenGenerator;
const documentToIpost = (post) => __awaiter(void 0, void 0, void 0, function* () {
    const auth = yield user_1.default.findById({ _id: post === null || post === void 0 ? void 0 : post.author });
    const _post = {
        title: (post === null || post === void 0 ? void 0 : post.title) || "",
        body: (post === null || post === void 0 ? void 0 : post.body) || "",
        createdAt: (post === null || post === void 0 ? void 0 : post.createdAt) || new Date(),
        updatedAt: (post === null || post === void 0 ? void 0 : post.updatedAt) || new Date(),
        author: auth === null || auth === void 0 ? void 0 : auth._id,
        img: (post === null || post === void 0 ? void 0 : post.img) || "",
        postType: (post === null || post === void 0 ? void 0 : post.postType) || types_1.PostTypes.SLIDE,
        _id: post === null || post === void 0 ? void 0 : post._id,
    };
    return _post;
});
exports.documentToIpost = documentToIpost;
const getAuthorNames = (posts) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedPosts = [];
    return new Promise((resolve, reject) => {
        posts.map((post) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield user_1.default.findOne({ _id: post.author });
            const tempPost = {
                _id: post._id,
                title: post.title,
                body: post.body,
                img: post.img,
                postType: post.postType,
                author: (user === null || user === void 0 ? void 0 : user.name) || "Unknown",
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
            };
            updatedPosts.push(tempPost);
        }));
        resolve(updatedPosts);
    });
});
exports.getAuthorNames = getAuthorNames;
const tagBuilder = (title, author, resume) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, exports.extractor)(title + " " + author + " " + resume);
    return res;
});
exports.tagBuilder = tagBuilder;
const extractor = (value) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const lower = value.toLocaleLowerCase();
        const signRemoved = lower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const nonSig = signRemoved.replace(/[,.!?]/g, "");
        const unique = Array.from(new Set(nonSig.split(" "))).filter((item) => item.length >= 4);
        resolve(unique);
    });
});
exports.extractor = extractor;
