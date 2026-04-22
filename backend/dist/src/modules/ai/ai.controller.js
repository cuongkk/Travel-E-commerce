"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateContent = void 0;
const error_middleware_1 = require("../../middlewares/error.middleware");
const ai_service_1 = require("./ai.service");
const generateContent = async (req, res) => {
    const { type, name, time, title, category } = req.body;
    try {
        if (type === "tour-schedule") {
            if (!name || !time) {
                throw new error_middleware_1.HttpError(400, "Vui lòng cung cấp tên tour (name) và thời gian (time).");
            }
            const schedule = await (0, ai_service_1.generateTourSchedule)(name, time);
            res.status(200).json({ code: "success", data: schedule, message: "Sinh lịch trình bằng AI thành công!" });
        }
        else if (type === "journal-content") {
            if (!title || !category) {
                throw new error_middleware_1.HttpError(400, "Vui lòng cung cấp tiêu đề (title) và chuyên mục (category).");
            }
            const htmlContent = await (0, ai_service_1.generateJournalContent)(title, category);
            res.status(200).json({ code: "success", data: htmlContent, message: "Sinh bài viết SEO bằng AI thành công!" });
        }
        else {
            throw new error_middleware_1.HttpError(400, "Loại nội dung (type) không hợp lệ.");
        }
    }
    catch (error) {
        res.status(error.status || 500).json({ code: "error", message: error.message || "Lỗi khi gọi AI API" });
    }
};
exports.generateContent = generateContent;
