import React, { useState } from "react";
import { Row, Col, Card, Button, DatePicker } from "antd";
import { FileExcelOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;


const cardStyles = {
    borderRadius: "8px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    background: "linear-gradient(180deg, #2e95dd, #ffbc74)",
    color: "white",
    backgroundSize: "200% 200%",
};
const hoverStyles = {
    transform: "scale(1.03)",
    boxShadow: "0px 6px 15px rgba(246, 246, 246, 0)",
};

const RevenueCards = ({ showCustomCard }) => {
    const data = [
        { title: "Hôm nay", revenue: "2.800.000 VND", sold: 15, orders: 5, bgPosition: "0% 0%", unoders: 4, replay: 5 },
        { title: "Tuần này", revenue: "59.892.500 VND", sold: 256, orders: 40, bgPosition: "100% 0%", unoders: 4, replay: 5 },
        { title: "Tháng này", revenue: "120.345.000 VND", sold: 560, orders: 80, bgPosition: "0% 100%", unoders: 4, replay: 5 },
        { title: "Năm nay", revenue: "1.500.800.000 VND", sold: 7200, orders: 900, bgPosition: "100% 100%", unoders: 4, replay: 5 },
    ];

    return (
        <>
                    <h2 style={{ color: "#2e95dd ", fontSize: 20, fontWeight: 'bold' }}>Thống kê doanh thu</h2>
        
            {/* Danh sách các ô thống kê mặc định */}
            <Row gutter={[8, 8]}>
                {data.map((item, index) => (
                    <Col xs={24} sm={12} md={12} lg={12} key={index}>
                        <Card
                            title={item.title}
                            hoverable
                            headStyle={{ color: "white", fontSize: "18px", fontWeight: "bold" }}
                            style={{ ...cardStyles, backgroundPosition: item.bgPosition }} // Chia ảnh theo từng ô
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = hoverStyles.transform;
                                e.currentTarget.style.boxShadow = hoverStyles.boxShadow;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.boxShadow = cardStyles.boxShadow;
                            }}
                        >
                            <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>{item.revenue}</h1>
                            <Row gutter={[8, 8]} style={{ marginTop: "10px" }}>
                                <Col span={6}><strong>Sản phẩm</strong><br />{item.sold}</Col>
                                <Col span={6}><strong>Đơn thành công</strong><br />{item.orders}</Col>
                                <Col span={6}><strong>Đơn hủy</strong><br />{item.unoders}</Col>
                                <Col span={6}><strong>Đơn hoàn</strong><br />{item.replay}</Col>
                            </Row>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Ô tùy chỉnh với ảnh nền riêng */}
            {showCustomCard && (
                <Row style={{ marginTop: 16 }}>
                    <Col span={24}>
                        <Card
                            title="Tùy chỉnh"
                            hoverable
                            headStyle={{ color: "white", fontSize: "18px", fontWeight: "bold" }}
                            style={{background: "linear-gradient(180deg, #2e95dd, #ffbc74)",color:"white"}} // Ảnh nền cố định
                        >
                            <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>50.000.000 VND</h1>
                            <Row gutter={[8, 8]} style={{ marginTop: "10px" }}>
                                <Col span={6}><strong>Sản phẩm</strong><br />100</Col>
                                <Col span={6}><strong>Đơn thành công</strong><br />20</Col>
                                <Col span={6}><strong>Đơn hủy</strong><br />5</Col>
                                <Col span={6}><strong>Đơn hoàn</strong><br />3</Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            )}
        </>
    );
};

const DateFilter = ({ onShowCustomCard }) => {
    const [showRangePicker, setShowRangePicker] = useState(false);

    return (
        <Card style={{ marginBottom: 16, background: "linear-gradient(180deg, #2e95dd, #ffbc74)", color: "white" }}>
            {/* <Button type="default">NGÀY</Button>
            <Button type="default" style={{ marginLeft: 8 }}>TUẦN</Button>
            <Button type="default" style={{ marginLeft: 8 }}>THÁNG</Button>
            <Button type="default" style={{ marginLeft: 8 }}>NĂM</Button> */}
            <Button
                type="default"
                style={{ marginLeft: 8 ,background: "linear-gradient(180deg, #2e95dd, #ffbc74)", color: "white"}}
                onClick={() => setShowRangePicker(!showRangePicker)}
            >
                TÙY CHỈNH
            </Button>
            {showRangePicker && (
                <RangePicker
                    style={{ marginLeft: 16 }}
                    onChange={(dates) => {
                        if (dates) {
                            onShowCustomCard(true);
                        }
                    }}
                />
            )}
            <Button type="default" icon={<FileExcelOutlined />} style={{ marginLeft: 16,background: "linear-gradient(180deg, #2e95dd, #ffbc74)", color: "white" }}>
                Xuất Excel
            </Button>
        </Card>
    );
};

const Dashboard = () => {
    const [showCustomCard, setShowCustomCard] = useState(false);

    return (
        <div style={{ padding: "20px" }}>
            <RevenueCards showCustomCard={showCustomCard} />
            <DateFilter onShowCustomCard={setShowCustomCard} />

        </div>
    );
};

export default Dashboard;