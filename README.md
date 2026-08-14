# DATN Frontend — React + Vite

Phần **Frontend** của đồ án tốt nghiệp (DATN) — trang web bán giày thời trang, xây dựng bằng **React + Vite**, quản trị bằng **Ant Design**.

## ✨ Công nghệ

- **React 18 + Vite 6**
- **Ant Design** (UI component) + React Bootstrap
- **React Router** (điều hướng)
- **Axios** (gọi API) với interceptor gắn `Bearer token`
- **Zustand / React Context** (quản lý state)
- **WebSocket (STOMP / SockJS)** — thông báo realtime
- **Firebase, Google OAuth, ZXing (QR), PDF viewer, Recharts (thống kê)...**

## 📁 Cấu trúc thư mục (chính)

```
src/
├── admin/            # Trang quản trị (sản phẩm, hoá đơn, nhân viên, voucher, thống kê...)
├── client/           # Trang người dùng
├── auth/             # Đăng nhập / đăng ký
├── customer/         # Tài khoản khách hàng
├── routers/          # Định nghĩa route (Admin / Auth / Customer)
├── store/            # State (ProductContext...)
├── utils/            # axiosInstance, in hoá đơn...
├── websocket/        # WebSocket service
├── helpers/          # Helpers.js (baseUrl, hàm tiện ích)
└── App.jsx, main.jsx
```

## ✅ Yêu cầu

- **Node.js 18+**
- **npm** hoặc **yarn**

## 🚀 Chạy dự án local

```bash
# Cài dependencies
npm install        # hoặc: yarn

# Chạy môi trường dev (Vite dev server)
npm run dev        # hoặc: yarn dev
```

Mặc định truy cập: **http://localhost:5173**

### Build production

```bash
npm run build      # output vào thư mục dist/
npm run preview    # xem trước bản build
```

## ⚙️ Biến môi trường

Tạo file **`.env`** ở thư mục gốc dự án (không commit lên Git):

| Biến                                         | Mô tả                                                                                          |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `VITE_API_URL`                               | URL backend API. VD: `http://localhost:8080` (dev) hay `https://<backend>.onrender.com` (prod) |
| `VITE_GHN_API_KEY` / `VITE_GHN_API_KEY_CONG` | API key GHN (vận chuyển)                                                                       |
| `VITE_SE_PAY_API_KEY`                        | API key thanh toán                                                                             |
| `VITE_OPENAI_API_KEY`                        | API key OpenAI                                                                                 |
| `VITE_GEMINI_URL`                            | URL Gemini                                                                                     |
| `VITE_GOOGLE_CLIENT_KEY`                     | Google OAuth client key                                                                        |

> `baseUrl` trong `src/helpers/Helpers.js` đọc từ `VITE_API_URL` (nếu không cài biến thì fallback về `http://localhost:8080`).

## 🔗 Kết nối Backend

- Frontend gọi backend qua **Axios** (`src/utils/axiosInstance.js`).
- Backend mặc định: `http://localhost:8080` (Spring Boot) — xem thêm README backend.

## 🚀 Deploy (Vercel)

1. Kết nối repo GitHub `e-commerce_fontend` với Vercel.
2. **Framework Preset**: Vite — Build: `npm run build` — Output: `dist`.
3. Thêm biến môi trường `VITE_API_URL` = URL backend trên cloud.
4. Deploy → nhận URL `https://<tên>.vercel.app`.

## 🔗 Repo

- Frontend: `https://github.com/Namluu2003/e-commerce_fontend`
