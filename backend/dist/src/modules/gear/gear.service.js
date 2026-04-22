"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editPatch = exports.hardDeleteItem = exports.restoreItem = exports.getTrash = exports.deleteItem = exports.edit = exports.createPost = exports.list = void 0;
const gear_model_1 = __importDefault(require("./gear.model"));
const normalizeStatus = (value) => {
    return String(value || "active") === "inactive" ? "inactive" : "active";
};
const normalizePrice = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0)
        return 0;
    return parsed;
};
const list = async (_req) => {
    const gearList = await gear_model_1.default.find({ deleted: false }).sort({ createdAt: -1 });
    return { gearList };
};
exports.list = list;
const createPost = async (req) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const anyReq = req;
    const payload = {
        name: String(((_a = anyReq.body) === null || _a === void 0 ? void 0 : _a.name) || "").trim(),
        category: String(((_b = anyReq.body) === null || _b === void 0 ? void 0 : _b.category) || "").trim(),
        subtitle: String(((_c = anyReq.body) === null || _c === void 0 ? void 0 : _c.subtitle) || "").trim(),
        description: String(((_d = anyReq.body) === null || _d === void 0 ? void 0 : _d.description) || "").trim(),
        price: normalizePrice((_e = anyReq.body) === null || _e === void 0 ? void 0 : _e.price),
        image: String(((_f = anyReq.body) === null || _f === void 0 ? void 0 : _f.image) || "").trim(),
        badge: String(((_g = anyReq.body) === null || _g === void 0 ? void 0 : _g.badge) || "").trim(),
        status: normalizeStatus((_h = anyReq.body) === null || _h === void 0 ? void 0 : _h.status),
    };
    if (!payload.name || !payload.category || !payload.image) {
        return {
            code: "error",
            message: "Thiếu thông tin bắt buộc của gear!",
        };
    }
    const record = new gear_model_1.default(payload);
    await record.save();
    return {
        code: "success",
        message: "Tạo gear thành công!",
    };
};
exports.createPost = createPost;
const edit = async (req) => {
    const { id } = req.params;
    const gearDetail = await gear_model_1.default.findOne({ _id: id, deleted: false });
    if (!gearDetail) {
        return {
            code: "error",
            message: "Gear không tồn tại!",
        };
    }
    return { gearDetail };
};
exports.edit = edit;
const deleteItem = async (req) => {
    const { id } = req.params;
    const deletedItem = await gear_model_1.default.findByIdAndUpdate(id, { deleted: true, deletedAt: new Date() }, { new: true });
    if (!deletedItem) {
        throw new Error("Gear không tồn tại!");
    }
    return { deletedGear: deletedItem };
};
exports.deleteItem = deleteItem;
const getTrash = async (_req) => {
    const gearList = await gear_model_1.default.find({ deleted: true }).sort({ deletedAt: -1 });
    return { gearList };
};
exports.getTrash = getTrash;
const restoreItem = async (req) => {
    const { id } = req.params;
    const restoredItem = await gear_model_1.default.findByIdAndUpdate(id, { deleted: false, deletedAt: null }, { new: true });
    if (!restoredItem) {
        throw new Error("Gear không tồn tại trong thùng rác!");
    }
    return { restoredGear: restoredItem };
};
exports.restoreItem = restoreItem;
const hardDeleteItem = async (req) => {
    const { id } = req.params;
    const deletedItem = await gear_model_1.default.findByIdAndDelete(id);
    if (!deletedItem) {
        throw new Error("Gear không tồn tại!");
    }
    return { deletedGear: deletedItem };
};
exports.hardDeleteItem = hardDeleteItem;
const editPatch = async (req) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const { id } = req.params;
    const anyReq = req;
    const gearDetail = await gear_model_1.default.findOne({ _id: id, deleted: false });
    if (!gearDetail) {
        return {
            code: "error",
            message: "Gear không tồn tại!",
        };
    }
    const payload = {
        name: String(((_a = anyReq.body) === null || _a === void 0 ? void 0 : _a.name) || "").trim(),
        category: String(((_b = anyReq.body) === null || _b === void 0 ? void 0 : _b.category) || "").trim(),
        subtitle: String(((_c = anyReq.body) === null || _c === void 0 ? void 0 : _c.subtitle) || "").trim(),
        description: String(((_d = anyReq.body) === null || _d === void 0 ? void 0 : _d.description) || "").trim(),
        price: normalizePrice((_e = anyReq.body) === null || _e === void 0 ? void 0 : _e.price),
        image: String(((_f = anyReq.body) === null || _f === void 0 ? void 0 : _f.image) || "").trim(),
        badge: String(((_g = anyReq.body) === null || _g === void 0 ? void 0 : _g.badge) || "").trim(),
        status: normalizeStatus((_h = anyReq.body) === null || _h === void 0 ? void 0 : _h.status),
    };
    if (!payload.name || !payload.category || !payload.image) {
        return {
            code: "error",
            message: "Thiếu thông tin bắt buộc của gear!",
        };
    }
    await gear_model_1.default.updateOne({ _id: id }, payload);
    return {
        code: "success",
        message: "Cập nhật gear thành công!",
    };
};
exports.editPatch = editPatch;
