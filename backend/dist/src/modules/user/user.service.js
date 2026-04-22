"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchStatus = exports.list = void 0;
const account_model_1 = __importDefault(require("../auth/account.model"));
const error_middleware_1 = require("../../middlewares/error.middleware");
const list = async (req) => {
    const users = await account_model_1.default.find({ deleted: false })
        .select("-password -refreshTokenHash -refreshTokenJti")
        .sort({ createdAt: "desc" });
    return { userList: users };
};
exports.list = list;
const patchStatus = async (req) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!["active", "inactive"].includes(status)) {
        throw new error_middleware_1.HttpError(400, "Trạng thái không hợp lệ!");
    }
    const user = await account_model_1.default.findOneAndUpdate({ _id: id, deleted: false }, { $set: { status } }, { new: true }).select("-password -refreshTokenHash -refreshTokenJti");
    if (!user) {
        throw new error_middleware_1.HttpError(404, "Người dùng không tồn tại!");
    }
    return user;
};
exports.patchStatus = patchStatus;
