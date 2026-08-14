# =============================================
# Stage 1: Build ứng dụng React với Vite
# =============================================
FROM node:18-alpine AS build

WORKDIR /app

# Sao chép package.json và package-lock.json để tận dụng Docker layer cache
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci

# Sao chép toàn bộ mã nguồn (mã đã được lọc bởi .dockerignore)
COPY . .

# Build ứng dụng React
RUN npm run build

# =============================================
# Stage 2: Chạy ứng dụng với Nginx
# =============================================
FROM nginx:alpine

# Sao chép build output vào thư mục Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Ghi đè cấu hình Nginx mặc định bằng cấu hình SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose cổng 80
EXPOSE 80

# Khởi chạy Nginx
CMD ["nginx", "-g", "daemon off;"]