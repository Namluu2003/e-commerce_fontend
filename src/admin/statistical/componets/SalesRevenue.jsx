import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, DatePicker, Tooltip, message } from "antd";
import { FileExcelOutlined } from "@ant-design/icons";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { MailOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

//#2e95dd
const { RangePicker } = DatePicker;

const cardStyles = {
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(255, 140, 0, 0.30)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    background: "white",
    color: "black",
    backgroundSize: "200% 200%",
};

const exportToExcel = (data, dateRange, fileName = "RevenueReport.xlsx") => {
    if (!data || !dateRange) {
        console.warn("Không có dữ liệu để xuất.");
        return;
    }
    const { startDate, endDate } = dateRange;

    const worksheetData = [
        [`Doanh thu`, `Từ ${startDate} đến ${endDate}`], // Tiêu đề chính
        [],
        [
            "Tổng doanh thu (VNĐ)",
            "Tổng số đơn",
            "Số sản phẩm đã bán",
            "Đơn thành công",
            "Đơn hủy"
        ], // Hàng tiêu đề chi tiết
        [
            data.totalRevenue || 0,
            data.totalOrders || 0,
            data.totalProductsSold || 0,
            data.successfulOrders || 0,
            data.cancelledOrders || 0,
        ], // Dữ liệu thực tế
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();

    // Căn chỉnh độ rộng cột
    worksheet["!cols"] = [
        { wch: 20 },
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 165 },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "DoanhThu");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(dataBlob, fileName);
};

const RevenueCards = ({ showCustomCard, customData }) => {
    const [data, setData] = useState({ day: null, week: null, month: null, year: null });

    useEffect(() => {
        const fetchData = async (type) => {
            try {
                const response = await axios.get(`http://localhost:8080/api/admin/statistical/${type}`);
                setData(prevState => ({
                    ...prevState,
                    [type.toLowerCase()]: response.data.data?.[0] || {
                        totalRevenue: 0,
                        totalOrders: 0,
                        totalProductsSold: 0,
                        successfulOrders: 0,
                        cancelledOrders: 0
                    }
                }));
            } catch (error) {
                console.error(`Lỗi khi lấy dữ liệu từ API (${type}):`, error);
            }
        };

        ["Day", "Week", "Month", "Year"].forEach(fetchData);
    }, []);

    const cards = [
        { title: "Ngày", data: data.day, headStyle: { color: "black" } },
        { title: "Tuần", data: data.week, headStyle: { color: "balck" } },
        { title: "Tháng", data: data.month, headStyle: { color: "black" } },
        { title: "Năm", data: data.year, headStyle: { color: "black" } },
    ];

    return (
        <>



            <Row gutter={[16, 16]} justify="center">
                {cards.map((item, index) => (
                    <Col xs={24} sm={12} md={12} lg={6} key={index}>
                        <Card title={item.title} hoverable style={cardStyles} headStyle={item.headStyle}>
                            <h1 style={{ fontSize: "20px", textAlign: "left" }}>
                                {item.data?.totalRevenue ? item.data.totalRevenue.toLocaleString() : "..."} VNĐ
                            </h1>
                            <Row gutter={[8, 8]} justify="left" style={{ fontSize: "14px", fontWeight: "bold" }}>
                                <Col span={4} style={{ color: "#007bff" }}>
                                    <Tooltip title="Số lượng đơn">
                                        • {item?.data?.totalOrders || 0}
                                    </Tooltip>
                                </Col>
                                <Col span={4} style={{ color: "#28a745" }}>
                                    <Tooltip title="Số sản phẩm đã bán">
                                        • {item?.data?.totalProductsSold || 0}
                                    </Tooltip>
                                </Col>
                                <Col span={4} style={{ color: "#ffc107" }}>
                                    <Tooltip title="Đơn thành công">
                                        • {item?.data?.successfulOrders || 0}
                                    </Tooltip>
                                </Col>
                                <Col span={4} style={{ color: "#dc3545" }}>
                                    <Tooltip title="Đơn hủy">
                                        • {item?.data?.cancelledOrders || 0}
                                    </Tooltip>
                                </Col>

                            </Row>

                        </Card>
                    </Col>
                ))}
            </Row>
            <Row gutter={[16, 16]} style={{ paddingTop: "10px" }}>
                <Col span={24} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div
                        className={"justify-content-center"}
                        style={{
                        borderRadius: '8px',
                        padding: '16px',
                        background: '#ffffff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        textAlign: 'left'
                    }}>
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>Chú thích</span>
                        <hr style={{ width: '100%', margin: '8px 0', border: 'none', borderTop: '1px solid #ddd' }} />
                        <div className={"gap-5"} style={{ display: 'flex', flexWrap: 'wrap'}}>
                            <span style={{ color: "#007bff", fontSize: "12px", fontWeight: "500" }}>● Số lượng đơn</span>
                            <span style={{ color: "#28a745", fontSize: "12px", fontWeight: "500" }}>● Số sản phẩm đã bán</span>
                            <span style={{ color: "#ffc107", fontSize: "12px", fontWeight: "500" }}>● Đơn thành công</span>
                            <span style={{ color: "#dc3545", fontSize: "12px", fontWeight: "500" }}>● Đơn hủy</span>
                        </div>
                    </div>
                </Col>
            </Row>


            {customData && (
                <Row justify="center" style={{ marginTop: 20 }}>
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Card title={<span style={{ color: "black", textAlign: "center", display: "block" }}>Tùy chỉnh</span>} hoverable style={cardStyles}>
                            <h1 style={{ fontSize: "20px", textAlign: "center" }}>
                                {customData.totalRevenue.toLocaleString()} VNĐ
                            </h1>
                            <Row gutter={[8, 8]} justify="center" style={{ textAlign: "center", fontSize: "14px", fontWeight: "bold" }}>
                                <Col span={4} style={{ color: "#007bff" }}>
                                    <Tooltip title="Số lượng đơn">
                                        <span>• {customData.totalOrders || 0}</span>
                                    </Tooltip>
                                </Col>
                                <Col span={4} style={{ color: "#28a745" }}>
                                    <Tooltip title="Số sản phẩm đã bán">
                                        <span>• {customData.totalProductsSold || 0}</span>
                                    </Tooltip>
                                </Col>
                                <Col span={4} style={{ color: "#ffc107" }}>
                                    <Tooltip title="Đơn thành công">
                                        <span>• {customData.successfulOrders || 0}</span>
                                    </Tooltip>
                                </Col>
                                <Col span={4} style={{ color: "#dc3545" }}>
                                    <Tooltip title="Đơn hủy">
                                        <span>• {customData.cancelledOrders || 0}</span>
                                    </Tooltip>
                                </Col>

                            </Row>

                        </Card>
                    </Col>
                </Row>
            )}
        </>


    );
};
// gửi báo cáo ngày
const DateFilter = ({ onSetCustomData, customData }) => {
    const [dateRange, setDateRange] = useState(null);

    const handleDateChange = async (dates) => {
        if (dates) {
            const startDate = dates[0].format("YYYY-MM-DD");
            const endDate = dates[1].format("YYYY-MM-DD");
            setDateRange({ startDate, endDate }); // Lưu khoảng thời gian đã chọn

            try {
                const response = await axios.get(`http://localhost:8080/api/admin/statistical/CustomDate?startDate=${startDate}&endDate=${endDate}`);
                onSetCustomData(response.data.data?.[0] || null);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu tùy chỉnh từ API:", error);
            }
        }
    };
    const sendDailyReportEmail = async () => {
        try {
            await axios.post(`http://localhost:8080/api/admin/statistical/send-daily-report-email`);
            toast.success('Báo cáo doanh thu ngày đã được gửi thành công qua email!');
        } catch (error) {
            console.error("Lỗi khi gửi email báo cáo:", error);
            toast.error('Không thể gửi báo cáo. Vui lòng thử lại sau!');
        }
    };

    return (
        <>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        icon={<MailOutlined />}
                        onClick={sendDailyReportEmail}
                        size="small"
                    >
                        Gửi báo cáo doanh thu hôm nay
                    </Button>
                </div>
                      <div style={{ fontSize: '30px' }}>
Doanh thu                      </div>



                <div className={"mb-4"} style={{  display: "flex", justifyContent: "flex-end", color: "black", gap: '10px' }}>
                    <RangePicker onChange={handleDateChange}
                        style={{ width: "250px", height: "25px" }}
                        format="DD/MM/YYYY"
                    />
                </div>
        </>

    );

};


const Dashboard = () => {
    const [customData, setCustomData] = useState(null);

    return (
        <div style={{ padding: "20px" }}>
            <DateFilter onSetCustomData={setCustomData} customData={customData} />
            <RevenueCards showCustomCard={!!customData} customData={customData} />
        </div>
    );
};

export default Dashboard;
