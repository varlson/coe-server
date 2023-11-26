"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.htmlGenerator = void 0;
const htmlGenerator = (link) => {
    const html = `
  <div style="display: grid;">
    
  <p style=" text-align: center; margin: 40px 0" >Você solicitou recentemente a redefinição da senha</p>
  <a style=" color: white; text-decoration: none;border-radius:10px; text-align: center; background-color: red; padding: 10px 10px;" href="${link}">Redefina a senha</a>

    <p>Se você não solicitou a redefinição da senha, ingore esse email</p>
  </div>
    `;
    return html;
};
exports.htmlGenerator = htmlGenerator;
