"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.hardDeleteItem = exports.restoreItem = exports.getTrash = exports.deleteItem = exports.editPatch = exports.edit = exports.createPost = exports.list = void 0;
const journalService = __importStar(require("./journal.service"));
const async_handler_1 = require("../../utils/async-handler");
const response_1 = require("../../utils/response");
const error_middleware_1 = require("../../middlewares/error.middleware");
exports.list = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const data = await journalService.list(req);
    (0, response_1.sendSuccess)(res, "Lấy danh sách bài viết thành công!", data);
});
exports.createPost = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const result = await journalService.createPost(req);
    if (result.code === "error")
        throw new error_middleware_1.HttpError(400, result.message);
    (0, response_1.sendSuccess)(res, result.message, result, 201);
});
exports.edit = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const data = await journalService.edit(req);
    if (data.code === "error")
        throw new error_middleware_1.HttpError(404, data.message);
    (0, response_1.sendSuccess)(res, "Lấy chi tiết bài viết thành công!", data);
});
exports.editPatch = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const result = await journalService.editPatch(req);
    if (result.code === "error")
        throw new error_middleware_1.HttpError(400, result.message || "Đã có lỗi xảy ra");
    (0, response_1.sendSuccess)(res, result.message || "Cập nhật bài viết thành công!", result);
});
exports.deleteItem = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const data = await journalService.deleteItem(req);
    (0, response_1.sendSuccess)(res, "Đã đưa bài viết vào thùng rác!", data);
});
exports.getTrash = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const data = await journalService.getTrash(req);
    (0, response_1.sendSuccess)(res, "Lấy danh sách thùng rác thành công!", data);
});
exports.restoreItem = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const data = await journalService.restoreItem(req);
    (0, response_1.sendSuccess)(res, "Khôi phục bài viết thành công!", data);
});
exports.hardDeleteItem = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const data = await journalService.hardDeleteItem(req);
    (0, response_1.sendSuccess)(res, "Xóa vĩnh viễn bài viết thành công!", data);
});
