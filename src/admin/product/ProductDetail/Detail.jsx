import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  Descriptions,
  Typography,
  Spin,
  Image,
  QRCode,
  Row,
  Col,
  Button,
  Popconfirm,
} from "antd";
import { useParams } from "react-router-dom";
import axios from "axios";
import { COLORS } from "../../../constants/constants";
import { BiDownload } from "react-icons/bi";
import { IoMdDownload } from "react-icons/io";

const { Title } = Typography;

const Detail = () => {
  const { id } = useParams(); // Lấy id sản phẩm từ URL
  const qrCanvasRef = useRef(null); // Ref cho canvas

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const images = [
    "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
    "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
    "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
  ];

  // Giả lập API response
  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      // Thay thế URL này bằng API thật của bạn
      const response = await axios.get(
        `http://localhost:8080/api/admin/productdetail/${id}`
      );
      setProduct(response.data.data); // Cập nhật state với dữ liệu từ API
      console.log(product);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };
  const downloadQRCodeCanvas = () => {
    const canvas = qrCanvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png"); // Lấy ảnh PNG từ canvas
    const link = document.createElement("a");
    link.href = url;
    link.download = "QRCode_Canvas" + product?.id + ".png"; // Tên file tải về
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  if (loading) {
    return (
      <Spin
        size="large"
        style={{ display: "block", textAlign: "center", marginTop: "50px" }}
      />
    );
  }

  if (!product) {
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        Không tìm thấy sản phẩm.
      </p>
    );
  }

  return (
    <Card
      style={{ borderRadius: 10, boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" }}
    >
      <h3 style={{ textAlign: "left", color: `${COLORS.color}` }}>
        Thông tin sản phẩm
      </h3>
      <Descriptions bordered column={1} size="middle">
        <Descriptions.Item label="Tên sản phẩm">
          {product.productName}
        </Descriptions.Item>
        <Descriptions.Item label="Thương hiệu">
          {product.brandName}
        </Descriptions.Item>
        
        <Descriptions.Item label="Loại giày">
          {product.typeName}
        </Descriptions.Item>
        <Descriptions.Item label="Màu sắc">
          {product.colorName}
        </Descriptions.Item>
        <Descriptions.Item label="Chất liệu">
          {product.materialName}
        </Descriptions.Item>
        <Descriptions.Item label="Kích cỡ">
          {product.sizeName}
        </Descriptions.Item>
        <Descriptions.Item label="Đế giày">
          {product.soleName}
        </Descriptions.Item>
        <Descriptions.Item label="Giới tính">
          {product.genderName}
        </Descriptions.Item>
        <Descriptions.Item label="Số lượng">
          {product.quantity}
        </Descriptions.Item>
        <Descriptions.Item label="Giá">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(product.price)}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <span
            style={{ color: product.status === "HOAT_DONG" ? "green" : "red" }}
          >
            {product.status === "HOAT_DONG" ? "Hoạt động" : "Ngừng hoạt động"}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Mô tả">
          <div
            dangerouslySetInnerHTML={{
              __html: product.description || "Không có mô tả",
            }}
          />
        </Descriptions.Item>

        <Descriptions.Item label="QR">
          <Row>
            <Col span={24}>
              <div ref={qrCanvasRef}>
                <QRCode
                  type="canvas"
                  value={`${product?.id || "https://ant.design/"}`}
                  style={{ width: "8rem", height: "auto" }}
                  // errorLevel='M'
                />
              </div>
            </Col>
            <Col>
              <Popconfirm
                title="Tải xuống"
                description="Bạn tải qr về máy"
                placement="rightBottom"
                okText="Xác nhận"
                cancelText="Hủy"
                onConfirm={downloadQRCodeCanvas}
              >
                <Button
                  type="primary"
                  style={{
                   
                    
                    
                    width: "8rem",
                  }}
                >
                  <IoMdDownload size={22} color="black" />
                  Tải-QR
                </Button>
              </Popconfirm>
            </Col>
          </Row>{" "}
        </Descriptions.Item>
        <Descriptions.Item label="Ảnh">
          {/* {product.description || "Không có mô tả"} */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Image.PreviewGroup>
              {product.image?.map((item, index) => (
                <Image
                  key={index}
                  width={90}
                  src={item.url}
                  alt={`Ảnh ${index + 1}`}
                />
              ))}
            </Image.PreviewGroup>
          </div>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default Detail;
