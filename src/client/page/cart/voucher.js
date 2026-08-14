import { v4 as uuidv4 } from "uuid";

export const getDeviceId = () => {
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = uuidv4(); // Tạo ID duy nhất
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
};

export const addToVoucher = (products) => {
  const deviceId = getDeviceId();
  let cart = JSON.parse(localStorage.getItem(`voucher_${deviceId}`)) || [];
  cart.push(products);

  // Lưu lại vào localStorage
  localStorage.setItem(`voucher_${deviceId}`, JSON.stringify(cart));

  // Gửi sự kiện cập nhật giỏ hàng để UI tự động render lại (nếu cần)
};

// Khi người dùng mở lại trình duyệt
export const getVoucher = () => {
  const deviceId = getDeviceId();
  return JSON.parse(localStorage.getItem(`voucher_${deviceId}`)) || [];
};

export const clearVoucher = () => {
  const deviceId = getDeviceId();
  localStorage.removeItem(`voucher_${deviceId}`);
};
