import type { Request, Response } from "express";
import { buildCartDetails, type CartItemInput } from "./cart.service";

export const CartController = {
  // Không render view nữa, chỉ trả JSON (ví dụ dùng cho frontend React/Next)
  cart: (req: Request, res: Response): void => {
    res.json({
      code: "success",
      message: "API giỏ hàng",
    });
  },

  render: async (req: Request, res: Response): Promise<void> => {
    const { cart } = req.body as { cart?: CartItemInput[] };

    if (!Array.isArray(cart)) {
      res.json({
        code: "error",
        message: "Giỏ hàng không hợp lệ!",
        cart: [],
      });
      return;
    }

    const cartDetails = await buildCartDetails(cart);

    res.json({
      code: "success",
      message: "Thành công!",
      cart: cartDetails,
    });
  },
} as const;
