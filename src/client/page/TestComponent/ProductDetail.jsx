import React from 'react';
import { Card, Rate, Button, Image, Row, Col, Tag } from 'antd';
// import 'antd/dist/antd.css';

const ProductDetail = () => {
  return (
    <Card style={{ padding: '20px', maxWidth: '600px' }}>
      <Row gutter={16}>
        <Col span={12}>
          <Image
            width={200}
            src="https://example.com/main-shoe-image.jpg" // Hình ảnh lớn
            alt="Giày MLB Chunky"
          />
          <Row gutter={8} style={{ marginTop: 16 }}>
            <Col span={8}>
              <Image
                width={50}
                src="https://example.com/thumb1.jpg" // Hình ảnh nhỏ 1
                alt="Thumbnail 1"
              />
            </Col>
            <Col span={8}>
              <Image
                width={50}
                src="https://example.com/thumb2.jpg" // Hình ảnh nhỏ 2
                alt="Thumbnail 2"
              />
            </Col>
            <Col span={8}>
              <Image
                width={50}
                src="https://example.com/thumb3.jpg" // Hình ảnh nhỏ 3
                alt="Thumbnail 3"
              />
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <h2>Giày MLB Chunky Nam Nữ Cao Cấp</h2>
          <Tag color="green" style={{ fontSize: '24px' }}>₫1.001</Tag>
          <div style={{ margin: '10px 0' }}>
            <Rate allowHalf defaultValue={4.5} />
            <span>(4 Đánh giá)</span>
          </div>
          <p>
            Giày NY Đen, NY Xanh, NY Trắng, Bẻ Kem, B Xanh Đỏ Bò Tăng Chân Đế Cao Full Phụ Kiện ĐINHHH
          </p>
          <Button type="primary" size="large" style={{ width: '100%' }}>
            Mua Ngay
          </Button>
        </Col>
      </Row>
      <div style={{ marginTop: 20 }}>
        <h4>Mô Tả Sản Phẩm</h4>
        <p>Shop HD</p>
        <p>
          Đánh giá: <strong>574</strong>
        </p>
        <p>
          Ngày cập nhật: <strong>Hôm Nay</strong>
        </p>
        <p>
          Xuất xứ: <strong>Việt Nam</strong>
        </p>
        <p>
          Kích thước: <strong>Đầy đủ</strong>
        </p>
      </div>
    </Card>
  );
};

export default ProductDetail;