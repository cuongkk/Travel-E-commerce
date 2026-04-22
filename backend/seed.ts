/**
 * SEED SCRIPT - Sinh dữ liệu mẫu cho TravelKa
 * Chạy: yarn seed
 *
 * Sẽ sinh:
 *  - 300 Orders (phân bổ đều 6 tháng gần nhất, có "ngày cao điểm")
 *  - 5 Vouchers mẫu
 *  - 100 Reviews (gắn với tours và gears có sẵn)
 */

import "dotenv/config";
import mongoose from "mongoose";

// ──────────────────────────────────────────────
// Models
// ──────────────────────────────────────────────
import Order from "./src/modules/order/order.model";
import Tour from "./src/modules/tour/tour.model";
import Gear from "./src/modules/gear/gear.model";
import AccountAdmin from "./src/modules/auth/account.model";
import Voucher from "./src/modules/voucher/voucher.model";
import Review from "./src/modules/review/review.model";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T>(arr: T[]): T => arr[rand(0, arr.length - 1)];

/** Sinh ngày ngẫu nhiên trong 1 tháng cụ thể, thiên về cuối tuần */
const randDateInMonth = (year: number, month: number): Date => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const day = rand(1, daysInMonth);
  const hour = rand(8, 22);
  const minute = rand(0, 59);
  return new Date(year, month - 1, day, hour, minute);
};

const PAYMENT_METHODS = ["money", "bank", "vnpay"] as const;
const ORDER_STATUSES = ["initial", "done", "cancel"] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];

// Phân phối trạng thái đơn hàng theo xác suất
const pickStatus = (): OrderStatus => {
  const r = Math.random();
  if (r < 0.55) return "done";
  if (r < 0.80) return "initial";
  return "cancel";
};

const VIET_NAMES = [
  "Nguyễn Văn An", "Trần Thị Bích", "Lê Minh Cường", "Phạm Thị Dung",
  "Hoàng Văn Em", "Vũ Thị Fương", "Đặng Minh Giang", "Bùi Thị Hoa",
  "Đinh Văn Hùng", "Lý Thị Kim", "Phan Văn Long", "Đỗ Thị Mai",
  "Ngô Văn Nam", "Hồ Thị Oanh", "Dương Minh Phúc", "Trịnh Thị Quỳnh",
];

const PHONES = ["0901", "0911", "0932", "0987", "0356", "0768", "0345", "0912"];
const randPhone = () => pick(PHONES) + rand(100000, 999999).toString();

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────
async function main() {
  const uri = process.env.DATABASE;
  if (!uri) throw new Error("DATABASE env not set!");

  console.log("🔗 Connecting to database...");
  await mongoose.connect(uri);
  console.log("✅ Connected!\n");

  // Lấy danh sách Tours, Gears, Accounts có sẵn
  const [tours, gears, accounts] = await Promise.all([
    Tour.find({ deleted: false, status: "active" }).lean(),
    Gear.find({ deleted: false, status: "active" }).lean(),
    AccountAdmin.find({ deleted: false, role: "client" }).lean(),
  ]);

  if (tours.length === 0 && gears.length === 0) {
    console.log("⚠️  Không có Tour hoặc Gear nào trong DB. Hãy tạo trước rồi seed.");
    process.exit(1);
  }

  console.log(`📊 Found: ${tours.length} tours | ${gears.length} gears | ${accounts.length} accounts\n`);

  // ────── 1. VOUCHERS ──────
  console.log("🏷️  Seeding Vouchers...");
  const voucherDocs = [
    { code: "SUMMER25", name: "Hè Rực Rỡ 25%", discountType: "percent", discountValue: 25, minOrderValue: 2000000, maxUsage: 100, expiresAt: new Date("2025-12-31"), status: "active" },
    { code: "TET2024", name: "Tết Nguyên Đán", discountType: "fixed", discountValue: 500000, minOrderValue: 5000000, maxUsage: 50, expiresAt: new Date("2025-02-28"), status: "active" },
    { code: "NEWUSER10", name: "Khách Hàng Mới", discountType: "percent", discountValue: 10, minOrderValue: 1000000, maxUsage: 200, expiresAt: new Date("2025-12-31"), status: "active" },
    { code: "FLASH50", name: "Flash Sale 50%", discountType: "percent", discountValue: 50, minOrderValue: 10000000, maxUsage: 20, expiresAt: new Date("2025-12-31"), status: "inactive" },
    { code: "VIP300K", name: "VIP 300K", discountType: "fixed", discountValue: 300000, minOrderValue: 3000000, maxUsage: 500, expiresAt: new Date("2026-06-30"), status: "active" },
  ];

  let voucherCount = 0;
  for (const v of voucherDocs) {
    const exists = await Voucher.findOne({ code: v.code });
    if (!exists) {
      await Voucher.create(v);
      voucherCount++;
    }
  }
  console.log(`   ✅ Created ${voucherCount} new vouchers (skipped duplicates)\n`);

  // ────── 2. ORDERS ──────
  console.log("🛒 Seeding Orders (300 đơn hàng trong 6 tháng)...");

  const now = new Date();
  const orders: any[] = [];

  for (let i = 0; i < 300; i++) {
    // Phân bổ tháng: 6 tháng gần nhất với tháng gần hơn có nhiều đơn hơn
    const monthsBack = rand(0, 5);
    let targetMonth = now.getMonth() + 1 - monthsBack;
    let targetYear = now.getFullYear();
    if (targetMonth <= 0) { targetMonth += 12; targetYear -= 1; }

    const createdAt = randDateInMonth(targetYear, targetMonth);

    // Items: mix tour + gear
    const items: any[] = [];
    const hasTour = tours.length > 0 && Math.random() > 0.3;
    const hasGear = gears.length > 0 && Math.random() > 0.5;

    if (hasTour) {
      const tour = pick(tours) as any;
      const qty = rand(1, 4);
      const price = Number(tour.priceNew || tour.price || 1500000);
      items.push({ type: "tour", id: tour._id, name: tour.name, price, quantity: qty, total: price * qty });
    }

    if (hasGear || items.length === 0) {
      if (gears.length > 0) {
        const gear = pick(gears) as any;
        const qty = rand(1, 3);
        const price = Number(gear.price || 500000);
        items.push({ type: "gear", id: gear._id, name: gear.name, price, quantity: qty, total: price * qty });
      }
    }

    if (items.length === 0) continue;

    const subTotal = items.reduce((sum, item) => sum + item.total, 0);
    const status = pickStatus();

    // Giảm giá nhỏ (~20% orders có discount)
    const discount = Math.random() < 0.2 ? Math.round(subTotal * rand(5, 25) / 100) : 0;
    const total = Math.max(subTotal - discount, 0);

    const account = accounts.length > 0 ? pick(accounts) as any : null;

    orders.push({
      code: `ORD${createdAt.getFullYear()}${String(createdAt.getMonth() + 1).padStart(2, "0")}${String(i).padStart(4, "0")}`,
      accountId: account?._id?.toString(),
      fullName: account?.fullName || pick(VIET_NAMES),
      phone: account?.phone || randPhone(),
      items,
      subTotal,
      discount,
      total,
      paymentMethod: pick(PAYMENT_METHODS as unknown as string[]),
      paymentStatus: status === "done" ? "paid" : "unpaid",
      status,
      deleted: false,
    });
  }

  // Override createdAt via bulkWrite để set đúng ngày
  const createdOrders = await Order.insertMany(
    orders.map((o: any) => ({ ...o, createdAt: o.createdAt })),
    { timestamps: false }
  );

  // Cập nhật createdAt thực sự (insertMany không ghi đè timestamps)
  // Dùng bulkWrite
  const bulkOps = orders.map((o, idx) => ({
    updateOne: {
      filter: { _id: (createdOrders[idx] as any)._id },
      update: {
        $set: {
          createdAt: randDateInMonth(
            now.getFullYear(),
            Math.max(1, now.getMonth() + 1 - rand(0, 5))
          )
        }
      }
    }
  }));
  await Order.bulkWrite(bulkOps);

  console.log(`   ✅ Created ${createdOrders.length} orders\n`);

  // ────── 3. REVIEWS ──────
  console.log("⭐ Seeding Reviews (100 đánh giá)...");

  const REVIEW_CONTENTS = [
    "Tour tuyệt vời, hướng dẫn viên nhiệt tình, cảnh đẹp. Sẽ quay lại!",
    "Trải nghiệm không thể quên, đội ngũ phục vụ chuyên nghiệp.",
    "Chuyến đi rất xứng đáng với số tiền bỏ ra. Recommend!!!",
    "Cảnh đẹp, đồ ăn ngon, lịch trình hợp lý. Cảm ơn TravelKa!",
    "Chất lượng vượt mong đợi, sẽ đặt lại lần sau chắc chắn.",
    "Mọi thứ đều ổn, chỉ có một chút trễ lịch trình.",
    "Gear chắc chắn, đúng size, ship nhanh. Sẽ mua thêm.",
    "Sản phẩm đúng mô tả, chất lượng tốt, đóng gói cẩn thận.",
    "Hơi đắt một chút nhưng chất lượng xứng đáng với giá.",
    "Tour rất thú vị, phù hợp cho cả gia đình. Highly recommend!",
  ];

  const reviewsToInsert: any[] = [];

  const doneOrders = await Order.find({ status: "done", deleted: false }).limit(100).lean();

  for (let i = 0; i < 100 && i < doneOrders.length + 50; i++) {

    // Ưu tiên gắn review theo doneOrder thực tế
    const order: any = i < doneOrders.length ? doneOrders[i] : null;
    const account: any = accounts.length > 0 ? (order?.accountId
      ? accounts.find((a: any) => a._id.toString() === order.accountId) || pick(accounts)
      : pick(accounts)) : null;

    let itemId: string | null = null;
    let itemType: "tour" | "gear" = "tour";

    if (order?.items?.length > 0) {
      const item = pick(order.items as any[]) as any;
      itemId = item.id?.toString() || (item._id?.toString() ?? null);
      itemType = (item.type as "tour" | "gear") || "tour";
    } else if (tours.length > 0 && Math.random() > 0.4) {
      const tour = pick(tours) as any;
      itemId = tour._id.toString();
      itemType = "tour";
    } else if (gears.length > 0) {
      const gear = pick(gears) as any;
      itemId = gear._id.toString();
      itemType = "gear";
    }

    if (!itemId || !account) continue;

    const rating = rand(3, 5); // Thiên về positive reviews

    reviewsToInsert.push({
      itemId,
      itemType,
      accountId: account._id,
      orderId: order?._id,
      rating,
      content: pick(REVIEW_CONTENTS),
      status: "active",
      deleted: false,
      createdAt: randDateInMonth(
        now.getFullYear(),
        Math.max(1, now.getMonth() + 1 - rand(0, 4))
      ),
    });
  }

  if (reviewsToInsert.length > 0) {
    const createdReviews = await Review.insertMany(reviewsToInsert, { timestamps: false });

    // Cập nhật ratings cho tours và gears
    const itemGroups = new Map<string, { itemType: string; ratings: number[] }>();
    for (const r of reviewsToInsert) {
      const key = `${r.itemType}:${r.itemId}`;
      if (!itemGroups.has(key)) {
        itemGroups.set(key, { itemType: r.itemType, ratings: [] });
      }
      itemGroups.get(key)!.ratings.push(r.rating);
    }

    for (const [key, { itemType, ratings }] of itemGroups) {
      const itemId = key.split(":")[1];
      const avg = ratings.reduce((s, r) => s + r, 0) / ratings.length;
      const Model: any = itemType === "tour" ? Tour : Gear;
      await Model.updateOne({ _id: itemId }, { $set: { rating: parseFloat(avg.toFixed(1)), reviewCount: ratings.length } });
    }

    console.log(`   ✅ Created ${createdReviews.length} reviews & updated ratings\n`);
  } else {
    console.log(`   ⚠️  Không có tài khoản hoặc đơn hàng, bỏ qua reviews\n`);
  }

  // ────── SUMMARY ──────
  const totalOrders = await Order.countDocuments({ deleted: false });
  const totalRevenue = await Order.aggregate([
    { $match: { deleted: false, status: "done" } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);

  console.log("═══════════════════════════════════════════");
  console.log("🎉 SEED HOÀN THÀNH!");
  console.log(`   📦 Tổng Orders trong DB   : ${totalOrders}`);
  console.log(`   💰 Tổng Doanh thu (done)  : ${(totalRevenue[0]?.total || 0).toLocaleString("vi-VN")}đ`);
  console.log(`   ⭐ Reviews đã tạo         : ${reviewsToInsert.length}`);
  console.log("═══════════════════════════════════════════\n");

  await mongoose.disconnect();
  console.log("🔌 Disconnected from DB. Done!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
