"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatTours = exports.generateContent = void 0;
const error_middleware_1 = require("../../middlewares/error.middleware");
const ai_service_1 = require("./ai.service");
const generateContent = async (req, res) => {
    const { type, subject, context, name, title, category, parentName } = req.body;
    try {
        if (type !== "generate-description") {
            throw new error_middleware_1.HttpError(400, "Loại nội dung (type) không hợp lệ.");
        }
        const resolvedSubject = String(subject || name || title || "").trim();
        const resolvedContext = String(context || category || parentName || "").trim();
        if (!resolvedSubject) {
            throw new error_middleware_1.HttpError(400, "Vui lòng cung cấp subject để sinh mô tả.");
        }
        const description = await (0, ai_service_1.generateDescription)(resolvedSubject, resolvedContext || undefined);
        res.status(200).json({ code: "success", data: description, message: "Sinh mô tả bằng AI thành công!" });
    }
    catch (error) {
        res.status(error.status || 500).json({ code: "error", message: error.message || "Lỗi khi gọi AI API" });
    }
};
exports.generateContent = generateContent;
const chatTours = async (req, res) => {
    const { message, limit } = req.body || {};
    try {
        const sanitizedMessage = String(message || "").trim();
        if (!sanitizedMessage) {
            throw new error_middleware_1.HttpError(400, "Vui lòng nhập nội dung để chatbot tư vấn tour.");
        }
        if (sanitizedMessage.length > 1000) {
            throw new error_middleware_1.HttpError(400, "Nội dung quá dài. Vui lòng nhập tối đa 1000 ký tự.");
        }
        const result = await (0, ai_service_1.suggestToursForChatbot)(sanitizedMessage, Number(limit) || 3);
        res.status(200).json({
            success: true,
            message: "Chatbot đã tư vấn tour thành công.",
            data: result,
        });
    }
    catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: error.message || "Không thể xử lý yêu cầu chatbot lúc này.",
        });
    }
};
exports.chatTours = chatTours;
