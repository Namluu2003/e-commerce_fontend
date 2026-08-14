import { createContext, useContext, useState } from "react";

// 1️⃣ Tạo Context
const ProductContext = createContext();

// 2️⃣ Tạo Provider để bọc ứng dụng
export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]); // Lưu danh sách sản phẩm

  // Hàm cập nhật danh sách sản phẩm
  const updateProducts = (newProducts) => {
    setProducts(newProducts);
  };

  return (
    <ProductContext.Provider value={{ products, updateProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

// 3️⃣ Hook để dùng trong component
export const useProduct = () => {
  return useContext(ProductContext);
};
