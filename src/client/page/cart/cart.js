import { v4 as uuidv4 } from "uuid";

export const getDeviceId = () => {
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = uuidv4(); // Tạo ID duy nhất
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
};

export const addToCart = (product) => {
  const deviceId = getDeviceId();
  let cart = JSON.parse(localStorage.getItem(`cart_${deviceId}`)) || [];

  // Kiểm tra sản phẩm đã tồn tại trong giỏ hàng hay chưa
  const existingProductIndex = cart.findIndex(
    (item) => item.productDetailId === product.productDetailId
  );

  if (existingProductIndex !== -1) {
    // Nếu sản phẩm đã có trong giỏ, tăng số lượng
    cart[existingProductIndex].quantityAddCart += product.quantityAddCart;
  } else {
    // Nếu chưa có, thêm mới vào giỏ hàng
    cart.push(product);
  }

  // Lưu lại vào localStorage
  localStorage.setItem(`cart_${deviceId}`, JSON.stringify(cart));

  // Gửi sự kiện cập nhật giỏ hàng để UI tự động render lại
  window.dispatchEvent(new Event("cartUpdated"));
};

// Khi người dùng mở lại trình duyệt
export const getCart = () => {
  const deviceId = getDeviceId();
  return JSON.parse(localStorage.getItem(`cart_${deviceId}`)) || [];
};

export const clearCart = () => {
  const deviceId = getDeviceId();
  localStorage.removeItem(`cart_${deviceId}`);

  // Cập nhật giỏ hàng trên toàn ứng dụng
  window.dispatchEvent(new Event("cartUpdated"));
};
export const removeFromCart = (productDetailId) => {
  const deviceId = getDeviceId();
  let cart = JSON.parse(localStorage.getItem(`cart_${deviceId}`)) || [];

  // Lọc ra các sản phẩm không trùng với productId cần xóa
  cart = cart.filter((product) => product.productDetailId !== productDetailId);

  localStorage.setItem(`cart_${deviceId}`, JSON.stringify(cart));

  // Cập nhật giỏ hàng trên toàn ứng dụng
  window.dispatchEvent(new Event("cartUpdated"));
};
export const removeBillFromCart = (productsToRemove) => {
  const deviceId = getDeviceId();
  const cart = JSON.parse(localStorage.getItem(`cart_${deviceId}`)) || [];

  // Lọc ra các sản phẩm KHÔNG có trong danh sách cần xóa
  const updatedCart = cart.filter(
    (cartItem) =>
      !productsToRemove.some(
        (billItem) => cartItem.productDetailId === billItem.productDetailId
      )
  );

  // Lưu lại giỏ hàng sau khi xóa
  localStorage.setItem(`cart_${deviceId}`, JSON.stringify(updatedCart));

  // Cập nhật giỏ hàng trên toàn ứng dụng
  window.dispatchEvent(new Event("cartUpdated"));
};
