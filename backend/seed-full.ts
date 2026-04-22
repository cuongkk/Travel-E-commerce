/**
 * ═══════════════════════════════════════════════════════════════
 *  TRAVELKA — FULL DATABASE SEED SCRIPT
 *  Chạy: yarn seed:full
 *
 *  ✅ AN TOÀN: Dùng upsert, không xóa data cũ
 *  ✅ ĐẦY ĐỦ: Categories → Tours → Gears → Journals →
 *             Accounts → Vouchers → Orders → Reviews
 * ═══════════════════════════════════════════════════════════════
 */

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import slugify from "slugify";

import Category from "./src/modules/category/category.model";
import Tour from "./src/modules/tour/tour.model";
import Gear from "./src/modules/gear/gear.model";
import Journal from "./src/modules/journal/journal.model";
import Account from "./src/modules/auth/account.model";
import Voucher from "./src/modules/voucher/voucher.model";
import Order from "./src/modules/order/order.model";
import Review from "./src/modules/review/review.model";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[rand(0, arr.length - 1)];
const randDateInMonth = (year: number, month: number): Date => {
  const days = new Date(year, month, 0).getDate();
  return new Date(year, month - 1, rand(1, days), rand(8, 22), rand(0, 59));
};
const makeSlug = (text: string) =>
  slugify(text, { lower: true, strict: true, locale: "vi" }) + "-" + rand(1000, 9999);

const log = (msg: string) => console.log(msg);
const section = (title: string) =>
  console.log(`\n${"─".repeat(50)}\n  ${title}\n${"─".repeat(50)}`);

// ──────────────────────────────────────────────
// 1. CATEGORIES
// ──────────────────────────────────────────────
const CATEGORY_DATA = [
  { name: "Biển đảo", description: "Các tour nghỉ dưỡng biển đảo tuyệt đẹp", position: 1 },
  { name: "Núi rừng", description: "Khám phá thiên nhiên núi rừng hùng vĩ", position: 2 },
  { name: "Văn hóa lịch sử", description: "Tìm hiểu văn hóa và lịch sử địa phương", position: 3 },
  { name: "Miền Tây sông nước", description: "Trải nghiệm cuộc sống miền Tây", position: 4 },
  { name: "Du lịch tâm linh", description: "Hành hương và khám phá chùa chiền", position: 5 },
  { name: "Phiêu lưu mạo hiểm", description: "Trekking, leo núi, vượt thác", position: 6 },
];

// ──────────────────────────────────────────────
// 2. TOURS
// ──────────────────────────────────────────────
const TOUR_TEMPLATES = [
  { name: "Tour Phú Quốc 4N3Đ", time: "4 ngày 3 đêm", price: 4500000, priceNew: 3900000, stock: 20, catIdx: 0, information: "Khám phá đảo Ngọc Phú Quốc với những bãi biển xanh trong vắt, hải sản tươi sống và hoàng hôn tuyệt đẹp.", avatar: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800", images: ["https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800"] },
  { name: "Tour Đà Lạt 3N2Đ", time: "3 ngày 2 đêm", price: 2800000, priceNew: 2400000, stock: 30, catIdx: 1, information: "Thành phố ngàn hoa với không khí trong lành, thác Datanla hùng vĩ và những cánh đồng hoa rực rỡ.", avatar: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800", images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"] },
  { name: "Tour Hội An cổ phố 2N1Đ", time: "2 ngày 1 đêm", price: 1900000, priceNew: 0, stock: 50, catIdx: 2, information: "Dạo bước qua những con phố đèn lồng lung linh, thưởng thức Cao Lầu và khám phá văn hóa Champa cổ đại.", avatar: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800", images: [] },
  { name: "Tour Sapa chinh phục Fansipan", time: "3 ngày 2 đêm", price: 5200000, priceNew: 4600000, stock: 15, catIdx: 1, information: "Chinh phục nóc nhà Đông Dương, trekking qua những thửa ruộng bậc thang tuyệt đẹp.", avatar: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800", images: [] },
  { name: "Tour Hà Giang khám phá cao nguyên đá", time: "4 ngày 3 đêm", price: 4800000, priceNew: 4200000, stock: 12, catIdx: 5, information: "Chinh phục đèo Mã Pí Lèng, ghé thăm Đồng Văn Cổ Trấn và khám phá văn hóa các dân tộc H'Mông.", avatar: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800", images: [] },
  { name: "Tour Miền Tây sông nước 2N1Đ", time: "2 ngày 1 đêm", price: 1500000, priceNew: 1200000, stock: 40, catIdx: 3, information: "Chèo thuyền qua những kênh rạch xanh mướt, thưởng thức trái cây nhiệt đới và khám phá làng nghề truyền thống.", avatar: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800", images: [] },
  { name: "Tour Nha Trang 3N2Đ", time: "3 ngày 2 đêm", price: 3200000, priceNew: 2800000, stock: 25, catIdx: 0, information: "Lặn biển khám phá san hô, tắm bùn khoáng và tham quan Tháp Bà Ponagar.", avatar: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", images: [] },
  { name: "Tour Ninh Bình – Tràng An 1N", time: "1 ngày", price: 850000, priceNew: 0, stock: 60, catIdx: 2, information: "Chèo thuyền Tràng An, leo núi Hang Múa và khám phá cố đô Hoa Lư lịch sử.", avatar: "https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=800", images: [] },
  { name: "Tour Côn Đảo 3N2Đ", time: "3 ngày 2 đêm", price: 6500000, priceNew: 5800000, stock: 10, catIdx: 0, information: "Khám phá hòn đảo nguyên sơ với bãi biển hoang sơ, rùa biển và nghĩa trang Hàng Dương.", avatar: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=800", images: [] },
  { name: "Tour Mộc Châu mùa hoa mận", time: "2 ngày 1 đêm", price: 2100000, priceNew: 1800000, stock: 35, catIdx: 1, information: "Ngắm hoa mận trắng tinh khôi, thưởng thức sữa tươi và khám phá văn hóa Thái.", avatar: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800", images: [] },
];

// ──────────────────────────────────────────────
// 3. GEARS
// ──────────────────────────────────────────────
const GEAR_DATA = [
  { name: "Ba lô trekking Osprey 50L", category: "Ba lô", subtitle: "Chuyên dụng leo núi dài ngày", description: "Ba lô khung cứng, đệm lưng thoáng khí, chống nước IPX4, túi ngăn laptop 17 inch.", price: 3200000, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600", badge: "Bestseller" },
  { name: "Lều cắm trại 2 người Coleman", category: "Lều trại", subtitle: "Nhẹ, bền, dựng nhanh 5 phút", description: "Khung sợi thủy tinh siêu bền, chịu gió cấp 8, chống thấm 3000mm, trọng lượng 2.1kg.", price: 1850000, image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600", badge: "Hot" },
  { name: "Giày trekking Columbia Waterproof", category: "Giày", subtitle: "Chống nước, đế Omni-Grip", description: "Công nghệ Omni-Tech không thấm nước, đế Omni-Grip bám đường, lòng giày OrthoLite.", price: 2750000, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600", badge: "" },
  { name: "Bình lọc nước LifeStraw 1L", category: "Dụng cụ", subtitle: "Lọc 99.9% vi khuẩn, virus", description: "Màng lọc 0.2 micron, loại bỏ vi khuẩn và ký sinh trùng, BPA-free, dung tích 1 lít.", price: 680000, image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600", badge: "Cần thiết" },
  { name: "Đèn đầu Black Diamond Spot 325", category: "Ánh sáng", subtitle: "325 lumen, pin 200h", description: "Chế độ ánh sáng đỏ bảo vệ thị lực, chống nước IPX8, điều chỉnh góc chiếu.", price: 950000, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600", badge: "" },
  { name: "Áo gió Patagonia Torrentshell", category: "Quần áo", subtitle: "Chống gió, chống nước nhẹ", description: "Shell 2.5-lớp H2No, gói gọn vào túi ngực, co giãn linh hoạt 4 chiều.", price: 4100000, image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600", badge: "" },
  { name: "Máy lọc nước MSR TrailShot", category: "Dụng cụ", subtitle: "Lọc trực tiếp không cần bình", description: "Bơm tay cầm, lọc được >2000L, trọng lượng chỉ 143g, phù hợp trekking ngắn ngày.", price: 1250000, image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600", badge: "" },
  { name: "Túi ngủ The North Face Eco Trail 0°C", category: "Túi ngủ", subtitle: "Nhẹ 1.1kg, giữ ấm 0°C", description: "Lông vũ 600-fill tái chế, chất liệu bên ngoài chống nước DWR, kéo khóa hai chiều.", price: 3600000, image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600", badge: "Eco" },
  { name: "Gậy trekking Black Diamond Trail", category: "Dụng cụ", subtitle: "Nhôm 7075, điều chỉnh 3 đoạn", description: "Cơ chế khóa FlickLock Pro, tay cầm cork tự nhiên thấm mồ hôi, đặt 58-130cm.", price: 1400000, image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600", badge: "" },
  { name: "Kính mát Tifosi Bronx Polarized", category: "Phụ kiện", subtitle: "Tráng phủ phân cực chống UV400", description: "Gọng nylon siêu nhẹ 24g, tráng kháng trầy, phù hợp chạy bộ và đạp xe.", price: 890000, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600", badge: "" },
];

// ──────────────────────────────────────────────
// 4. JOURNALS
// ──────────────────────────────────────────────
const JOURNAL_DATA = [
  { title: "Top 10 bãi biển đẹp nhất Việt Nam 2024", summary: "Khám phá những viên ngọc xanh ẩn mình dọc theo bờ biển Việt Nam dài hơn 3000km.", tag: "Biển đảo", author: "TravelKa Team", dateLabel: "20/04/2024", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100", trendingScore: 95 },
  { title: "Bí kíp du lịch Sapa mùa hè không bao giờ lạc lối", summary: "Những kinh nghiệm xương máu để có chuyến Sapa hoàn hảo từ khách sạn đến lịch trình.", tag: "Núi rừng", author: "Minh Hằng", dateLabel: "15/04/2024", image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100", trendingScore: 88 },
  { title: "5 lý do bạn nên thử trekking một lần trong đời", summary: "Trekking không chỉ là hoạt động thể chất, đó là hành trình khám phá bản thân sâu sắc nhất.", tag: "Phiêu lưu", author: "Đức Anh", dateLabel: "10/04/2024", image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100", trendingScore: 82 },
  { title: "Hội An về đêm – Phố cổ lung linh ánh đèn lồng", summary: "Trải nghiệm đêm hội đèn lồng tháng 14 âm lịch và những góc ảnh đẹp không ai kể cho bạn.", tag: "Văn hóa", author: "Thu Giang", dateLabel: "05/04/2024", image: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800", avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100", trendingScore: 76 },
  { title: "Cẩm nang pack đồ cho chuyến camping 3 ngày", summary: "Danh sách đồ cần mang, không thừa không thiếu, được kiểm chứng bởi hàng trăm chuyến hiking.", tag: "Gear & Tips", author: "TravelKa Team", dateLabel: "01/04/2024", image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100", trendingScore: 71 },
  { title: "Phú Quốc hay Côn Đảo – Nên chọn đảo nào?", summary: "So sánh chi tiết hai hòn đảo sang chảnh nhất Việt Nam để bạn có lựa chọn phù hợp nhất.", tag: "Biển đảo", author: "Thanh Tùng", dateLabel: "25/03/2024", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100", trendingScore: 90 },
  { title: "Ăn gì khi du lịch miền Tây? Top 15 món không thể bỏ qua", summary: "Từ bánh xèo miền Tây đến cá lóc nướng trui, khám phá ẩm thực đặc sắc đồng bằng sông Cửu Long.", tag: "Ẩm thực", author: "Hương Giang", dateLabel: "20/03/2024", image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100", trendingScore: 65 },
  { title: "Những điều cần biết trước khi leo núi lần đầu", summary: "An toàn là ưu tiên số 1. Đây là những gì bạn phải chuẩn bị trước chuyến leo núi đầu tiên.", tag: "Phiêu lưu", author: "Văn Khoa", dateLabel: "15/03/2024", image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100", trendingScore: 78 },
];

// ──────────────────────────────────────────────
// 5a. ADMIN ACCOUNT
// ──────────────────────────────────────────────
const ADMIN_DATA = [
  { fullName: "Nguyễn Admin", email: "ntuancuong2005@gmail.com", phone: "0328228324" },
];

// ──────────────────────────────────────────────
// 5b. ACCOUNTS (Client users)
// ──────────────────────────────────────────────
const ACCOUNT_DATA = [
  { fullName: "Nguyễn Văn An", email: "an.nguyen@gmail.com", phone: "0901234567" },
  { fullName: "Trần Thị Bích", email: "bich.tran@gmail.com", phone: "0912345678" },
  { fullName: "Lê Minh Cường", email: "cuong.le@gmail.com", phone: "0923456789" },
  { fullName: "Phạm Thị Dung", email: "dung.pham@gmail.com", phone: "0934567890" },
  { fullName: "Hoàng Văn Em", email: "em.hoang@gmail.com", phone: "0945678901" },
  { fullName: "Vũ Thị Fương", email: "fuong.vu@gmail.com", phone: "0956789012" },
  { fullName: "Đặng Minh Giang", email: "giang.dang@gmail.com", phone: "0967890123" },
  { fullName: "Bùi Thị Hoa", email: "hoa.bui@gmail.com", phone: "0978901234" },
  { fullName: "Đinh Văn Hùng", email: "hung.dinh@gmail.com", phone: "0989012345" },
  { fullName: "Lý Thị Kim", email: "kim.ly@gmail.com", phone: "0990123456" },
  { fullName: "Phan Văn Long", email: "long.phan@gmail.com", phone: "0901345678" },
  { fullName: "Đỗ Thị Mai", email: "mai.do@gmail.com", phone: "0912456789" },
  { fullName: "Ngô Văn Nam", email: "nam.ngo@gmail.com", phone: "0923567890" },
  { fullName: "Hồ Thị Oanh", email: "oanh.ho@gmail.com", phone: "0934678901" },
  { fullName: "Dương Minh Phúc", email: "phuc.duong@gmail.com", phone: "0945789012" },
];

// ──────────────────────────────────────────────
// MAIN FUNCTION
// ──────────────────────────────────────────────
async function main() {
  const uri = process.env.DATABASE;
  if (!uri) throw new Error("DATABASE env not set!");

  log("🔗 Connecting to database...");
  await mongoose.connect(uri);
  log("✅ Connected!\n");

  // ────── CLEAN ALL DATA ──────
  section("0/8  XÓA TOÀN BỘ DỮ LIỆU CŨ");
  await Promise.all([
    Category.deleteMany({}),
    Tour.deleteMany({}),
    Gear.deleteMany({}),
    Journal.deleteMany({}),
    Account.deleteMany({}),
    Voucher.deleteMany({}),
    Order.deleteMany({}),
    Review.deleteMany({}),
  ]);
  log("   ✅ Đã xóa sạch tất cả collections!");

  // ────── CATEGORIES ──────
  section("1/8  CATEGORIES");
  const categoryIds: string[] = [];
  for (const cat of CATEGORY_DATA) {
    const slug = makeSlug(cat.name);
    const existing = await Category.findOne({ name: cat.name });
    if (existing) {
      categoryIds.push(existing._id.toString());
      log(`   ↷  Skip: ${cat.name}`);
    } else {
      const created = await Category.create({ ...cat, slug, status: "active" });
      categoryIds.push(created._id.toString());
      log(`   ✅ Created: ${cat.name}`);
    }
  }

  // ────── TOURS ──────
  section("2/8  TOURS");
  const tourIds: string[] = [];
  const now = new Date();
  for (const t of TOUR_TEMPLATES) {
    const existing = await Tour.findOne({ name: t.name });
    if (existing) {
      tourIds.push(existing._id.toString());
      log(`   ↷  Skip: ${t.name}`);
      continue;
    }

    const catId = categoryIds[t.catIdx] || categoryIds[0];
    const depDate = new Date(now.getFullYear(), now.getMonth() + rand(1, 3), rand(5, 25));
    const endDate = new Date(depDate.getTime() + rand(1, 4) * 24 * 3600 * 1000);

    const created = await Tour.create({
      name: t.name,
      slug: makeSlug(t.name),
      category: catId,
      price: t.price,
      priceNew: t.priceNew,
      stock: t.stock,
      time: t.time,
      information: t.information,
      avatar: t.avatar,
      images: t.images,
      status: "active",
      deleted: false,
      departureDate: depDate,
      endDate,
      rating: 0,
      reviewCount: 0,
      schedules: [
        { title: "Ngày 1 – Khởi hành & Đón tiếp", description: "Xe đón tại điểm tập kết, di chuyển tới điểm đến. Nhận phòng, nghỉ ngơi và ăn tối địa phương." },
        { title: "Ngày 2 – Khám phá chính", description: "Tham quan các điểm nổi bật trong hành trình, hoạt động dã ngoại và trải nghiệm văn hóa địa phương." },
        { title: "Ngày 3 – Tự do & Mua sắm", description: "Sáng tự do tham quan, chiều mua sắm đặc sản. Tối ăn tối chia tay và nghỉ ngơi." },
        { title: "Ngày cuối – Về nhà", description: "Ăn sáng, trả phòng. Xe đưa về điểm xuất phát. Hẹn gặp lại!" },
      ].slice(0, t.time.includes("1") ? 1 : parseInt(t.time) || 2),
    });

    tourIds.push(created._id.toString());
    log(`   ✅ Created: ${t.name}`);
  }

  // ────── GEARS ──────
  section("3/8  GEARS");
  const gearIds: string[] = [];
  for (const g of GEAR_DATA) {
    const existing = await Gear.findOne({ name: g.name });
    if (existing) {
      gearIds.push(existing._id.toString());
      log(`   ↷  Skip: ${g.name}`);
      continue;
    }
    const created = await Gear.create({ ...g, status: "active", deleted: false, rating: 0, reviewCount: 0 });
    gearIds.push(created._id.toString());
    log(`   ✅ Created: ${g.name}`);
  }

  // ────── JOURNALS ──────
  section("4/8  JOURNALS");
  for (const j of JOURNAL_DATA) {
    const existing = await Journal.findOne({ title: j.title });
    if (existing) { log(`   ↷  Skip: ${j.title.substring(0, 40)}...`); continue; }
    await Journal.create({ ...j, status: "active", deleted: false });
    log(`   ✅ Created: ${j.title.substring(0, 40)}...`);
  }

  // ────── ADMIN ACCOUNTS ──────
  section("5a/8  ADMIN ACCOUNTS");
  const hashedPass = await bcrypt.hash("Ccuong123", 10);

  for (const adm of ADMIN_DATA) {
    const existing = await Account.findOne({ email: adm.email });
    if (existing) {
      log(`   ↷  Skip (admin): ${adm.email}`);
      continue;
    }
    const slug = makeSlug(adm.fullName);
    await Account.create({
      ...adm,
      password: hashedPass,
      role: "admin",
      status: "active",
      slug,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${slug}`,
      deleted: false,
    });
    log(`   ✅ Created admin: ${adm.email}`);
  }

  // ────── CLIENT ACCOUNTS ──────
  section("5b/8  CLIENT ACCOUNTS");
  const accountIds: string[] = [];

  for (const acc of ACCOUNT_DATA) {
    const existing = await Account.findOne({ email: acc.email });
    if (existing) {
      accountIds.push(existing._id.toString());
      log(`   ↷  Skip: ${acc.email}`);
      continue;
    }
    const slug = makeSlug(acc.fullName);
    const created = await Account.create({
      ...acc,
      password: hashedPass,
      role: "client",
      status: "active",
      slug,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${slug}`,
      deleted: false,
    });
    accountIds.push(created._id.toString());
    log(`   ✅ Created: ${acc.email}`);
  }

  // ────── VOUCHERS ──────
  section("6/8  VOUCHERS");
  const VOUCHER_DATA = [
    { code: "SUMMER25", name: "Hè Rực Rỡ 25%", discountType: "percent", discountValue: 25, minOrderValue: 2000000, maxUsage: 100, expiresAt: new Date("2025-12-31"), status: "active" },
    { code: "TET2025", name: "Tết Nguyên Đán 2025", discountType: "fixed", discountValue: 500000, minOrderValue: 5000000, maxUsage: 50, expiresAt: new Date("2025-02-28"), status: "active" },
    { code: "NEWUSER10", name: "Khách Hàng Mới 10%", discountType: "percent", discountValue: 10, minOrderValue: 1000000, maxUsage: 200, expiresAt: new Date("2026-12-31"), status: "active" },
    { code: "FLASH50", name: "Flash Sale 50%", discountType: "percent", discountValue: 50, minOrderValue: 10000000, maxUsage: 20, expiresAt: new Date("2025-12-31"), status: "inactive" },
    { code: "VIP300K", name: "VIP 300.000đ", discountType: "fixed", discountValue: 300000, minOrderValue: 3000000, maxUsage: 500, expiresAt: new Date("2026-06-30"), status: "active" },
    { code: "WEEKEND15", name: "Cuối Tuần 15%", discountType: "percent", discountValue: 15, minOrderValue: 1500000, maxUsage: 300, expiresAt: new Date("2026-12-31"), status: "active" },
  ];

  for (const v of VOUCHER_DATA) {
    const existing = await Voucher.findOne({ code: v.code });
    if (existing) { log(`   ↷  Skip: ${v.code}`); continue; }
    await Voucher.create({ ...v, deleted: false, usedCount: 0 });
    log(`   ✅ Created: ${v.code} — ${v.name}`);
  }

  // ────── ORDERS ──────
  section("7/8  ORDERS (300 đơn × 6 tháng)");
  const PAYMENT_METHODS = ["money", "bank", "vnpay"];
  const pickStatus = (): "done" | "initial" | "cancel" => {
    const r = Math.random();
    return r < 0.55 ? "done" : r < 0.80 ? "initial" : "cancel";
  };

  const ordersToInsert: any[] = [];
  for (let i = 0; i < 300; i++) {
    const monthsBack = rand(0, 5);
    let targetMonth = now.getMonth() + 1 - monthsBack;
    let targetYear = now.getFullYear();
    if (targetMonth <= 0) { targetMonth += 12; targetYear -= 1; }

    const createdAt = randDateInMonth(targetYear, targetMonth);
    const items: any[] = [];

    if (tourIds.length > 0 && Math.random() > 0.3) {
      const id = pick(tourIds);
      const tourDoc: any = TOUR_TEMPLATES[tourIds.indexOf(id)] || TOUR_TEMPLATES[0];
      const qty = rand(1, 4);
      const price = tourDoc.priceNew || tourDoc.price;
      items.push({ type: "tour", id, name: tourDoc.name, price, quantity: qty, total: price * qty });
    }

    if ((gearIds.length > 0 && Math.random() > 0.5) || items.length === 0) {
      const idx = rand(0, gearIds.length - 1);
      const gear = GEAR_DATA[idx];
      if (gear && gearIds[idx]) {
        const qty = rand(1, 3);
        items.push({ type: "gear", id: gearIds[idx], name: gear.name, price: gear.price, quantity: qty, total: gear.price * qty });
      }
    }

    if (items.length === 0) continue;

    const subTotal = items.reduce((s, it) => s + it.total, 0);
    const status = pickStatus();
    const discount = Math.random() < 0.2 ? Math.round(subTotal * rand(5, 25) / 100) : 0;
    const total = Math.max(subTotal - discount, 0);
    const accId = accountIds.length > 0 ? pick(accountIds) : undefined;
    const accIdx = accId ? accountIds.indexOf(accId) : -1;
    const accData = accIdx >= 0 ? ACCOUNT_DATA[accIdx] : undefined;

    ordersToInsert.push({
      code: `ORD${createdAt.getFullYear()}${String(createdAt.getMonth() + 1).padStart(2, "0")}${String(i).padStart(4, "0")}`,
      accountId: accId,
      fullName: accData?.fullName || "Khách vãng lai",
      phone: accData?.phone || `090${rand(1000000, 9999999)}`,
      items,
      subTotal,
      discount,
      total,
      paymentMethod: pick(PAYMENT_METHODS),
      paymentStatus: status === "done" ? "paid" : "unpaid",
      status,
      deleted: false,
      createdAt, // sẽ được override bằng bulkWrite
    });
  }

  const inserted = await Order.insertMany(ordersToInsert, { timestamps: false });
  const bulkOps = ordersToInsert.map((o, idx) => ({
    updateOne: {
      filter: { _id: (inserted[idx] as any)._id },
      update: { $set: { createdAt: o.createdAt } },
    },
  }));
  await Order.bulkWrite(bulkOps);
  log(`   ✅ Inserted ${inserted.length} orders`);

  // ────── REVIEWS ──────
  section("8/8  REVIEWS (max 150 đánh giá)");
  const REVIEW_TEXTS = [
    "Tour tuyệt vời, hướng dẫn viên nhiệt tình và chuyên nghiệp. Sẽ quay lại!",
    "Trải nghiệm không thể quên, cảnh đẹp ngoài mong đợi.",
    "Chuyến đi rất xứng đáng với số tiền bỏ ra. Recommend cho mọi người!",
    "Cảnh đẹp, đồ ăn ngon, lịch trình hợp lý. Cảm ơn TravelKa!",
    "Chất lượng vượt mong đợi, sẽ đặt lại lần sau chắc chắn.",
    "Mọi thứ đều ổn, hướng dẫn viên thân thiện và nhiệt tình.",
    "Gear chắc chắn, đúng size, ship nhanh. Rất hài lòng.",
    "Sản phẩm đúng mô tả, chất lượng tốt, đóng gói cẩn thận.",
    "Hơi đắt một chút nhưng chất lượng xứng đáng với giá tiền.",
    "Tour rất thú vị, phù hợp cho cả gia đình. Highly recommend!",
    "Lần đầu tiên tôi thật sự thư giãn trong suốt kỳ nghỉ nhờ TravelKa.",
    "Ba lô chất lượng tuyệt vời, đi được 3 chuyến rồi vẫn như mới.",
  ];

  const doneOrders = await Order.find({ status: "done", deleted: false }).limit(150).lean();
  const reviewsToInsert: any[] = [];

  for (let i = 0; i < Math.min(150, doneOrders.length + 20); i++) {
    const order: any = i < doneOrders.length ? doneOrders[i] : null;

    let itemId: string | null = null;
    let itemType: "tour" | "gear" = "tour";

    if (order?.items?.length > 0) {
      const it = pick(order.items as any[]) as any;
      itemId = it.id?.toString() || (it._id?.toString() ?? null);
      itemType = (it.type as "tour" | "gear") || "tour";
    } else if (tourIds.length > 0) {
      itemId = pick(tourIds);
      itemType = "tour";
    } else if (gearIds.length > 0) {
      itemId = pick(gearIds);
      itemType = "gear";
    }

    const accountId = order?.accountId || (accountIds.length > 0 ? pick(accountIds) : null);
    if (!itemId || !accountId) continue;

    const rating = Math.random() < 0.7 ? 5 : Math.random() < 0.6 ? 4 : 3;

    reviewsToInsert.push({
      itemId,
      itemType,
      accountId,
      orderId: order?._id,
      rating,
      content: pick(REVIEW_TEXTS),
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
    const bulkReviews = reviewsToInsert.map((r, idx) => ({
      updateOne: {
        filter: { _id: (createdReviews[idx] as any)._id },
        update: { $set: { createdAt: r.createdAt } },
      },
    }));
    await Review.bulkWrite(bulkReviews);

    // Cập nhật rating cho từng item
    const itemMap = new Map<string, number[]>();
    for (const r of reviewsToInsert) {
      const key = `${r.itemType}:${r.itemId}`;
      if (!itemMap.has(key)) itemMap.set(key, []);
      itemMap.get(key)!.push(r.rating);
    }
    for (const [key, ratings] of itemMap) {
      const [type, id] = key.split(":");
      const avg = parseFloat((ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1));
      const Model: any = type === "tour" ? Tour : Gear;
      await Model.updateOne({ _id: id }, { $set: { rating: avg, reviewCount: ratings.length } });
    }
    log(`   ✅ Inserted ${createdReviews.length} reviews & updated ratings`);
  }

  // ────── SUMMARY ──────
  const [totalCat, totalTours, totalGears, totalJournals, totalAccs, totalOrders, totalVouchers, totalReviews] =
    await Promise.all([
      Category.countDocuments(),
      Tour.countDocuments({ deleted: false }),
      Gear.countDocuments({ deleted: false }),
      Journal.countDocuments({ deleted: false }),
      Account.countDocuments({ deleted: false }),
      Order.countDocuments({ deleted: false }),
      Voucher.countDocuments({ deleted: false }),
      Review.countDocuments({ deleted: false }),
    ]);

  const revenueAgg = await Order.aggregate([
    { $match: { deleted: false, status: "done" } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);

  console.log("\n╔═══════════════════════════════════════════════╗");
  console.log("║         🎉 SEED TOÀN PHẦN HOÀN THÀNH!        ║");
  console.log("╠═══════════════════════════════════════════════╣");
  console.log(`║  📂 Categories   : ${String(totalCat).padEnd(27)}║`);
  console.log(`║  🗺️  Tours        : ${String(totalTours).padEnd(27)}║`);
  console.log(`║  🧳 Gears        : ${String(totalGears).padEnd(27)}║`);
  console.log(`║  📰 Journals     : ${String(totalJournals).padEnd(27)}║`);
  console.log(`║  👤 Accounts     : ${String(totalAccs).padEnd(27)}║`);
  console.log(`║  🛒 Orders       : ${String(totalOrders).padEnd(27)}║`);
  console.log(`║  🏷️  Vouchers     : ${String(totalVouchers).padEnd(27)}║`);
  console.log(`║  ⭐ Reviews      : ${String(totalReviews).padEnd(27)}║`);
  console.log(`║  💰 Doanh thu    : ${((revenueAgg[0]?.total || 0) / 1e6).toFixed(1)}M đ${" ".repeat(22)}║`);
  console.log("╠═══════════════════════════════════════════════╣");
  console.log("║  🔑 Mật khẩu accounts: Ccuong123             ║");
  console.log("╚═══════════════════════════════════════════════╝\n");

  await mongoose.disconnect();
  log("🔌 Disconnected. Done!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});

