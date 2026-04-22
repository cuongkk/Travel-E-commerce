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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkZaloPayStatus = exports.momoCallback = exports.zaloPayCallback = exports.createMomoOrder = exports.createZaloPayOrder = void 0;
const paymentService = __importStar(require("./payment.service"));
const order_model_1 = __importDefault(require("../order/order.model"));
const async_handler_1 = require("../../utils/async-handler");
const response_1 = require("../../utils/response");
const error_middleware_1 = require("../../middlewares/error.middleware");
/**
 * Endpoint tạo đơn hàng thanh toán ZaloPay
 */
exports.createZaloPayOrder = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { orderId } = req.body;
    const order = await order_model_1.default.findById(orderId);
    if (!order) {
        throw new error_middleware_1.HttpError(404, "Đơn hàng không tồn tại!");
    }
    const result = await paymentService.createPayment(order.id, order.total || 0, `Thanh toán cho đơn hàng ${order.code || order.id}`);
    if (result.return_code !== 1) {
        throw new error_middleware_1.HttpError(400, result.return_message || "Tạo đơn hàng ZaloPay thất bại!");
    }
    // Cập nhật app_trans_id vào đơn hàng để đối soát sau này (nếu cần)
    // Giả sử ta lưu vào field note hoặc một field mới. Ở đây tôi chỉ trả về URL.
    (0, response_1.sendSuccess)(res, "Tạo đơn hàng ZaloPay thành công!", {
        order_url: result.order_url,
        app_trans_id: result.app_trans_id
    });
});
/**
 * Endpoint tạo đơn hàng thanh toán MoMo
 */
exports.createMomoOrder = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { orderId } = req.body;
    const order = await order_model_1.default.findById(orderId);
    if (!order) {
        throw new error_middleware_1.HttpError(404, "Đơn hàng không tồn tại!");
    }
    const result = await paymentService.createMomoPayment(order.id, order.total || 0, `Thanh toán MoMo cho đơn hàng ${order.code || order.id}`);
    if (result.resultCode !== 0) {
        throw new error_middleware_1.HttpError(400, result.message || "Tạo đơn hàng MoMo thất bại!");
    }
    (0, response_1.sendSuccess)(res, "Tạo đơn hàng MoMo thành công!", {
        payUrl: result.payUrl,
    });
});
/**
 * Webhook nhận kết quả thanh toán từ ZaloPay
 */
exports.zaloPayCallback = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { data: dataStr, mac } = req.body;
    const isValid = paymentService.verifyCallback(dataStr, mac);
    if (!isValid) {
        // Callback không hợp lệ
        res.json({
            return_code: -1,
            return_message: "mac not equal",
        });
        return;
    }
    // Thanh toán thành công từ ZaloPay
    const dataJson = JSON.parse(dataStr);
    const appTransId = dataJson.app_trans_id;
    // Trích xuất orderId từ app_trans_id (format: yyMMdd_orderId_timestamp)
    const parts = appTransId.split("_");
    const orderId = parts[1];
    // Cập nhật trạng thái đơn hàng
    const order = await order_model_1.default.findById(orderId);
    if (order) {
        order.paymentStatus = "paid";
        order.paymentMethod = "zalopay";
        await order.save();
        console.log(`Cập nhật đơn hàng ${orderId} thành công (ZaloPay)`);
    }
    res.json({
        return_code: 1,
        return_message: "success",
    });
});
/**
 * Webhook nhận kết quả thanh toán từ MoMo (IPN)
 */
exports.momoCallback = (0, async_handler_1.asyncHandler)(async (req, res) => {
    // MoMo gửi các trường như partnerCode, orderId, amount, resultCode, signature...
    // Ở đây chúng ta tạm thời tin tưởng hoặc verify signature (nếu cần thêm bảo mật)
    const { orderId, resultCode, extraData } = req.body;
    if (resultCode === 0) {
        // Thanh toán thành công
        const order = await order_model_1.default.findById(orderId);
        if (order) {
            order.paymentStatus = "paid";
            order.paymentMethod = "momo";
            await order.save();
            console.log(`Cập nhật đơn hàng ${orderId} thành công (MoMo)`);
        }
    }
    // MoMo IPN yêu cầu phản hồi HTTP 204 hoặc 200 không cần body đặc biệt
    res.status(204).send();
});
exports.checkZaloPayStatus = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { appTransId } = req.params;
    if (!appTransId) {
        res.status(400).json({ message: "appTransId is required" });
        return;
    }
    const result = await paymentService.getTransactionStatus(appTransId);
    (0, response_1.sendSuccess)(res, "Kiểm tra trạng thái giao dịch thành công!", result);
});
