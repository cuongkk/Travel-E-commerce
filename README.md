# 🌏 TravelKa — Nền tảng Đặt Tour Du lịch

> **TravelKa** là một ứng dụng web fullstack hiện đại để đặt tour du lịch trực tuyến, tích hợp thanh toán điện tử và hỗ trợ AI thông minh.

---

## ✨ Tính năng nổi bật

| Tính năng | Mô tả |
|---|---|
| 🔐 **Xác thực JWT** | Đăng ký, đăng nhập, refresh token, phân quyền Admin / Client |
| 🗺️ **Quản lý Tour** | CRUD tour, upload ảnh Cloudinary, tìm kiếm & lọc nâng cao |
| 🛒 **Giỏ hàng & Đặt hàng** | Quản lý giỏ hàng, áp dụng voucher, đặt tour |
| 💳 **Thanh toán tích hợp** | Thanh toán qua **ZaloPay** & **MoMo** (sandbox), callback & xác thực chữ ký |
| 🤖 **AI Content Generator** | Tạo nội dung SEO tự động bằng Google Gemini AI |
| 📊 **Admin Dashboard** | Thống kê doanh thu, quản lý đơn hàng, người dùng, sản phẩm |
| 📝 **Blog & Journal** | Quản lý bài viết du lịch với TinyMCE editor |
| ⭐ **Review & Đánh giá** | Hệ thống đánh giá tour theo sao |
| 🎫 **Voucher System** | Tạo và áp dụng mã giảm giá với điều kiện |
| 📧 **Gửi Email** | Xác nhận đặt tour, reset password qua Nodemailer |

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js v5
- **Database:** MongoDB + Mongoose ODM
- **Auth:** JWT (Access + Refresh Token), bcryptjs
- **Upload:** Multer + Cloudinary
- **Security:** Helmet, express-rate-limit, express-mongo-sanitize, CORS
- **AI:** Google Generative AI (Gemini)
- **Payment:** ZaloPay API, MoMo API
- **Email:** Nodemailer + Gmail SMTP
- **Validation:** Joi

### Frontend
- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** MUI (Material UI), Lucide, Phosphor Icons
- **State / Fetching:** SWR
- **Forms:** React Hook Form
- **Rich Editor:** TinyMCE
- **Charts:** Chart.js
- **Toast:** Sonner
- **Carousel:** Swiper

---

## 📁 Cấu trúc dự án

```
Project-5/
├── backend/               # Express.js REST API
│   ├── src/
│   │   ├── configs/       # Database, Cloudinary config
│   │   ├── middlewares/   # Auth, RBAC, Error, Rate limit
│   │   ├── modules/       # Feature modules (tour, auth, payment, ai, ...)
│   │   │   ├── ai/
│   │   │   ├── auth/
│   │   │   ├── payment/
│   │   │   ├── tour/
│   │   │   └── ...
│   │   ├── routes/        # Main router
│   │   ├── utils/         # Helpers (cloudinary, response, ...)
│   │   └── validates/     # Joi schemas
│   ├── .env.example
│   └── index.ts           # App entry point
│
└── frontend/              # Next.js App Router
    ├── src/
    │   ├── app/           # Pages (App Router)
    │   │   ├── (client)/  # Client-facing pages
    │   │   └── admin/     # Admin dashboard pages
    │   ├── components/    # Shared & feature components
    │   ├── hooks/         # Custom React hooks
    │   ├── interfaces/    # TypeScript types
    │   └── utils/         # Frontend utilities
    └── .env.example
```

---

## 🚀 Khởi chạy dự án

### Yêu cầu hệ thống
- Node.js >= 18
- MongoDB (local hoặc MongoDB Atlas)
- Tài khoản Cloudinary (upload ảnh)

### 1. Clone repository

```bash
git clone https://github.com/your-username/travelka.git
cd travelka
```

### 2. Cài đặt Backend

```bash
cd backend
cp .env.example .env
# Điền các biến môi trường vào .env
yarn install
yarn dev
```

> Backend chạy tại: `http://localhost:5000`

### 3. Cài đặt Frontend

```bash
cd frontend
cp .env.example .env.local
# Điền các biến môi trường vào .env.local
yarn install
yarn dev
```

> Frontend chạy tại: `http://localhost:3000`

---

## ⚙️ Biến môi trường

### Backend (`backend/.env`)

```env
DATABASE=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000

# Cloudinary
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
GMAIL_USER=your@gmail.com
GMAIL_PASS=your_app_password

# AI
GEMINI_API_KEY=your_gemini_api_key

# ZaloPay (Sandbox)
ZALOPAY_APP_ID=2554
ZALOPAY_KEY1=...
ZALOPAY_KEY2=...
ZALOPAY_CALLBACK_URL=https://yourdomain.com/payment/callback

# MoMo (Sandbox)
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=...
MOMO_SECRET_KEY=...
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🔌 API Overview

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/auth/register` | Đăng ký tài khoản |
| `POST` | `/auth/login` | Đăng nhập |
| `GET` | `/dashboard/tours` | Danh sách tour public |
| `GET` | `/dashboard/tours/:slug` | Chi tiết tour |
| `POST` | `/cart` | Thêm vào giỏ hàng |
| `POST` | `/order` | Tạo đơn hàng |
| `POST` | `/payment/zalopay` | Thanh toán ZaloPay |
| `POST` | `/payment/momo` | Thanh toán MoMo |
| `POST` | `/ai/generate-content` | Tạo nội dung AI |
| `GET` | `/health` | Health check |

---

## 🏥 Health Check

```
GET /health
→ { "status": "ok", "timestamp": "...", "uptime": ... }
```

---

## 📄 License

MIT © 2024 TravelKa Team
