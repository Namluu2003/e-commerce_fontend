import React, { useState, useEffect, PureComponent } from "react";
import { Card, Button, Table, Row, Col, DatePicker } from "antd";
import { PieChart, Pie, Cell, Tooltip, Legend, RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { FileExcelOutlined } from "@ant-design/icons";
import axios from "axios";

const { RangePicker } = DatePicker;

const ChartStatusBill = () => {
  const [timeFilter, setTimeFilter] = useState("day");
  const [customRange, setCustomRange] = useState(null);
  const [apiData, setApiData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [tableTitle, setTableTitle] = useState("Thống kê sản phẩm bán chạy (HÔM NAY)");

  useEffect(() => {
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
    };

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
        const response = await axios.get("http://localhost:8080/api/admin/statistical/chartYear"); // Thay đổi URL nếu cần
    
        if (response.data && Array.isArray(response.data.data)) {
          const formattedChartData = response.data.data.map((item) => ({
            name: item.status ,
            uv: item.percentage,
            fill: getColorByStatus(item.status),
          }));
    
          setChartData(formattedChartData);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu biểu đồ từ API: ", error);
      }
    };
    
    // Hàm lấy màu theo trạng thái
    const getColorByStatus = (status) => {
      const colorMap = {
        "Chờ xác nhận": "#8884d8",
        "Đã xác nhận": "#83a6ed",
        "Chờ vận chuyển": "#8dd1e1",
        "Đang vận chuyển": "#82ca9d",
        "Đã thanh toán": "#a4de6c",
        "Đã hoàn thành": "#d0ed57",
        "Đã hủy": "#ff8042",
        "Trả hàng": "#ff0000",
      };
      return colorMap[status] || "#ccc"; // Mặc định màu xám nếu không có trong danh sách
    };
    

    fetchTableData();
    fetchChartData();
  }, [timeFilter, customRange]);

  const handleCustomRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setCustomRange(dates);

      // Cập nhật tiêu đề theo ngày đã chọn
      const formattedTitle = `Thống kê sản phẩm bán chạy (${dates[0].format("DD/MM/YYYY")} - ${dates[1].format("DD/MM/YYYY")})`;
      setTableTitle(formattedTitle);
    }
  };


  const handleFilterChange = (filterType, label) => {
    setTimeFilter(filterType);
    setCustomRange(null);
    setTableTitle(`Thống kê sản phẩm bán chạy (${label.toUpperCase()})`);
  };

  const columns = [
    //thiếu ảnh 
    { title: "Tên sản phẩm", dataIndex: "productName", key: "productName" },
    { title: "Loại giày", dataIndex: "typeName", key: "typeName" },
    { title: "Màu sắc", dataIndex: "colorName", key: "colorName" },
    { title: "Kích cỡ", dataIndex: "sizeName", key: "sizeName" },
    { title: "Đế giày", dataIndex: "soleName", key: "soleName" },
    { title: "Giới tính", dataIndex: "genderName", key: "genderName" },
    { title: "Giá bán", dataIndex: "price", key: "price" },
    { title: "Số lượng bán", dataIndex: "totalQuantitySold", key: "totalQuantitySold" },
  ];
  // const chartData1 = [
  //   { name: "Chờ xác nhận", uv: 15, fill: "#8884d8" }, // CHO_XAC_NHAN (1)
  //   { name: "Đã xác nhận", uv: 20, fill: "#83a6ed" }, // DA_XAC_NHAN (2)
  //   { name: "Chờ vận chuyển", uv: 10, fill: "#8dd1e1" }, // CHO_VAN_CHUYEN (3)
  //   { name: "Đang vận chuyển", uv: 15, fill: "#82ca9d" }, // DANG_VAN_CHUYEN (4)
  //   { name: "Đã thanh toán", uv: 10, fill: "#a4de6c" }, // DA_THANH_TOAN (5)
  //   { name: "Đã hoàn thành", uv: 20, fill: "#d0ed57" }, // DA_HOAN_THANH (6)
  //   { name: "Đã hủy", uv: 5, fill: "#ff8042" }, // DA_HUY (7)
  //   { name: "Trả hàng", uv: 5, fill: "#ff0000" }, // TRA_HANG (8)
  // ];
  return (
    <>
      <h2 style={{ color: "#2e95dd ", fontSize: 20, fontWeight: 'bold' }}>Thống kê doanh thu</h2>
      <Row gutter={[16, 16]}>
        <Col span={14}>
          <Card title={tableTitle} style={{ background: "linear-gradient(180deg, #2e95dd, rgb(210, 209, 207))" }}>
            <Table

              dataSource={apiData} columns={columns} pagination={{ pageSize: 5 }}

            />
          </Card>
        </Col>

        <Col span={10}>
          <Card title="Biểu đồ trạng thái đơn hàng" style={{ background: "linear-gradient(180deg, #2e95dd, rgb(210, 209, 207))" }}>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={10} data={chartData}>
                <RadialBar
                  minAngle={15}
                  label={{ position: "insideStart", fill: "#fff" }}
                  background
                  clockWise
                  dataKey="uv"
                />
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" />
              </RadialBarChart>
            </ResponsiveContainer>


          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16, background: "linear-gradient(180deg, #2e95dd, rgb(210, 209, 207))", color: "white" }}>
        {[{ label: "Hôm nay", value: "day" }, { label: "Tuần", value: "week" }, { label: "Tháng", value: "month" }, { label: "Năm", value: "year" }].map(({ label, value }) => (
          <Button
            key={value}
            type={timeFilter === value && !customRange ? "primary" : "default"}
            style={{
              marginRight: 8,
              background: "linear-gradient(180deg, #2e95dd, rgb(210, 209, 207))",
              color: "white",
            }}
            onClick={() => handleFilterChange(value, label)}
          >
            {label}
          </Button>
        ))}

        <Button
          style={{ marginLeft: 8, background: "linear-gradient(180deg, #2e95dd, rgb(210, 209, 207))", color: "white" }}
          type={customRange ? "primary" : "default"} onClick={() => setCustomRange([])}>
          TÙY CHỈNH
        </Button>
        {customRange && <RangePicker style={{ marginLeft: 16 }} onChange={handleCustomRangeChange} />}
        {/* <Button type="default" icon={<FileExcelOutlined />} style={{ marginLeft: 16 }}>
          Xuất Excel
        </Button> */}
      </Card>
    </>
  );
};

export default ChartStatusBill;
