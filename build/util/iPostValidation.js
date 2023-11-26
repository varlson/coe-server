"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpostValidarion = void 0;
const IpostValidarion = (post) => {
    const { title, body } = post;
    if (!title || !body)
        return { succes: false, msg: "Por favor, forneca os dados" };
    return { succes: true, msg: "" };
};
exports.IpostValidarion = IpostValidarion;
