"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.message = exports.mailjet = void 0;
const node_mailjet_1 = __importDefault(require("node-mailjet"));
exports.mailjet = new node_mailjet_1.default({
    apiKey: process.env.MAILJET_KEY,
    apiSecret: process.env.MAILJET_SECRET,
});
exports.message = {
    from: {
        name: "John Doe",
        email: "johndoe@example.com",
    },
    to: [
        {
            name: "Jane Doe",
            email: "janedoe@example.com",
        },
    ],
    subject: "Hello, world!",
    text: "This is a test email.",
    html: "<h1>Hello, world!</h1>",
};
