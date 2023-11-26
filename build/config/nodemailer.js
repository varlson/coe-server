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
exports.run_mailer = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// import nodemailer from "nodemailer";
const nodemailer_config_1 = require("./nodemailer_config");
const transporter = nodemailer_1.default.createTransport({
    host: nodemailer_config_1.NODEMAIL_CONFIG.host,
    port: nodemailer_config_1.NODEMAIL_CONFIG.port,
    secure: true,
    auth: {
        user: nodemailer_config_1.NODEMAIL_CONFIG.user,
        pass: nodemailer_config_1.NODEMAIL_CONFIG.pass,
    },
    tls: {
        rejectUnauthorized: false,
    },
});
const run_mailer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mailSent = yield transporter.sendMail({
            text: "Texto do E-mail",
            subject: "Assunto do e-mail",
            from: "Dev Varlson <varelanhaterra@gmail.com>",
            to: ["dev.varlson@gmail.com"],
            html: `
            <html>
            <body>
            <strong>Conteúdo HTML</strong></br>Do E-mail
            </body>
            </html> 
            `,
        });
        console.log(mailSent);
    }
    catch (error) {
        console.log(error);
    }
});
exports.run_mailer = run_mailer;
