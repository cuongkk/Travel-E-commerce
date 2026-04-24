# TravelKa — Frontend (Next.js)

Giao diện người dùng của **TravelKa**, xây dựng bằng Next.js 16 App Router, Tailwind CSS và TypeScript.

## Tech Stack

- **Next.js 16** — App Router, Server Components, Streaming
- **TypeScript** — Type-safe development
- **Tailwind CSS v4** — Utility-first styling
- **MUI (Material UI)** — Admin UI components
- **SWR** — Data fetching & caching
- **React Hook Form** — Form management
- **TinyMCE** — Rich text editor
- **Chart.js** — Analytics charts
- **Sonner** — Toast notifications
- **Swiper** — Touch-enabled sliders

## Getting Started

```bash
# Cài đặt dependencies
yarn install

# Tạo file môi trường
cp .env.example .env.local
# → Điền NEXT_PUBLIC_API_URL vào .env.local

# Chạy development server
yarn dev
```

> Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt.

## Scripts

| Lệnh | Mô tả |
|---|---|
| `yarn dev` | Khởi chạy development server |
| `yarn build` | Build production bundle |
| `yarn start` | Chạy production server |
| `yarn lint` | Kiểm tra lỗi ESLint |

## Cấu trúc thư mục

```
src/
├── app/
│   ├── (client)/          # Trang dành cho người dùng
│   │   ├── (homepage)/    # Trang chủ
│   │   ├── (dashboard)/   # Checkout, giỏ hàng, đơn hàng
│   │   └── tour/          # Chi tiết tour
│   ├── admin/             # Dashboard quản trị
│   │   ├── tours/
│   │   ├── orders/
│   │   ├── users/
│   │   └── ...
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── features/          # Feature-specific components
│   ├── layout/            # Header, Footer, Sidebar
│   └── ui/                # Shared UI (Button, Modal, ...)
├── hooks/                 # Custom React hooks
├── interfaces/            # TypeScript interfaces
└── utils/                 # Helper functions, API calls
```

## Biến môi trường

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```
