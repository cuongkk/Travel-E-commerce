"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMomoPayment = exports.getTransactionStatus = exports.verifyCallback = exports.createPayment = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const moment_1 = __importDefault(require("moment"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    app_id: process.env.ZALOPAY_APP_ID || "2554",
    key1: process.env.ZALOPAY_KEY1 || "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
    key2: process.env.ZALOPAY_KEY2 || "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
    endpoint: process.env.ZALOPAY_ENDPOINT || "https://sb-openapi.zalopay.vn/v2/create",
    callback_url: process.env.ZALOPAY_CALLBACK_URL || "https://yourdomain.com/payment/callback",
};
/**
 * Tạo đơn hàng thanh toán qua ZaloPay
 * @param orderId ID của đơn hàng trong hệ thống
 * @param amount Số tiền thanh toán (USD)
 * @param description Mô tả giao dịch
 * @returns Thông tin kết quả từ ZaloPay (bao gồm order_url)
 */
const createPayment = async (orderId, amount, description = "Thanh toán đơn hàng") => {
    const embed_data = {
        redirecturl: process.env.ZALOPAY_REDIRECT_URL || "http://localhost:3000/order/success",
    };
    const items = [];
    // ZaloPay app_trans_id max length is 40. YYMMDD_ + orderId (24) = 31 characters.
    const transID = `${(0, moment_1.default)().format("YYMMDD")}_${orderId}`;
    // Đảm bảo số lượng tiền là số nguyên (VND). Giả sử amount là USD, tỷ giá 25400.
    const amountVND = Math.max(Math.round(amount * 25400), 1000); // ZaloPay tối thiểu 1000đ
    const order = {
        app_id: Number(config.app_id),
        app_trans_id: transID,
        app_user: "user123",
        app_time: Date.now(), // miliseconds
        item: JSON.stringify(items),
        embed_data: JSON.stringify(embed_data),
        amount: amountVND,
        description: `${description} #${orderId}`,
        bank_code: "",
        callback_url: config.callback_url,
        mac: "",
    };
    // appid|app_trans_id|appuser|amount|apptime|embeddata|item
    const data = config.app_id +
        "|" +
        order.app_trans_id +
        "|" +
        order.app_user +
        "|" +
        order.amount +
        "|" +
        order.app_time +
        "|" +
        order.embed_data +
        "|" +
        order.item;
    order.mac = crypto_1.default.createHmac("sha256", config.key1).update(data).digest("hex");
    try {
        const response = await axios_1.default.post(config.endpoint, order);
        return { ...response.data, app_trans_id: transID };
    }
    catch (error) {
        console.error("ZaloPay Create Payment Error:", error);
        throw error;
    }
};
exports.createPayment = createPayment;
/**
 * Xác thực callback từ ZaloPay
 * @param dataStr Chuỗi dữ liệu ZaloPay gửi sang (JSON string)
 * @param requestMac MAC ZaloPay gửi sang để đối soát
 * @returns Boolean xác định tính hợp lệ
 */
const verifyCallback = (dataStr, requestMac) => {
    const mac = crypto_1.default.createHmac("sha256", config.key2).update(dataStr).digest("hex");
    return mac === requestMac;
};
exports.verifyCallback = verifyCallback;
/**
 * Truy vấn trạng thái giao dịch
 * @param app_trans_id Mã giao dịch app_trans_id đã dùng để tạo đơn hàng
 */
const getTransactionStatus = async (app_trans_id) => {
    const postData = {
        app_id: config.app_id,
        app_trans_id: app_trans_id,
        mac: "",
    };
    const data = postData.app_id + "|" + postData.app_trans_id + "|" + config.key1; // appid|app_trans_id|key1
    postData.mac = crypto_1.default.createHmac("sha256", config.key1).update(data).digest("hex");
    try {
        const response = await axios_1.default.post("https://sb-openapi.zalopay.vn/v2/query", null, {
            params: postData,
        });
        return response.data;
    }
    catch (error) {
        console.error("ZaloPay Query Status Error:", error);
        throw error;
    }
};
exports.getTransactionStatus = getTransactionStatus;
// ================= MoMo Payment Integration =================
const momoConfig = {
    partnerCode: process.env.MOMO_PARTNER_CODE || "MOMO",
    accessKey: process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85",
    secretKey: process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz",
    endpoint: process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn/v2/gateway/api/create",
    redirectUrl: process.env.MOMO_REDIRECT_URL || "http://localhost:3000/order/success",
    ipnUrl: process.env.MOMO_IPN_URL || "https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b"
};
/**
 * Tạo đơn hàng thanh toán qua MoMo
 * @param orderId ID của đơn hàng trong hệ thống
 * @param amount Số tiền thanh toán (USD)
 * @param description Mô tả giao dịch
 * @returns Thông tin kết quả từ MoMo (bao gồm payUrl chứa mã QR)
 */
const createMomoPayment = async (orderId, amount, description = "Thanh toán đơn hàng TravelKa") => {
    // Đảm bảo số lượng tiền là số nguyên (VND). Giả sử amount là USD, tỷ giá 25400.
    const amountVND = Math.max(Math.round(amount * 25400), 1000).toString();
    const requestId = `${momoConfig.partnerCode}_${Date.now()}`;
    const requestType = "payWithMethod";
    const extraData = "";
    const orderGroupId = "";
    const autoCapture = true;
    const lang = "vi";
    // before sign HMAC SHA256 with format
    const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${amountVND}&extraData=${extraData}&ipnUrl=${momoConfig.ipnUrl}&orderId=${orderId}&orderInfo=${description}&partnerCode=${momoConfig.partnerCode}&redirectUrl=${momoConfig.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    // signature
    const signature = crypto_1.default.createHmac("sha256", momoConfig.secretKey)
        .update(rawSignature)
        .digest("hex");
    const requestBody = {
        partnerCode: momoConfig.partnerCode,
        partnerName: "TravelKa",
        storeId: "TravelKaStore",
        requestId: requestId,
        amount: amountVND,
        orderId: orderId,
        orderInfo: description,
        redirectUrl: momoConfig.redirectUrl,
        ipnUrl: momoConfig.ipnUrl,
        lang: lang,
        requestType: requestType,
        autoCapture: autoCapture,
        extraData: extraData,
        orderGroupId: orderGroupId,
        signature: signature
    };
    try {
        const response = await axios_1.default.post(momoConfig.endpoint, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data; // Response data chứa payUrl
    }
    catch (error) {
        console.error("MoMo Create Payment Error:", error);
        throw error;
    }
};
exports.createMomoPayment = createMomoPayment;
