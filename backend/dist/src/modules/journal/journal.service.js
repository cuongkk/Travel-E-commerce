"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editPatch = exports.hardDeleteItem = exports.restoreItem = exports.getTrash = exports.deleteItem = exports.edit = exports.createPost = exports.list = void 0;
const journal_model_1 = __importDefault(require("./journal.model"));
const normalizeStatus = (value) => {
    return String(value || "active") === "inactive" ? "inactive" : "active";
};
const normalizeTrendingScore = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0)
        return 0;
    return parsed;
};
const list = async (_req) => {
    const journalList = await journal_model_1.default.find({ deleted: false }).sort({ createdAt: -1 });
    return { journalList };
};
exports.list = list;
const createPost = async (req) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const anyReq = req;
    const payload = {
        title: String(((_a = anyReq.body) === null || _a === void 0 ? void 0 : _a.title) || "").trim(),
        summary: String(((_b = anyReq.body) === null || _b === void 0 ? void 0 : _b.summary) || "").trim(),
        tag: String(((_c = anyReq.body) === null || _c === void 0 ? void 0 : _c.tag) || "").trim(),
        author: String(((_d = anyReq.body) === null || _d === void 0 ? void 0 : _d.author) || "").trim(),
        dateLabel: String(((_e = anyReq.body) === null || _e === void 0 ? void 0 : _e.dateLabel) || "").trim(),
        image: String(((_f = anyReq.body) === null || _f === void 0 ? void 0 : _f.image) || "").trim(),
        avatar: String(((_g = anyReq.body) === null || _g === void 0 ? void 0 : _g.avatar) || "").trim(),
        trendingScore: normalizeTrendingScore((_h = anyReq.body) === null || _h === void 0 ? void 0 : _h.trendingScore),
        status: normalizeStatus((_j = anyReq.body) === null || _j === void 0 ? void 0 : _j.status),
    };
    if (!payload.title || !payload.summary || !payload.tag || !payload.author || !payload.dateLabel || !payload.image || !payload.avatar) {
        return {
            code: "error",
            message: "Thiếu thông tin bắt buộc của journal!",
        };
    }
    const record = new journal_model_1.default(payload);
    await record.save();
    return {
        code: "success",
        message: "Tạo journal thành công!",
    };
};
exports.createPost = createPost;
const edit = async (req) => {
    const { id } = req.params;
    const journalDetail = await journal_model_1.default.findOne({ _id: id, deleted: false });
    if (!journalDetail) {
        return {
            code: "error",
            message: "Journal không tồn tại!",
        };
    }
    return { journalDetail };
};
exports.edit = edit;
const deleteItem = async (req) => {
    const { id } = req.params;
    const deletedItem = await journal_model_1.default.findByIdAndUpdate(id, { deleted: true, deletedAt: new Date() }, { new: true });
    if (!deletedItem) {
        throw new Error("Journal không tồn tại!");
    }
    return { deletedJournal: deletedItem };
};
exports.deleteItem = deleteItem;
const getTrash = async (_req) => {
    const journalList = await journal_model_1.default.find({ deleted: true }).sort({ deletedAt: -1 });
    return { journalList };
};
exports.getTrash = getTrash;
const restoreItem = async (req) => {
    const { id } = req.params;
    const restoredItem = await journal_model_1.default.findByIdAndUpdate(id, { deleted: false, deletedAt: null }, { new: true });
    if (!restoredItem) {
        throw new Error("Journal không tồn tại trong thùng rác!");
    }
    return { restoredJournal: restoredItem };
};
exports.restoreItem = restoreItem;
const hardDeleteItem = async (req) => {
    const { id } = req.params;
    const deletedItem = await journal_model_1.default.findByIdAndDelete(id);
    if (!deletedItem) {
        throw new Error("Journal không tồn tại!");
    }
    return { deletedJournal: deletedItem };
};
exports.hardDeleteItem = hardDeleteItem;
const editPatch = async (req) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const { id } = req.params;
    const anyReq = req;
    const journalDetail = await journal_model_1.default.findOne({ _id: id, deleted: false });
    if (!journalDetail) {
        return {
            code: "error",
            message: "Journal không tồn tại!",
        };
    }
    const payload = {
        title: String(((_a = anyReq.body) === null || _a === void 0 ? void 0 : _a.title) || "").trim(),
        summary: String(((_b = anyReq.body) === null || _b === void 0 ? void 0 : _b.summary) || "").trim(),
        tag: String(((_c = anyReq.body) === null || _c === void 0 ? void 0 : _c.tag) || "").trim(),
        author: String(((_d = anyReq.body) === null || _d === void 0 ? void 0 : _d.author) || "").trim(),
        dateLabel: String(((_e = anyReq.body) === null || _e === void 0 ? void 0 : _e.dateLabel) || "").trim(),
        image: String(((_f = anyReq.body) === null || _f === void 0 ? void 0 : _f.image) || "").trim(),
        avatar: String(((_g = anyReq.body) === null || _g === void 0 ? void 0 : _g.avatar) || "").trim(),
        trendingScore: normalizeTrendingScore((_h = anyReq.body) === null || _h === void 0 ? void 0 : _h.trendingScore),
        status: normalizeStatus((_j = anyReq.body) === null || _j === void 0 ? void 0 : _j.status),
    };
    if (!payload.title || !payload.summary || !payload.tag || !payload.author || !payload.dateLabel || !payload.image || !payload.avatar) {
        return {
            code: "error",
            message: "Thiếu thông tin bắt buộc của journal!",
        };
    }
    await journal_model_1.default.updateOne({ _id: id }, payload);
    return {
        code: "success",
        message: "Cập nhật journal thành công!",
    };
};
exports.editPatch = editPatch;
