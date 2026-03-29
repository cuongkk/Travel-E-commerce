import type { Request } from "express";
import AccountAdmin from "../auth/account-admin.model";
import Order from "../order/order.model";

export const dashboard = async (
  req: Request,
): Promise<{
  totalAdmin: number;
  totalOrder: number;
  totalRevenue: number;
}> => {
  const overview = {
    totalAdmin: 0,
    totalOrder: 0,
    totalRevenue: 0,
  };

  overview.totalAdmin = await AccountAdmin.countDocuments({ deleted: false });

  const orderList = await Order.find({ deleted: false });
  overview.totalOrder = orderList.length;
  overview.totalRevenue = orderList.reduce((total, item) => total + (item as any).total, 0);

  return overview;
};

export const revenueChartPost = async (req: Request): Promise<{ dataMonthCurrent: number[]; dataMonthPrevious: number[] }> => {
  const { currentMonth, currentYear, previousMonth, previousYear, arrayDay } = req.body as any;

  const ordersCurrentMonth = await Order.find({
    deleted: false,
    createdAt: {
      $gte: new Date(currentYear, currentMonth - 1, 1),
      $lt: new Date(currentYear, currentMonth, 1),
    },
  });

  const ordersPreviousMonth = await Order.find({
    deleted: false,
    createdAt: {
      $gte: new Date(previousYear, previousMonth - 1, 1),
      $lt: new Date(previousYear, previousMonth, 1),
    },
  });

  const dataMonthCurrent: number[] = [];
  const dataMonthPrevious: number[] = [];

  for (const day of arrayDay as number[]) {
    let revenueCurrent = 0;
    for (const order of ordersCurrentMonth) {
      const orderDate = new Date((order as any).createdAt).getDate();
      if (orderDate === day) {
        revenueCurrent += (order as any).total;
      }
    }
    dataMonthCurrent.push(revenueCurrent);

    let revenuePrevious = 0;
    for (const order of ordersPreviousMonth) {
      const orderDate = new Date((order as any).createdAt).getDate();
      if (orderDate === day) {
        revenuePrevious += (order as any).total;
      }
    }
    dataMonthPrevious.push(revenuePrevious);
  }

  return { dataMonthCurrent, dataMonthPrevious };
};
