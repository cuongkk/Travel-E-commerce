"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.editPatch = exports.edit = exports.list = void 0;
const moment_1 = __importDefault(require("moment"));
const order_model_1 = __importDefault(require("./order.model"));
const city_model_1 = __importDefault(require("../city/city.model"));
const account_model_1 = __importDefault(require("../auth/account.model"));
const voucher_model_1 = __importDefault(require("../voucher/voucher.model"));
const cart_service_1 = require("../cart/cart.service");
const error_middleware_1 = require("../../middlewares/error.middleware");
const variable_config_1 = require("../../configs/variable.config");
const normalizeOrderItems = (items = []) => {
    return items.map((item) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const quantity = Number((_a = item.quantity) !== null && _a !== void 0 ? _a : 0) || Number((_b = item.quantityAdult) !== null && _b !== void 0 ? _b : 0) + Number((_c = item.quantityChildren) !== null && _c !== void 0 ? _c : 0) + Number((_d = item.quantityBaby) !== null && _d !== void 0 ? _d : 0);
        const unitPrice = Number((_e = item.unitPrice) !== null && _e !== void 0 ? _e : 0) || Number((_f = item.priceNew) !== null && _f !== void 0 ? _f : 0) || Number((_g = item.priceNewAdult) !== null && _g !== void 0 ? _g : 0) || Number((_h = item.priceAdult) !== null && _h !== void 0 ? _h : 0) || 0;
        return {
            ...item,
            quantity,
            unitPrice,
        };
    });
};
const list = async (req) => {
    const orderList = await order_model_1.default.find({
        deleted: false,
    }).sort({ createdAt: "desc" });
    for (const orderDetail of orderList) {
        const paymentMethod = variable_config_1.paymentMethodList.find((item) => item.value === orderDetail.paymentMethod);
        const paymentStatus = variable_config_1.paymentStatusList.find((item) => item.value === orderDetail.paymentStatus);
        const status = variable_config_1.statusList.find((item) => item.value === orderDetail.status);
        orderDetail.paymentMethodName = paymentMethod === null || paymentMethod === void 0 ? void 0 : paymentMethod.label;
        orderDetail.paymentStatusName = paymentStatus === null || paymentStatus === void 0 ? void 0 : paymentStatus.label;
        orderDetail.statusDetail = status;
        orderDetail.createdAtTime = (0, moment_1.default)(orderDetail.createdAt).format("HH:mm");
        orderDetail.createdAtDate = (0, moment_1.default)(orderDetail.createdAt).format("DD/MM/YYYY");
        orderDetail.items = normalizeOrderItems(orderDetail.items || []);
    }
    return { orderList };
};
exports.list = list;
const edit = async (req) => {
    try {
        const { id } = req.params;
        const orderDetail = await order_model_1.default.findOne({ _id: id, deleted: false });
        if (!orderDetail) {
            return { code: "error", message: "Đơn hàng không tồn tại!" };
        }
        orderDetail.createdAtFormat = (0, moment_1.default)(orderDetail.createdAt).format("HH:mm - DD/MM/YYYY");
        orderDetail.items = normalizeOrderItems(orderDetail.items || []);
        const cityIds = [...new Set((orderDetail.items || []).map((i) => i.locationFrom).filter(Boolean))];
        const cities = await city_model_1.default.find({ _id: { $in: cityIds } }).select("name");
        const cityMap = new Map(cities.map((c) => [c._id.toString(), c]));
        for (const item of orderDetail.items || []) {
            item.departureDateFormat = (0, moment_1.default)(item.departureDate).format("DD/MM/YYYY");
            const city = cityMap.get(String(item.locationFrom));
            if (city)
                item.locationFromName = city.name;
        }
        return { orderDetail, paymentMethodList: variable_config_1.paymentMethodList, paymentStatusList: variable_config_1.paymentStatusList, statusList: variable_config_1.statusList };
    }
    catch (error) {
        return { code: "error", message: "Đơn hàng không tồn tại!" };
    }
};
exports.edit = edit;
const editPatch = async (req) => {
    try {
        const { id } = req.params;
        const orderDetail = await order_model_1.default.findOne({ _id: id, deleted: false });
        if (!orderDetail) {
            return {
                code: "error",
                message: "Đơn hàng không tồn tại!",
            };
        }
        await order_model_1.default.updateOne({ _id: id, deleted: false }, req.body);
        return {
            code: "success",
            message: "Đã cập nhật đơn hàng!",
        };
    }
    catch (error) {
        return {
            code: "success",
            message: "Đơn hàng không tồn tại!",
        };
    }
};
exports.editPatch = editPatch;
const create = async (req) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId)
        throw new error_middleware_1.HttpError(401, "Bạn cần đăng nhập để thực hiện thao tác này.");
    const account = await account_model_1.default.findById(userId).select("cart");
    if (!account)
        throw new error_middleware_1.HttpError(404, "Tài khoản không tồn tại!");
    const cartInput = account.cart || [];
    if (cartInput.length === 0)
        throw new error_middleware_1.HttpError(400, "Giỏ hàng trống!");
    const cartDetails = await (0, cart_service_1.buildCartDetails)(cartInput);
    const subTotal = cartDetails.reduce((sum, item) => sum + ((item.priceNew && item.priceNew > 0) ? item.priceNew : item.price || 0) * item.quantity, 0);
    const { fullName, phone, email, note, paymentMethod, voucherCode } = req.body;
    let discount = 0;
    let finalVoucherCode = undefined;
    if (voucherCode) {
        const voucher = await voucher_model_1.default.findOne({ code: String(voucherCode).toUpperCase(), deleted: false, status: "active" });
        if (voucher) {
            const isNotExpired = voucher.expiresAt >= new Date();
            const hasStock = voucher.maxUsage === undefined ||
                voucher.maxUsage === null ||
                (voucher.usedCount !== undefined && voucher.usedCount < voucher.maxUsage);
            const isMinValid = voucher.minOrderValue === undefined || voucher.minOrderValue === 0 || subTotal >= voucher.minOrderValue;
            if (isNotExpired && hasStock && isMinValid) {
                if (voucher.discountType === "percent") {
                    discount = (subTotal * voucher.discountValue) / 100;
                }
                else {
                    discount = voucher.discountValue;
                }
                if (discount > subTotal)
                    discount = subTotal;
                finalVoucherCode = voucher.code;
                // Increase usedCount immediately
                await voucher_model_1.default.updateOne({ _id: voucher._id }, { $inc: { usedCount: 1 } });
            }
        }
    }
    const total = subTotal - discount;
    const orderData = {
        code: `ORD-${Date.now()}`,
        accountId: userId,
        fullName,
        phone,
        email,
        note,
        items: cartDetails,
        subTotal,
        discount,
        voucherCode: finalVoucherCode,
        total,
        paymentMethod,
        paymentStatus: "unpaid",
        status: "initial",
        deleted: false,
    };
    const newOrder = await order_model_1.default.create(orderData);
    // Xóa giỏ hàng sau khi tạo đơn
    await account_model_1.default.updateOne({ _id: userId }, { $set: { cart: [] } });
    return newOrder;
};
exports.create = create;
