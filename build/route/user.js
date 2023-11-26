"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = __importDefault(require("../models/user"));
const userRoute = (0, express_1.Router)();
userRoute.post("/create-user", (req, res) => {
    const { name, username, password } = req.body;
    new user_1.default({
        name,
        password,
        username,
        activityStatus: true,
        premissions: 2,
        avatar: "",
    })
        .save()
        .then((resp) => {
        return res.status(200).json({
            data: resp,
            success: true,
        });
    })
        .catch((error) => {
        return res.status(500).json({
            error: error,
            success: false,
        });
    });
});
exports.default = userRoute;
