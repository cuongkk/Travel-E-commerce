import type { Request } from "express";
import moment from "moment";
import Order from "./order.model";
import City from "../city/city.model";
import AccountAdmin from "../auth/account.model";
import Voucher from "../voucher/voucher.model";
import { buildCartDetails } from "../cart/cart.service";
import type { AccountRequest } from "../../interfaces/request.interface";
import { HttpError } from "../../middlewares/error.middleware";
import { paymentMethodList, paymentStatusList, statusList } from "../../configs/variable.config";

const normalizeOrderItems = (items: any[] = []): any[] => {
  return items.map((item) => {
    const quantity = Number(item.quantity ?? 0) || Number(item.quantityAdult ?? 0) + Number(item.quantityChildren ?? 0) + Number(item.quantityBaby ?? 0);

    const unitPrice = Number(item.unitPrice ?? 0) || Number(item.priceNew ?? 0) || Number(item.priceNewAdult ?? 0) || Number(item.priceAdult ?? 0) || 0;

    return {
      ...item,
      quantity,
      unitPrice,
    };
  });
};

export const list = async (req: Request): Promise<{ orderList: any[] }> => {
  const orderList: any[] = await Order.find({
    deleted: false,
  }).sort({ createdAt: "desc" });

  for (const orderDetail of orderList) {
    const paymentMethod = paymentMethodList.find((item) => item.value === (orderDetail as any).paymentMethod);
    const paymentStatus = paymentStatusList.find((item) => item.value === (orderDetail as any).paymentStatus);
    const status = statusList.find((item) => item.value === (orderDetail as any).status);

    (orderDetail as any).paymentMethodName = paymentMethod?.label;
    (orderDetail as any).paymentStatusName = paymentStatus?.label;
    (orderDetail as any).statusDetail = status;

    (orderDetail as any).createdAtTime = moment((orderDetail as any).createdAt).format("HH:mm");
    (orderDetail as any).createdAtDate = moment((orderDetail as any).createdAt).format("DD/MM/YYYY");
    (orderDetail as any).items = normalizeOrderItems((orderDetail as any).items || []);
  }

  return { orderList };
};

export const edit = async (
  req: Request,
): Promise<{ orderDetail: any; paymentMethodList: typeof paymentMethodList; paymentStatusList: typeof paymentStatusList; statusList: typeof statusList } | { code: string; message: string }> => {
  try {
    const { id } = req.params as { id: string };

    const orderDetail: any = await Order.findOne({ _id: id, deleted: false });

    if (!orderDetail) {
      return { code: "error", message: "Đơn hàng không tồn tại!" };
    }

    orderDetail.createdAtFormat = moment(orderDetail.createdAt).format("HH:mm - DD/MM/YYYY");
    orderDetail.items = normalizeOrderItems(orderDetail.items || []);

    const cityIds = [...new Set((orderDetail.items || []).map((i: any) => i.locationFrom).filter(Boolean))];
    const cities = await City.find({ _id: { $in: cityIds } }).select("name");
    const cityMap = new Map<string, any>(cities.map((c: any) => [c._id.toString(), c]));

    for (const item of orderDetail.items || []) {
      item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
      const city = cityMap.get(String(item.locationFrom));
      if (city) item.locationFromName = (city as any).name;
    }

    return { orderDetail, paymentMethodList, paymentStatusList, statusList };
  } catch (error) {
    return { code: "error", message: "Đơn hàng không tồn tại!" };
  }
};

export const editPatch = async (req: Request): Promise<{ code: string; message: string }> => {
  try {
    const { id } = req.params as { id: string };

    const orderDetail = await Order.findOne({ _id: id, deleted: false });

    if (!orderDetail) {
      return {
        code: "error",
        message: "Đơn hàng không tồn tại!",
      };
    }

    await Order.updateOne({ _id: id, deleted: false }, (req as any).body);

    return {
      code: "success",
      message: "Đã cập nhật đơn hàng!",
    };
  } catch (error) {
    return {
      code: "success",
      message: "Đơn hàng không tồn tại!",
    };
  }
};

export const create = async (req: Request): Promise<any> => {
  const userId = (req as AccountRequest).user?.id;
  if (!userId) throw new HttpError(401, "Bạn cần đăng nhập để thực hiện thao tác này.");

  const account = await AccountAdmin.findById(userId).select("cart");
  if (!account) throw new HttpError(404, "Tài khoản không tồn tại!");

  const cartInput = (account as any).cart || [];
  if (cartInput.length === 0) throw new HttpError(400, "Giỏ hàng trống!");

  const cartDetails = await buildCartDetails(cartInput);
  const subTotal = cartDetails.reduce((sum, item) => sum + ((item.priceNew && item.priceNew > 0) ? item.priceNew : item.price || 0) * item.quantity, 0);
  
  const { fullName, phone, email, note, paymentMethod, voucherCode } = req.body;

  let discount = 0;
  let finalVoucherCode: string | undefined = undefined;

  if (voucherCode) {
    const voucher = await Voucher.findOne({ code: String(voucherCode).toUpperCase(), deleted: false, status: "active" });
    if (voucher) {
      const isNotExpired = voucher.expiresAt >= new Date();
      const hasStock =
        voucher.maxUsage === undefined ||
        voucher.maxUsage === null ||
        (voucher.usedCount !== undefined && voucher.usedCount < voucher.maxUsage);
      const isMinValid = voucher.minOrderValue === undefined || voucher.minOrderValue === 0 || subTotal >= voucher.minOrderValue;

      if (isNotExpired && hasStock && isMinValid) {
        if (voucher.discountType === "percent") {
          discount = (subTotal * voucher.discountValue) / 100;
        } else {
          discount = voucher.discountValue;
        }

        if (discount > subTotal) discount = subTotal;
        finalVoucherCode = voucher.code;

        // Increase usedCount immediately
        await Voucher.updateOne({ _id: voucher._id }, { $inc: { usedCount: 1 } });
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

  const newOrder = await Order.create(orderData);

  // Xóa giỏ hàng sau khi tạo đơn
  await AccountAdmin.updateOne({ _id: userId }, { $set: { cart: [] } });

  return newOrder;
};
