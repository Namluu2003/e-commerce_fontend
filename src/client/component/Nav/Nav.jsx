import { Badge, Col, Image, Row } from "antd";
import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { BsCart2 } from "react-icons/bs";
import { getCart } from "../../page/cart/cart";
import axios from "axios";

function Nav() {
  const [cartCount, setCartCount] = useState(getCart().length);
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user"))
  ); // Lấy user từ localStorage
  const navigate = useNavigate();
  const fetchCart = async () => {
    if (user) {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/client/getallcartforcustomeridnopage`,
          {
            params: { customerId: user.id }, // Truyền params đúng cách
          }
        );

        setCartCount(response.data.data.length); // axios tự động parse JSON
      } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng:", error);
        setCartCount(0); // Tránh lỗi không cập nhật giao diện
      }
    } else {
      setCartCount(getCart().length);
    }
  };
  useEffect(() => {
    fetchCart();
  }, [user]);

  useEffect(() => {
    const handleCartChange = () => {
      setUser(JSON.parse(localStorage.getItem("user")));
    };

    // Lắng nghe khi giỏ hàng thay đổi trong localStorage
    window.addEventListener("storage", handleCartChange);
    window.addEventListener("cartUpdated", handleCartChange); // Custom event khi thêm sản phẩm vào giỏ hàng

    return () => {
      window.removeEventListener("storage", handleCartChange);
      window.removeEventListener("cartUpdated", handleCartChange);
    };
  }, []); // Gọi lại khi user thay đổi

  return (
    <>
      <Row
        style={{
          backgroundColor: "white",
          marginBottom: "0.2rem",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          padding: "10px 0",
        }}
      >
        <Col
          span={4}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src="/img/thehands.png"
            alt="mieu-ta-hinh-anh"
            className="img-fluid logo-icon p-0"
          />
        </Col>
        <Col
          span={14}
          style={{
            display: "flex",
            justifyContent: "start",
            alignItems: "center",
          }}
        >
          <Link
            to="/home"
            className="text-decoration-none text-black"
            style={{ margin: "0 10px" }}
          >
            TRANG CHỦ
          </Link>
          <Link
            to="/products"
            className="text-decoration-none text-black"
            style={{ margin: "0 10px" }}
          >
            SẢN PHẨM
          </Link>
          <Link
            to="/test"
            className="text-decoration-none text-black"
            style={{ margin: "0 10px" }}
          >
            SẢN PHẨM BÁN CHẠY
          </Link>
          <Link
            to="/contact"
            className="text-decoration-none text-black"
            style={{ margin: "0 10px" }}
          >
            LIÊN HỆ
          </Link>
          <Link
            to="/contact"
            className="text-decoration-none text-black"
            style={{ margin: "0 10px" }}
          >
            HÕ TRỢ
          </Link>
          <Link
            to="/contact"
            className="text-decoration-none text-black"
            style={{ margin: "0 10px" }}
          >
            TRA CỨU ĐƠN HÀNG
          </Link>
        </Col>
        <Col
          span={6}
          style={{
            display: "flex",
            justifyContent: "end",
            alignItems: "center",
            paddingRight: "2rem",
          }}
        >
          <Row gutter={[10, 10]} justify={"center"} align={"middle"}>
            <Col>
              <Image
                preview={false}
                src={`${
                  !user?.avatar || "https://placehold.co/500x550?text=No+Image"
                }`}
                style={{
                  width: "2rem",
                  borderRadius: "50%",
                }}
              />
            </Col>
            <Col>
              {user?.fullName ? (
                <Link
                  to="/profile"
                  className="text-decoration-none text-black fw-normal"
                  // onClick={handleLogout} // Gọi hàm logout khi click
                >
                  {user.fullName}
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="text-decoration-none text-black fw-normal"
                >
                  Đăng Nhập
                </Link>
              )}
            </Col>

            <Col onClick={() => navigate("/cart")}>
              <Badge count={cartCount}>
                <BsCart2 style={{ cursor: "pointer" }} size={22} />
              </Badge>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
}

export default Nav;
