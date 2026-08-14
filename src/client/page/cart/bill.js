import { v4 as uuidv4 } from "uuid";

export const getDeviceId = () => {
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = uuidv4(); // Tạo ID duy nhất
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
};

export const addToBill = (products) => {
    const deviceId = getDeviceId();
    let cart = JSON.parse(localStorage.getItem(`bill_${deviceId}`)) || [];
  
    // Đảm bảo `products` là một mảng
    if (!Array.isArray(products)) {
      products = [products]; // Nếu là object, chuyển thành mảng có 1 phần tử
    }
  
    // Lặp qua từng sản phẩm để thêm vào giỏ hàng
    products.forEach((product) => {
      const existingProductIndex = cart.findIndex(
        (item) => item.productDetailId === product.productDetailId
      );
  
      if (existingProductIndex !== -1) {
        // Nếu sản phẩm đã có trong giỏ, tăng số lượng
        cart[existingProductIndex].quantityAddCart = product.quantityAddCart;
      } else {
        // Nếu chưa có, thêm mới vào giỏ hàng
        cart.push(product);
      }
    });
  
    // Lưu lại vào localStorage
    localStorage.setItem(`bill_${deviceId}`, JSON.stringify(cart));
  
    // Gửi sự kiện cập nhật giỏ hàng để UI tự động render lại (nếu cần)
  };
  
// Khi người dùng mở lại trình duyệt
export const getBill = () => {
  const deviceId = getDeviceId();
  return JSON.parse(localStorage.getItem(`bill_${deviceId}`)) || [];
};

export const clearBill = () => {
  const deviceId = getDeviceId();
  localStorage.removeItem(`bill_${deviceId}`);
};
