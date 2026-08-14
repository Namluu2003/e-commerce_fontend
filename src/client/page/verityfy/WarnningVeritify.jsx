import { Button, Result, List, Typography, Card, Space, Row, Col } from "antd";
import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MailOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function WarningVeritify() {
  const navigate = useNavigate();

  return (
    <Row justify="center" align="middle" style={{ minHeight: "80vh" }}>
      <Col xs={24} sm={20} md={16} lg={12}>
        <Card style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <Result
            icon={<MailOutlined style={{ fontSize: 64, color: "#1890ff" }} />}
            title="Vui lòng xác thực email"
            subTitle={
              <Space direction="vertical" size="middle">
                <Text>
                  Chúng tôi đã gửi một email xác thực đến địa chỉ email của bạn.
                </Text>
                <List
                  size="small"
                  dataSource={[
                    "Kiểm tra hộp thư đến của bạn",
                    "Nhấp vào liên kết xác thực trong email",
                    "Hoàn tất quá trình xác thực"
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Space>
                        <CheckCircleOutlined style={{ color: "#52c41a" }} />
                        <Text>{item}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Space>
            }
            extra={[
              <Button 
                type="primary" 
                key="console"
                onClick={() => navigate("/")}
              >
                Về trang chủ
              </Button>,
              <Button 
                key="buy"
                onClick={() => window.location.href = "https://mail.google.com"}
              >
                Mở Gmail
              </Button>
            ]}
          />
        </Card>
      </Col>
    </Row>
  );
}

export default WarningVeritify;
