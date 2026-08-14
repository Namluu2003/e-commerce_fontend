import React, { memo, useEffect } from "react";
import style from "../TestComponent/TestComponent.module.css";
import clsx from "clsx";
import styles from "./Product.module.css";

// import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaBolt,
  FaCartPlus,
  FaLocationDot,
  FaSquareFacebook,
  FaStar,
} from "react-icons/fa6";
import { FaFireAlt, FaPhoneAlt } from "react-icons/fa";
import { Button, Col, Flex, Rate, Row } from "antd";
import Integer from "@zxing/library/esm/core/util/Integer";

const formatPriceRange = (price) => {
  if (!price) return ""; // Nếu giá trị rỗng, trả về chuỗi rỗng

  // Chuyển thành string nếu price không phải là string
  const priceStr = String(price);

  // Kiểm tra nếu không chứa dấu " - " thì chỉ cần format một giá trị
  if (!priceStr.includes("-")) {
    return parseInt(priceStr).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  }

  // Tách chuỗi theo " - "
  const priceParts = priceStr.split(" - ").map((p) => parseInt(p));

  if (priceParts.length === 2 && priceParts[0] === priceParts[1]) {
    return priceParts[0].toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    }); // Nếu hai giá giống nhau, chỉ hiển thị một giá
  }

  return `${priceParts[0].toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  })} - ${priceParts[1].toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  })}`; // Nếu khác nhau, format từng giá trị
};

function PropProduct({ product }) {
  const statusSaleContent =
    {
      Hot: (
        <>
          <FaFireAlt /> Hot
        </>
      ),
      "Best Sale": (
        <>
          <FaStar /> Best Sale
        </>
      ),
      "Flash Sale": (
        <>
          <div style={{ color: "green" }}>
            <FaBolt /> Flash Sale
          </div>
        </>
      ),
    }[product.statusSale] || null;
  useEffect(() => {
    console.log("prop đã ren");
  });
  return (
    <>
      <div
        className={clsx("card", styles.productcard,"p-0")}
        style={{
          height: "23rem",
          // height: "24rem",

          transition: "transform 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        <img
          src={product.url}
          alt=""
          className="card-img-top p-0"
          style={{
            objectFit: "contain", // Giữ tỉ lệ ảnh ban đầu
            height: "55%",
            maxWidth: "100%",
            width: "100%",
            // borderRadius: "0.5rem",
          }}
        />
        <div className="position-absolute top">
          {/* Hiển thị trạng thái sale nếu có */}
          {statusSaleContent && (
            <div
              className={styles.statusBadge}
              style={{
                fontSize: "0.7rem",
                fontWeight: "bold",
                background: "#FEEEEA",
                color: "#EE4D2D",
                marginLeft: "0.5rem",
                padding: "0.3rem",
                margin: "0.2rem",
              }}
            >
              {statusSaleContent}
            </div>
          )}
        </div>
        <div
          className="card-body"
          style={{
            padding: "0.5rem",
            paddingTop: "0rem",
          }}
        >
          <div
            // className="card-title"
            style={{
              fontSize: "1rem",
              height: "30%",
            }}
          >
            {product.name.length > 45
              ? product.name.slice(0, 45) + "..."
              : product.name}
          </div>

          <div
            style={{
              fontSize: "0.8rem",
            }}
          >
            <div>
              <span
                className="fw-bold fs-5 text-danger"
                title={
                  product.promotionView?.maxDiscount > 0
                    ? formatPriceRange(
                        product.promotionView.rangePriceAfterPromotion
                      ) + `- ${product.promotionView.maxDiscount} % `
                    : formatPriceRange(product.price)
                }
                style={{
                  display: "inline-block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%", // Điều chỉnh chiều rộng tùy ý
                }}
              >
                {product.promotionView?.maxDiscount > 0 ? (
                  <div>
                    <div>
                      {formatPriceRange(
                        product.promotionView.rangePriceAfterPromotion
                      )}
                    </div>
                    <span className="text-decoration-line-through text-secondary fw-normal fs-6">
                      {formatPriceRange(product.promotionView.rangePriceRoot)}{" "}
                    </span>
                    <sup
                      className="badge"
                      style={{
                        fontSize: "0.7rem",
                        background: "#FEEEEA",
                        color: "#EE4D2D",
                        marginLeft: "0.5rem",
                      }}
                    >
                      - {product.promotionView.maxDiscount}%
                    </sup>{" "}
                  </div>
                ) : (
                  <div >
                    <div  > {formatPriceRange(product.price)}</div>
                    <span className="text-decoration-line-through text-secondary fw-normal fs-6 text-white">
                       ko co
                    </span>
                    <sup
                      style={{
                        fontSize: "0.7rem",
                        background: `${
                          product.promotion ? "#FEEEEA" : "white"
                        }`,
                        color: "#EE4D2D",
                      }}
                    >
                      {product.promotion || (
                        <div hidden>Chưa có khuyến mại</div>
                      )}
                    </sup>
                  </div>
                )}
              </span>
            </div>
          </div>
          <div>
            {/*<Rate*/}
            {/*  value={product.rate}*/}
            {/*  disabled*/}
            {/*  style={{*/}
            {/*    fontSize: "0.8rem",*/}
            {/*  }}*/}
            {/*/>*/}
          </div>
          <div className="d-flex justify-content-between align-items-center">
            {/* <div className={style.stars}>
              &#9733;&#9733;&#9733;&#9733;&#9733;
            </div> */}

            <div style={{ fontSize: "0.8rem" }}>Đã bán: {product.sale}</div>
            <div style={{ fontSize: "0.8rem" }}>Lượt xem: {product.views}</div>
          </div>
          {/* 
          <Flex>
            <Col
              span={10}
              style={{
                padding: "0",
              }}
            >
              <Button type="primary" style={{ width: "100%", padding: "0" }}>
                Mua ngay
              </Button>
            </Col>
            <Col
              span={14}
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "0",
              }}
            >
              <Button type="primary" style={{ width: "90%", padding: "0" }}>
                Thêm <FaCartPlus size={20} />
              </Button>
            </Col>
          </Flex> */}
        </div>
      </div>
    </>
  );
}
export default memo(PropProduct);
