# TravelKa — Backend API (Express.js + TypeScript)

REST API cho **TravelKa**, xây dựng bằng Express.js v5 + TypeScript + MongoDB.

## Tech Stack

- **Express.js v5** — Web framework
- **TypeScript** — Type-safe development
- **MongoDB + Mongoose** — Database
- **JWT** — Authentication (Access + Refresh Token)
- **Cloudinary** — Image upload & storage
- **Google Gemini AI** — AI content generation
- **ZaloPay / MoMo** — Payment gateway integration
- **Nodemailer** — Email (Gmail SMTP)
- **Joi** — Request validation
- **Helmet + Rate Limit** — Security hardening

## Getting Started

```bash
# Cài đặt dependencies
yarn install

# Tạo file môi trường
cp .env.example .env
# → Điền các thông tin cần thiết

# Chạy development server
yarn dev
```

> API chạy tại: `http://localhost:5000`

## Scripts

| Lệnh | Mô tả |
|---|---|
| `yarn dev` | Khởi chạy development server (nodemon) |
| `yarn build` | Compile TypeScript sang JavaScript |
| `yarn start` | Chạy compiled production server |
| `yarn seed` | Seed dữ liệu mẫu vào database |

## API Endpoints

### Auth
| Method | Route | Mô tả |
|---|---|---|
| POST | `/auth/register` | Đăng ký tài khoản |
| POST | `/auth/login` | Đăng nhập |
| POST | `/auth/refresh-token` | Làm mới access token |
| POST | `/auth/logout` | Đăng xuất |

### Public
| Method | Route | Mô tả |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/dashboard/tours` | Danh sách tour |
| GET | `/dashboard/tours/:slug` | Chi tiết tour theo slug |
| GET | `/review-client/:tourId` | Đánh giá của tour |

### Client (Yêu cầu JWT)
| Method | Route | Mô tả |
|---|---|---|
| GET/POST | `/cart` | Giỏ hàng |
| GET/POST | `/order` | Đặt tour / xem đơn hàng |
| POST | `/payment/zalopay` | Tạo giao dịch ZaloPay |
| POST | `/payment/momo` | Tạo giao dịch MoMo |
| GET | `/voucher-client` | Danh sách voucher |

### Admin (Yêu cầu JWT + Role Admin)
| Method | Route | Mô tả |
|---|---|---|
| GET/POST/PATCH/DELETE | `/tour` | Quản lý tour |
| GET/POST/PATCH/DELETE | `/gear` | Quản lý thiết bị |
| GET/POST/PATCH/DELETE | `/category` | Quản lý danh mục |
| GET/POST/PATCH/DELETE | `/journal` | Quản lý blog |
| GET/PATCH | `/admin/order` | Quản lý đơn hàng |
| GET/PATCH | `/user` | Quản lý người dùng |
| GET | `/admin/dashboard` | Thống kê |
| POST | `/ai/generate-content` | Tạo nội dung AI |

## Cấu trúc thư mục

```
src/
├── configs/        # Database, Cloudinary setup
├── interfaces/     # TypeScript interfaces
├── middlewares/    # Auth, RBAC, Error handler, Validate
├── modules/        # Feature modules
│   ├── ai/         # Gemini AI content generator
│   ├── auth/       # JWT Authentication
│   ├── cart/       # Shopping cart
│   ├── dashboard/  # Public APIs
│   ├── order/      # Order management
│   ├── payment/    # ZaloPay & MoMo
│   ├── tour/       # Tour CRUD
│   └── ...
├── routes/         # Express router
├── types/          # Custom types
├── utils/          # Helpers (response, cloudinary, email)
└── validates/      # Joi validation schemas
```

## Biến môi trường

Xem file `.env.example` để biết tất cả các biến cần thiết.
