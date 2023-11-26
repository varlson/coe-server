"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostTypes = exports.PremissionRoles = void 0;
var PremissionRoles;
(function (PremissionRoles) {
    PremissionRoles[PremissionRoles["SUPER_ADMIN"] = 0] = "SUPER_ADMIN";
    PremissionRoles[PremissionRoles["ADMIN"] = 1] = "ADMIN";
})(PremissionRoles = exports.PremissionRoles || (exports.PremissionRoles = {}));
var PostTypes;
(function (PostTypes) {
    PostTypes[PostTypes["SLIDE"] = 1] = "SLIDE";
    PostTypes[PostTypes["NEWS"] = 2] = "NEWS";
    PostTypes[PostTypes["NOTICE"] = 3] = "NOTICE";
})(PostTypes = exports.PostTypes || (exports.PostTypes = {}));
