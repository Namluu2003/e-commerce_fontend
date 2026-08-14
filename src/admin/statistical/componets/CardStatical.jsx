import React, { useState, useEffect } from "react";
import { Table, InputNumber, Card, Row, Col, Spin } from "antd";
import { CalendarOutlined, RiseOutlined, FallOutlined } from "@ant-design/icons";

const Dashboard = () => {
  return (
    <>

    <div >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <LowStockProducts />
        </Col>
        <Col span={12}>
          <StatisticsSummary />
        </Col>
      </Row>
    </div>  
      </>

  );
};

// Component hiển thị danh sách sản phẩm sắp hết hàng
const LowStockProducts = () => {
  const [products, setProducts] = useState([]); // State lưu danh sách sản phẩm
  const [quantity, setQuantity] = useState(100); // State lưu số lượng nhập vào
  const pageSize = 5; // Số lượng sản phẩm mỗi trang
  const [currentPage, setCurrentPage] = useState(1); // State lưu trang hiện tại


  // Gọi API khi component mount hoặc khi quantity thay đổi
  useEffect(() => {
    const fetchData = async () => {
      if (quantity < 1) return; // Đảm bảo quantity hợp lệ

      try {
        const response = await fetch(`http://localhost:8080/api/admin/statistical/minProduct?quantity=${quantity}`);
        const result = await response.json();

        console.log("API response:", result);

        if (result && result.data && Array.isArray(result.data)) {
          setProducts(result.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching low stock products:", error);
      }
    };
    fetchData();
  }, [quantity]); // Dependency array đảm bảo fetch lại khi quantity thay đổi

  const columns = [
    
    // { title: "Ảnh", dataIndex: "id", key: "id",  align: "center", render: (url) => <img src={"https://res.cloudinary.com/dieyhvcou/image/upload/v1742293066/5f47e7da60955df9310650bde6001777_bqij6b.webp"} alt="Product" style={{ width: 50 }} /> },
    {title: "STT",dataIndex: "stt",key: "stt",width: "3rem",  align: "center",render: (_, __, index) => (currentPage - 1) * pageSize + index + 1, },
    { title: "Tên sản phẩm", dataIndex: "productName", key: "productName" ,  align: "center"},
    { title: "Loại giày", dataIndex: "typeName", key: "typeName",  align: "center" },
    { title: "Màu sắc", dataIndex: "colorName",  align: "center", key: "colorName" },
    { title: "Kích cỡ", dataIndex: "sizeName",  align: "center", key: "sizeName" },
    { title: "Đế giày", dataIndex: "soleName",  align: "center", key: "soleName" },
    { title: "Giới tính", dataIndex: "genderName",  align: "center", key: "genderName" },
    { title: "Giá bán", dataIndex: "price",  align: "center", key: "price" },
    { title: "Số lượng còn lại", dataIndex: "quantity",  align: "center", key: "quantity" },
  ];

  return (   
    <Card
      title="Danh sách sản phẩm sắp hết hàng"
      style={{
        marginBottom: 16,
        background: "white",
        color: "black",
        borderRadius: "12px",
        padding: "16px",
      }}
      headStyle={{ color: "black" }}
    >
      {/* Ô nhập số lượng */}
      <InputNumber
        min={1}
        max={500000}
        value={quantity}
        onChange={(value) => value !== null && setQuantity(value)}
        style={{ marginBottom: "16px",  border:"1px solid #2e95dd"
        }}
      />

      {/* Bọc Table trong div bo tròn */}
      <div style={{ 
        borderRadius: "12px", 
        overflow: "hidden", 
        boxShadow: "0 4px 10px rgba(0,0,0,0.15)" ,
        border:"1px solid #2e95dd"

      }}>
        <Table
          columns={columns}
          dataSource={products.map((item, index) => ({ ...item, key: index }))}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: products.length,
            onChange: (page) => setCurrentPage(page),
          }}
          bordered={false} 
        />
      </div>
    </Card>
  );
};


// Component hiển thị thống kê tổng hợp

const StatisticsSummary = () => {
  const [statistics, setStatistics] = useState({ monthly: null, yearly: null,monthPro:null,yearPro:null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const [monthlyResponse, yearlyResponse,monthProductResponse,yearProductResponse] = await Promise.all([
          fetch("http://localhost:8080/api/admin/statistical/growthRateMonth"),
          fetch("http://localhost:8080/api/admin/statistical/growthRateYear"),
          fetch("http://localhost:8080/api/admin/statistical/growthRateProductM"),
          fetch("http://localhost:8080/api/admin/statistical/growthRateProductY"),

        ]);

        const monthlyData = await monthlyResponse.json();
        const yearlyData = await yearlyResponse.json();
        const monthProduct = await monthProductResponse.json();
        const yearProduct = await yearProductResponse.json();


        console.log("Monthly API response:", monthlyData);
        console.log("Yearly API response:", yearlyData);

        // Kiểm tra dữ liệu
        const monthly = monthlyData.data?.length ? monthlyData.data[0] : null;
        const yearly = yearlyData.data?.length ? yearlyData.data[0] : null;
        const monthPro = monthProduct.data?.length ? monthProduct.data[0] : null;
        const yearPro = yearProduct.data?.length ? yearProduct.data[0] : null;


        setStatistics({
          monthly: {
            revenue: monthly?.revenue || 0,
            percentageChange: parseFloat(monthly?.percentageChange) || 0, // Chuyển đổi sang số
          },
          yearly: {
            revenue: yearly?.revenue || 0,
            percentageChange: parseFloat(yearly?.percentageChange) || 0, // Chuyển đổi sang số
          },
          monthPro: {
            quantityMonth: monthPro?.quantityMonth || 0,
            percentageChange: parseFloat(monthPro?.percentageChange) || 0,
          },
          yearPro: {
            quantityYear: yearPro?.quantityYear || 0,
            percentageChange: parseFloat(yearPro?.yearPercentageChange) || 0,
          },
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  return (
    
    <Card title="Thống kê tốc độ phát triển" style={{
      marginBottom: 16,
      background: "white",
      color: "red",
      borderRadius: "12px",
      padding: "16px",
    }}
    headStyle={{ color: "black" }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card style={{ background: "white", color: "black", minHeight: "100px" }}>
            {loading ? (
              <Spin tip="Đang tải dữ liệu..." style={{ display: "flex", justifyContent: "center" }} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Doanh thu năm */}
                  <Card style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <CalendarOutlined style={{ fontSize: "18px",color:"orange" }} />
                        <span >Doanh thu năm</span>
                      </div>
                      <span>{statistics.yearly?.revenue.toLocaleString()} VND</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>{statistics.yearly?.percentageChange}%</span>
                        {statistics.yearly?.percentageChange >= 0 ? (
                          <RiseOutlined style={{ color: "#00FF00", fontSize: "18px" }} />
                        ) : (
                          <FallOutlined style={{ color: "red", fontSize: "18px" }} />
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Doanh thu tháng */}
                  <Card style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <CalendarOutlined style={{ fontSize: "18px",color:"orange" }} />
                        <span>Doanh thu tháng</span>
                      </div>
                      <span>{statistics.monthly?.revenue.toLocaleString()} VND</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>{statistics.monthly?.percentageChange}%</span>
                        {statistics.monthly?.percentageChange >= 0 ? (
                          <RiseOutlined style={{ color: "#00FF00", fontSize: "18px" }} />
                        ) : (
                          <FallOutlined style={{ color: "red", fontSize: "18px" }} />
                        )}
                      </div>
                    </div>
                  </Card>
                   {/* Đơn hàng năm */}
                   <Card style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <CalendarOutlined style={{ fontSize: "18px",color:"orange" }} />
                        <span>Đơn hàng đã bán trong năm</span>
                      </div>
                      <span>{statistics.yearPro?.quantityYear.toLocaleString()} ĐƠN</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>{statistics.yearPro?.percentageChange}%</span>
                        {statistics.yearPro?.percentageChange >= 0 ? (
                          <RiseOutlined style={{ color: "#00FF00", fontSize: "18px" }} />
                        ) : (
                          <FallOutlined style={{ color: "red", fontSize: "18px" }} />
                        )}
                      </div>
                    </div>
                  </Card>
                   {/* Đơn hàng tháng */}
                   <Card style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <CalendarOutlined style={{ fontSize: "18px",color:"orange" }} />
                        <span>Đơn hàng đã bán trong tháng</span>
                      </div>
                      <span>{statistics.monthPro?.quantityMonth.toLocaleString()} ĐƠN</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>{statistics.monthPro?.percentageChange}%</span>
                        {statistics.monthPro?.percentageChange >= 0 ? (
                          <RiseOutlined style={{ color: "#00FF00", fontSize: "18px" }} />
                        ) : (
                          <FallOutlined style={{ color: "red", fontSize: "18px" }} />
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </Card>
  );
};
export default Dashboard;
