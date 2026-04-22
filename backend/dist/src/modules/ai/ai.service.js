"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJournalContent = exports.generateTourSchedule = void 0;
const generative_ai_1 = require("@google/generative-ai");
require("dotenv/config");
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new generative_ai_1.GoogleGenerativeAI(apiKey) : null;
const generateTourSchedule = async (name, time) => {
    if (!genAI)
        throw new Error("Hệ thống chưa được cấu hình GEMINI_API_KEY.");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Bạn là một chuyên gia du lịch tài năng. Hãy lên lịch trình du lịch chi tiết cho một tour có tên "${name}" với thời gian "${time}". 
Yêu cầu trả về mảng JSON, mỗi phần tử đại diện cho 1 ngày, gồm 2 thuộc tính: "title" (ví dụ: "Ngày 1: Đón khách và tham quan") và "description" (mô tả chi tiết các hoạt động trong ngày, 3-4 câu). 
Lưu ý: TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON MẢNG (Array of Object), KHÔNG ĐƯỢC CHÈN THÊM BẤT KỲ VĂN BẢN NÀO KHÁC VÀ KHÔNG BỌC Ở TRONG QUOTE MARKDOWN \`\`\`json.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    // Parse JSON string safely
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    try {
        return JSON.parse(text);
    }
    catch (error) {
        console.error("AI Generate Error:", error, "Text:", text);
        throw new Error("Dữ liệu AI trả về không đúng định dạng JSON.");
    }
};
exports.generateTourSchedule = generateTourSchedule;
const generateJournalContent = async (title, category) => {
    if (!genAI)
        throw new Error("Hệ thống chưa được cấu hình GEMINI_API_KEY.");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Bạn là một Travel Blogger nổi tiếng. Hãy viết một bài blog du lịch chuẩn SEO cực kì hấp dẫn với tiêu đề: "${title}" (Chuyên mục: ${category}). 
Yêu cầu:
- Viết bằng định dạng HTML chuẩn (chỉ dùng các thẻ <h2>, <h3>, <p>, <ul>, <li>, <strong>). KHÔNG DÙNG THẺ <h1> HOẶC THẺ <html>/<head>/<body>.
- Nội dung dài khoảng 500-700 từ, có mở bài lôi cuốn, phần thân chia làm 3-4 mục rõ ràng mô tả cực kì sinh động những kinh nghiệm và trải nghiệm, và có cái kết gọi mời chia sẻ.
Lưu ý: Chỉ trả về trực tiếp đoạn mã HTML, không bọc trong thẻ định dạng markdown \`\`\`html.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```html/gi, "").replace(/```/g, "").trim();
    return text;
};
exports.generateJournalContent = generateJournalContent;
