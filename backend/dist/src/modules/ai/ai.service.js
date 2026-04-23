"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestToursForChatbot = exports.generateDescription = void 0;
const generative_ai_1 = require("@google/generative-ai");
require("dotenv/config");
const tour_model_1 = __importDefault(require("../tour/tour.model"));
const category_model_1 = __importDefault(require("../category/category.model"));
const city_model_1 = __importDefault(require("../city/city.model"));
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new generative_ai_1.GoogleGenerativeAI(apiKey) : null;
const modelName = "gemini-2.5-flash";
const chatbotTimeoutMs = Math.max(Number(process.env.AI_CHATBOT_TIMEOUT_MS || 15000), 3000);
const chatbotRetryCount = Math.min(Math.max(Number(process.env.AI_CHATBOT_RETRY_COUNT || 1), 0), 2);
const normalizeText = (value) => String(value || "").trim().toLowerCase();
const removeAccents = (value) => value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
const extractJsonObject = (raw) => {
    try {
        const directParsed = JSON.parse(raw);
        return directParsed;
    }
    catch (_error) {
        const start = raw.indexOf("{");
        const end = raw.lastIndexOf("}");
        if (start === -1 || end === -1 || end <= start) {
            return null;
        }
        const jsonCandidate = raw.slice(start, end + 1);
        try {
            const parsed = JSON.parse(jsonCandidate);
            return parsed;
        }
        catch (_nestedError) {
            return null;
        }
    }
};
const withTimeout = async (promise, timeoutMs, timeoutMessage) => {
    let timer = null;
    try {
        return await Promise.race([
            promise,
            new Promise((_, reject) => {
                timer = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
            }),
        ]);
    }
    finally {
        if (timer) {
            clearTimeout(timer);
        }
    }
};
const toCompactTour = (tour, categoryMap, cityMap) => {
    var _a;
    const locations = Array.isArray(tour.locations) ? tour.locations : [];
    const locationNames = locations
        .map((item) => {
        var _a;
        if (!item)
            return "";
        if (typeof item === "string") {
            return String(((_a = cityMap.get(item)) === null || _a === void 0 ? void 0 : _a.name) || "");
        }
        if (typeof item === "object") {
            return String(item.name || item.title || "");
        }
        return "";
    })
        .filter(Boolean);
    const categoryName = String(((_a = categoryMap.get(String(tour.category))) === null || _a === void 0 ? void 0 : _a.name) || "");
    return {
        id: String(tour._id),
        name: String(tour.name || ""),
        slug: String(tour.slug || ""),
        avatar: String(tour.avatar || ""),
        information: String(tour.information || ""),
        time: String(tour.time || ""),
        price: Number(tour.price || 0),
        priceNew: Number(tour.priceNew || 0),
        locationNames,
        categoryName,
    };
};
const fallbackSearchTours = (message, tours, maxItems) => {
    const normalizedMessage = removeAccents(normalizeText(message));
    const keywords = normalizedMessage
        .split(/\s+/)
        .map((item) => item.trim())
        .filter((item) => item.length >= 2);
    const scored = tours
        .map((tour) => {
        const searchable = removeAccents([tour.name, tour.information, tour.categoryName, tour.locationNames.join(" ")].join(" ").toLowerCase());
        const score = keywords.reduce((acc, keyword) => (searchable.includes(keyword) ? acc + 1 : acc), 0);
        return { tour, score };
    })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxItems);
    return scored.map((item) => ({
        ...item.tour,
        reason: `Phù hợp với nhu cầu bạn vừa nhập (${item.score} từ khóa trùng khớp).`,
    }));
};
const generateDescription = async (subject, context) => {
    if (!genAI)
        throw new Error("Hệ thống chưa được cấu hình GEMINI_API_KEY.");
    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = `Bạn là chuyên gia nội dung cho website du lịch.
Hãy viết một đoạn mô tả tiếng Việt tự nhiên, rõ ràng và hấp dẫn cho chủ đề: "${subject}"${context
        ? `.
Bối cảnh bổ sung: ${context}`
        : ""}.
Yêu cầu:
- Viết ngắn gọn khoảng 60-110 từ
- Tập trung vào mô tả, lợi ích hoặc điểm nổi bật của nội dung được yêu cầu
- Giữ giọng văn thân thiện, dễ hiểu, phù hợp cho trang quản trị nội dung
Lưu ý: chỉ trả về văn bản thuần, không markdown, không tiêu đề, không giải thích thêm.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().replace(/```/g, "").trim();
};
exports.generateDescription = generateDescription;
const suggestToursForChatbot = async (message, limit = 3) => {
    const sanitizedMessage = String(message || "").trim();
    const maxItems = Math.min(Math.max(Number(limit) || 3, 1), 5);
    const [rawTours, categories, cities] = await Promise.all([
        tour_model_1.default.find({ deleted: false, status: "active" }).sort({ rating: -1, createdAt: -1 }).limit(50),
        category_model_1.default.find({ deletedAt: { $exists: false }, status: "active" }),
        city_model_1.default.find({}),
    ]);
    const categoryMap = new Map(categories.map((item) => [String(item._id), item]));
    const cityMap = new Map(cities.map((item) => [String(item._id), item]));
    const tours = rawTours.map((tour) => toCompactTour(tour, categoryMap, cityMap));
    if (!genAI) {
        const fallbackSuggestions = fallbackSearchTours(sanitizedMessage, tours, maxItems);
        return {
            aiJson: {
                reply: fallbackSuggestions.length
                    ? "Mình gợi ý nhanh một vài tour phù hợp với nội dung bạn vừa nhập."
                    : "Hiện mình chưa tìm thấy tour phù hợp. Bạn thử mô tả rõ hơn về điểm đến, ngân sách hoặc thời gian nhé.",
                matches: fallbackSuggestions.map((item) => ({ slug: item.slug, name: item.name, reason: item.reason })),
            },
            suggestions: fallbackSuggestions,
        };
    }
    const model = genAI.getGenerativeModel({ model: modelName });
    const catalog = tours
        .map((tour) => `- slug: ${tour.slug}; name: ${tour.name}; category: ${tour.categoryName}; locations: ${tour.locationNames.join(", ")}; time: ${tour.time}; info: ${tour.information.slice(0, 180)}`)
        .join("\n");
    const prompt = `Bạn là trợ lý tư vấn tour du lịch cho website.
Người dùng nhập: "${sanitizedMessage}"

Danh sách tour hiện có:
${catalog}

Hãy trả về DUY NHẤT 1 JSON object hợp lệ, không markdown, không thêm text ngoài JSON.
Schema bắt buộc:
{
  "reply": "string tiếng Việt ngắn gọn",
  "matches": [
    { "slug": "string", "name": "string", "reason": "string ngắn" }
  ]
}

Quy tắc:
- Chọn tối đa ${maxItems} tour phù hợp nhất.
- "slug" phải đúng theo dữ liệu đã cho.
- Nếu chưa có tour phù hợp, trả mảng matches rỗng và giải thích nhẹ nhàng trong "reply".`;
    let aiRawText = "";
    for (let attempt = 0; attempt <= chatbotRetryCount; attempt += 1) {
        try {
            aiRawText = await withTimeout((async () => {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            })(), chatbotTimeoutMs, "Chatbot AI timeout");
            break;
        }
        catch (error) {
            if (attempt >= chatbotRetryCount) {
                console.error("[AI_CHATBOT] generateContent failed", {
                    attempt: attempt + 1,
                    message: sanitizedMessage.slice(0, 160),
                    error: error instanceof Error ? error.message : "unknown",
                });
            }
        }
    }
    let aiJson = extractJsonObject(aiRawText);
    if (!aiJson || typeof aiJson.reply !== "string" || !Array.isArray(aiJson.matches)) {
        aiJson = {
            reply: "Mình chưa đọc được phản hồi AI theo đúng định dạng JSON nên đang dùng gợi ý dự phòng.",
            matches: [],
        };
    }
    const mappedBySlug = new Map(tours.map((tour) => [tour.slug, tour]));
    const suggestions = [];
    for (const match of aiJson.matches.slice(0, maxItems)) {
        const rawSlug = String((match === null || match === void 0 ? void 0 : match.slug) || "").trim();
        const rawName = String((match === null || match === void 0 ? void 0 : match.name) || "").trim();
        const reason = String((match === null || match === void 0 ? void 0 : match.reason) || "Phù hợp với nhu cầu bạn vừa nhập.").trim();
        let selected = mappedBySlug.get(rawSlug);
        if (!selected && rawName) {
            const normalizedName = removeAccents(rawName.toLowerCase());
            selected = tours.find((tour) => removeAccents(tour.name.toLowerCase()).includes(normalizedName));
        }
        if (!selected)
            continue;
        if (suggestions.some((item) => item.slug === selected.slug))
            continue;
        suggestions.push({
            ...selected,
            reason,
        });
    }
    if (!suggestions.length) {
        const fallbackSuggestions = fallbackSearchTours(sanitizedMessage, tours, maxItems);
        return {
            aiJson,
            suggestions: fallbackSuggestions,
        };
    }
    return { aiJson, suggestions };
};
exports.suggestToursForChatbot = suggestToursForChatbot;
