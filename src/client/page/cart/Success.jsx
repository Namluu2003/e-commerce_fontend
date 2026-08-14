import { Button, Result, List, Typography, Card, Row, Space } from "antd";
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiStartCheck, apiStopCheck } from "./sussess";
import { clearBill } from "./bill";
import { formatVND } from "../../../helpers/Helpers";

const { Title, Text } = Typography;

function Success() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Lấy dữ liệu từ URL
  const amountParam = searchParams.get("amount") || "0";
  const apptransid = searchParams.get("apptransid") || "Không xác định";
  const status = searchParams.get("status") || "0";
  const itemData = searchParams.get("item"); // Lấy dữ liệu sản phẩm (JSON string)
  const billCode = searchParams.get("billcode"); // Lấy dữ liệu sản phẩm (JSON string)
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user"))
  ); // Lấy user từ localStorage
  // Kiểm tra trạng thái thanh toán
  const isSuccess = status === "1";

  // Chuyển chuỗi JSON item thành mảng object
  let items = [];
  try {
    items = itemData ? JSON.parse(decodeURIComponent(itemData)) : [];
  } catch (error) {
    console.error("Lỗi khi parse item:", error);
  }
  
  useEffect(() => {
    window.scrollTo(0, 0);
    window.dispatchEvent(new Event("cartUpdated"));
    apiStartCheck()
    clearBill()
    return ()=>{
      apiStopCheck()
    }
  }, []);
  const amount = Number(amountParam)|| 0; 
  const formattedAmount = amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  return (
    <Card style={{ backgroundColor: "white", padding: 20, minHeight: 600 }}>
      {/* <div>Mã đơn hàng: {billCode}</div> */}
      <Result
        status={isSuccess ? "success" : "error"}
        title={isSuccess ? "Cảm ơn bạn đã mua hàng!" : "Thanh toán thất bại!"}
        subTitle={
          isSuccess
            ? `Đơn hàng của bạn đã được đặt thành công với số tiền ${formattedAmount}.`
            : "Có lỗi xảy ra trong quá trình thanh toán, vui lòng thử lại!"
        }
        extra={[
          <Button type="primary" key="home" onClick={() => navigate("/")}>
            Quay về trang chủ
          </Button>,
          isSuccess && (
            <Space>
              <Button key="buy" onClick={() => navigate("/cart")}>
                Giỏ hàng
              </Button>
             {user?.id?( <Button
                key="purchaseorder"
                onClick={() => navigate("/purchaseorder")}
              >
               Xem đơn mua
              </Button>):""}
            </Space>
          ),
        ]}
      />

      {/* Hiển thị danh sách sản phẩm nếu có */}
      {items.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <Title level={4}>Chi tiết đơn hàng:</Title>
          <List
            bordered
            dataSource={items}
            renderItem={(item) => (
              <List.Item>
                <Text strong>{item.itemname}</Text> - {item.itemquantity} x{" "}
                {item.itemprice.toLocaleString()} VND
              </List.Item>
            )}
          />
          <Title level={4} style={{ marginTop: 10 }}>
            Tổng tiền: {parseInt(amount).toLocaleString()} VND
          </Title>
        </div>
      )}
    </Card>
  );
}

export default Success;
