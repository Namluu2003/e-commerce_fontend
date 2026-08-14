import React, { useState, useEffect, PureComponent } from "react";
import { Card, Button, Table, Row, Col, DatePicker, Radio } from "antd";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell, Tooltip, Legend, RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { FileExcelOutlined } from "@ant-design/icons";
import axios from "axios";
import ProductOrderChart from "./ProductOrderChart.jsx";
// import {convertBillStatusToString} from '../../helpers/Helpers.js';

const { RangePicker } = DatePicker;

const ChartStatusBill = () => {
  const [timeFilter, setTimeFilter] = useState("day");
  const [customRange, setCustomRange] = useState(null);
  const [apiData, setApiData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [tableTitle, setTableTitle] = useState("Thống kê sản phẩm bán chạy");
  const [chartTitle, setChartTitle] = useState("Biểu đồ trạng thái đơn hàng");
  const pageSize = 5; // Số lượng sản phẩm mỗi trang
  const [currentPage, setCurrentPage] = useState(1); // State lưu trang hiện tại
  
  const apiUrls = {
    day: "http://localhost:8080/api/admin/statistical/bestday",
    week: "http://localhost:8080/api/admin/statistical/bestweek",
    month: "http://localhost:8080/api/admin/statistical/bestmonth",
    year: "http://localhost:8080/api/admin/statistical/bestyear",
    custom: "http://localhost:8080/api/admin/statistical/best-custom",
  };

  const chartApiUrls = {
    day: "http://localhost:8080/api/admin/statistical/chartDay",
    week: "http://localhost:8080/api/admin/statistical/chartWeek",
    month: "http://localhost:8080/api/admin/statistical/chartMonth",
    year: "http://localhost:8080/api/admin/statistical/chartYear",
    custom: "http://localhost:8080/api/admin/statistical/chartCustom",
  }

  useEffect(() => {


    const fetchTableData = async () => {
      try {
        const url = customRange ? apiUrls.custom : apiUrls[timeFilter];
        const params = customRange
          ? { startDate: customRange[0].format("YYYY-MM-DD"), endDate: customRange[1].format("YYYY-MM-DD") }
          : {};

        console.log("Gọi API Table: ", url, params);
        const response = await axios.get(url, { params });

        if (response.data && Array.isArray(response.data.data)) {
          const formattedData = response.data.data.map((item, index) => ({
            key: index,
            productName: item.productName || "...",
            typeName: item.typeName || "...",
            colorName: item.colorName || "...",
            sizeName: item.sizeName || "...",
            genderName: item.genderName || "...",
            soleName: item.soleName || "...",
            price: item.price || 0,
            totalQuantitySold: item.totalQuantitySold || 0,
          }));

          setApiData(formattedData);
        } else {
          setApiData([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu bảng từ API: ", error);
        setApiData([]);
      }
    };
    const fetchChartData = async () => {
      try {
        const url = customRange ? chartApiUrls.custom : chartApiUrls[timeFilter];
        const params = customRange
          ? { startDate: customRange[0].format("YYYY-MM-DD"), endDate: customRange[1].format("YYYY-MM-DD") }
          : {};

        console.log("Gọi API Biểu đồ: ", url, params);
        const response = await axios.get(url, { params });

        if (response.data && response.data.data) {
          const apiResponse = response.data.data;

          // Chuyển đổi object thành array
          const formattedChartData = Object.keys(apiResponse).map((key) => ({
            name: STATUS_LABELS[key.replace("Percent", "").toUpperCase()] || key.replace("Percent", ""),
            uv: apiResponse[key],
            fill: getColorByStatus(key.replace("Percent", "").toUpperCase()),
          }));

          setChartData(formattedChartData);
        } else {
          setChartData([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu biểu đồ từ API: ", error);
        setChartData([]);
      }
    };




    fetchTableData();
    fetchChartData();
  }, [timeFilter, customRange]);


  // Hàm lấy màu theo trạng thái
  const getColorByStatus = (status) => {
    const colorMap = {
      "CHOXACNHAN": "#8884d8",
      "DAXACNHAN": "green",
      "CHOVANCHUYEN": "purple",
      "DANGVANCHUYEN": "brown",
      "DATHANHTOAN": "gold",
      "DAHOANTHANH": "orange",
      "DAHUY": "#ff8042",
    };
    return colorMap[status] || "#ccc"; // Mặc định màu xám nếu không có trong danh sách
  };
  const STATUS_LABELS = {
    "CHOXACNHAN": "Chờ xác nhận",
    "DAXACNHAN": "Đã xác nhận",
    "CHOVANCHUYEN": "Chờ vận chuyển",
    "DANGVANCHUYEN": "Đang vận chuyển",
    "DATHANHTOAN": "Đã thanh toán",
    "DAHOANTHANH": "Đã hoàn thành",
    "DAHUY": "Đã hủy",
  };

  const handleCustomRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setCustomRange(dates);

      // Cập nhật tiêu đề theo ngày đã chọn
      const formattedTitle = `Thống kê sản phẩm bán chạy ${dates[0].format("DD/MM/YYYY")} - ${dates[1].format("DD/MM/YYYY")}`;
      setTableTitle(formattedTitle);
      setChartTitle(`Biểu đồ trạng thái đơn hàng ${dates[0].format("DD/MM/YYYY")} - ${dates[1].format("DD/MM/YYYY")}`);

    }
  };


  const handleFilterChange = (filterType, label) => {
    setTimeFilter(filterType);
    setCustomRange(null); // Đặt về null khi chọn bộ lọc khác
    setTableTitle(`Thống kê sản phẩm bán chạy ${label.toLowerCase()}`);
    setChartTitle(`Biểu đồ trạng thái đơn hàng ${label.toLowerCase()}`);

  };


  const columns = [
    //thiếu ảnh 
    // { title: "Ảnh", dataIndex: "id", key: "id", align: "center", render: (url) => <img src={"https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQKanIMPiEvON96i3FghI3bmA5It_yxPA011xHLSTvpmbA2sicQ-MNOlawFLVIfhoPdedAtw8ft-30zbKjBJOoPNwpOmQkQPsbv7VqmaXX8fR0Ep0O6xrgbIfNNaSDTMjX37w&usqp=CAc"} style={{ width: 50 }} /> },
    {title: "STT",dataIndex: "stt",key: "stt",width: "3rem",  align: "center",render: (_, __, index) => (currentPage - 1) * pageSize + index + 1, },
    { title: "Tên sản phẩm", dataIndex: "productName", key: "productName", align: "center" },
    { title: "Loại giày", dataIndex: "typeName", key: "typeName", align: "center" },
    { title: "Màu sắc", dataIndex: "colorName", key: "colorName", align: "center" },
    { title: "Kích cỡ", dataIndex: "sizeName", key: "sizeName", align: "center" },
    { title: "Đế giày", dataIndex: "soleName", key: "soleName", align: "center" },
    // { title: "Giới tính", dataIndex: "genderName", key: "genderName", align: "center" },
    { title: "Giá bán", dataIndex: "price", key: "price", align: "center", render: (price) => `${price.toLocaleString()} VNĐ` },
    { title: "Số lượng bán", dataIndex: "totalQuantitySold", key: "totalQuantitySold", align: "center" },
  ];


  return (
    <Card>
      <Row gutter={[16, 16]} >
        {/* Nút lọc thời gian dạng Radio */}
        <Col span={24}>
          <Card
            style={{
              marginBottom: -10,
              background: "white",
              color: "black",
              alignItems: "center",
              border: "none",
              display: "flex",
              justifyContent: "flex-end",
              marginTop: -10,

            }}
          >

            {/* Bộ lọc thời gian */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Radio.Group
                onChange={(e) => {
                  const selectedOption = [
                    { label: "Hôm nay", value: "day" },
                    { label: "Tuần", value: "week" },
                    { label: "Tháng", value: "month" },
                    { label: "Năm", value: "year" },
                  ].find((item) => item.value === e.target.value);

                  handleFilterChange(e.target.value, selectedOption.label);
                }}
                value={timeFilter}
                style={{ display: "flex", gap: "12px" }}
              >

                {[
                  { label: "Hôm nay", value: "day" },
                  { label: "Tuần", value: "week" },
                  { label: "Tháng", value: "month" },
                  { label: "Năm", value: "year" },
                ].map(({ label, value }) => (
                  <Radio
                    key={value}
                    value={value}
                    style={{
                      fontSize: "12px",
                    }}
                  >
                    {label}
                  </Radio>
                ))}
              </Radio.Group>
            </div>

            {/* RangePicker hiển thị luôn */}
            <RangePicker
              style={{ marginLeft: 75, width: "250px", height: "25px", marginTop: 10 }}
              value={customRange}
              format="DD/MM/YYYY"
              onChange={handleCustomRangeChange}
            />
          </Card>
        </Col>


        {/* Bảng thống kê sản phẩm */}
        <Col xs={24} md={14}>
          <Card
            title={<span style={{ color: "black", fontSize: 15 }}>{tableTitle}</span>}
            style={{
              background: "white",
              height: "100%",
              color: "black"
            }}
          >
            <div style={{
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              border: "1px solid #2e95dd"
            }}>
              <Table
                dataSource={apiData}
                columns={columns}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: apiData.length,
                  onChange: (page) => setCurrentPage(page),
                }}
                bordered={false}
              />
            </div>
          </Card>
        </Col>

        {/* Biểu đồ trạng thái đơn hàng */}
        <Col xs={24} md={10}>
          <Card
            title={<span style={{ color: "balck", fontSize: 15 }}>{chartTitle}</span>}
            style={{
              background: "white",
              height: "100%",
            }}
          >
            <ResponsiveContainer width="100%" height={350}>
              {chartData.length > 0 ? (
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="uv"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#2e95dd"
                    label={({ percent }) => (percent > 0 ? `${(percent * 100).toFixed(2)}%` : '')}
                    labelLine={({ percent }) => percent > 0} // Ẩn gạch nếu giá trị là 0

                  />
                  <Tooltip
                    content={({ payload }) =>
                      payload.length ? <span>{payload[0].name}: {payload[0].value}%</span> : null
                    }
                  />

                  <Legend content={({ payload }) => (
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {payload.map((entry, index) => (
                        <div key={`legend-${index}`} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: entry.color
                            }}
                          />
                          <span style={{ fontSize: "12px" }}>{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  )} />

                </PieChart>
              ) : (
                <p style={{ textAlign: "center", color: "gray", fontSize: 16 }}>
                  Không có dữ liệu để hiển thị
                </p>
              )}
            </ResponsiveContainer>
          </Card>
        </Col>


      </Row>



    </Card>
  );
};

export default ChartStatusBill;
