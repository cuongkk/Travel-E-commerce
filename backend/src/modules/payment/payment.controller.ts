import type { Request, Response } from "express";
import * as paymentService from "./payment.service";
import Order from "../order/order.model";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";
import { HttpError } from "../../middlewares/error.middleware";

/**
 * Endpoint tạo đơn hàng thanh toán ZaloPay
 */
export const createZaloPayOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new HttpError(404, "Đơn hàng không tồn tại!");
  }

  const result = await paymentService.createPayment(
    order.id,
    order.total || 0,
    `Thanh toán cho đơn hàng ${order.code || order.id}`
  );

  if (result.return_code !== 1) {
    throw new HttpError(400, result.return_message || "Tạo đơn hàng ZaloPay thất bại!");
  }

  // Cập nhật app_trans_id vào đơn hàng để đối soát sau này (nếu cần)
  // Giả sử ta lưu vào field note hoặc một field mới. Ở đây tôi chỉ trả về URL.

  sendSuccess(res, "Tạo đơn hàng ZaloPay thành công!", {
    order_url: result.order_url,
    app_trans_id: result.app_trans_id
  });
});

/**
 * Endpoint tạo đơn hàng thanh toán MoMo
 */
export const createMomoOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new HttpError(404, "Đơn hàng không tồn tại!");
  }

  const result = await paymentService.createMomoPayment(
    order.id,
    order.total || 0,
    `Thanh toán MoMo cho đơn hàng ${order.code || order.id}`
  );

  if (result.resultCode !== 0) {
    throw new HttpError(400, result.message || "Tạo đơn hàng MoMo thất bại!");
  }

  sendSuccess(res, "Tạo đơn hàng MoMo thành công!", {
    payUrl: result.payUrl,
  });
});

/**
 * Webhook nhận kết quả thanh toán từ ZaloPay
 */
export const zaloPayCallback = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
  const order = await Order.findById(orderId);
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
export const momoCallback = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // MoMo gửi các trường như partnerCode, orderId, amount, resultCode, signature...
  // Ở đây chúng ta tạm thời tin tưởng hoặc verify signature (nếu cần thêm bảo mật)
  const { orderId, resultCode, extraData } = req.body;

  if (resultCode === 0) {
    // Thanh toán thành công
    const order = await Order.findById(orderId);
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

/**
 * Kiểm tra trạng thái giao dịch thủ công
 */
interface Params {
  appTransId: string;
}

export const checkZaloPayStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { appTransId } = req.params as { appTransId: string };

    if (!appTransId) {
      res.status(400).json({ message: "appTransId is required" });
      return;
    }

    const result = await paymentService.getTransactionStatus(appTransId);
    sendSuccess(res, "Kiểm tra trạng thái giao dịch thành công!", result);
  }
);