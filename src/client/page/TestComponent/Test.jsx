import { Spin } from 'antd';
import React, { useState, useEffect } from 'react';
import Product from '../products/Product';
import ProductDetail from './ProductDetail';

function ProductList() {
  const [brands, setBrands] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true); // Để theo dõi trạng thái tải

  // useEffect(() => {
  //   const fetchBrands = async () => {
  //     const token = localStorage.getItem('token'); // Lấy token từ localStorage (hoặc từ nơi khác)

  //     // Kiểm tra nếu không có token
  //   //   if (!token) {
    //     console.error('Token is missing!');
    //     return;
    //   }

  //     try {
  //       const response = await fetch('http://localhost:8080/api/brand', {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json', // Chỉ định Content-Type là JSON
  //           'Authorization': `Bearer ${token}`, // Thêm token vào Authorization header
  //         },
  //       });

  //       // Kiểm tra nếu response trả về thành công
  //       if (response.ok) {
  //         const data = await response.json(); // Chuyển response thành JSON
  //         console.log(data);

  //         // Lấy message và dữ liệu từ API
  //         if (data && data.message) {
  //           setMessage(data.message); // Cập nhật message vào state
  //         }

  //         if (data && Array.isArray(data.data)) {
  //           setBrands(data.data); // Cập nhật danh sách brands vào state
  //         }
  //       } else {
  //         console.error('Failed to fetch data');
  //       }
  //     } catch (error) {
  //       console.error('Error fetching brands:', error);
  //     } finally {
  //       setLoading(false); // Hoàn tất việc tải dữ liệu
  //     }
  //   };

  //   fetchBrands(); // Gọi hàm fetch khi component mount
  // }, []); // [] chỉ chạy 1 lần khi component mount

  // Hiển thị loading trong khi dữ liệu chưa được tải
  // if (loading) {
  //   return (
  //     <div>
  //       {/* <LoadingOutlined spin /> Hiển thị biểu tượng loading */}
  //       <span> Loading...</span>
  //     </div>
  //   );
  // }

  return (
    <div>
      {/* Hiển thị thông báo message từ API nếu có */}

   
      <Product/>
      {/* <ProductDetail/> */}
      
    </div>
  );
}

export default ProductList;
