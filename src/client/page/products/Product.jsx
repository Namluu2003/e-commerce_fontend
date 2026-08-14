import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Col,
  Layout,
  message,
  Pagination,
  Row,
} from "antd";
import { COLORS } from "../../../constants/constants.js";
import {
  apiAddViewProduct,
  getAllProductHadCreatedAtDesc,
  getAllProducthadPromotion,
  getAllProducthadSoldDesc,
  getAllProducthadViewsDesc,
} from "./api.js";
import PropProduct from "./PropProduct.jsx";

const { Content } = Layout;

function Product() {
  // Loading
  const [loading, setLoading] = useState(false);

  // --- Sản phẩm bán chạy ---
  const [productHadSolDescs, setProductHadSolDescs] = useState([]);
  const [pageProductHadSolDescs, setPageProductHadSolDescs] = useState({
    current: 1,
    pageSize: 10,
  });
  const [totalProductHadSolDescs, setTotalProductHadSolDescs] = useState(0);

  // --- Sản phẩm giảm giá ---
  const [productHadPromotions, setProductHadPromotions] = useState([]);
  const [pageProductHadPromotion, setPageProductHadPromotion] = useState({
    current: 1,
    pageSize: 10,
  });
  const [totalProductHadPromotion, setTotalProductHadPromotion] = useState(0);

  // --- Sản phẩm mới ---
  const [productHadCreatedAtDescs, setProductHadCreatedAtDescs] = useState([]);

  // --- Sản phẩm nhiều lượt xem ---
  const [productHadViewsDescs, setProductHadViewsDescs] = useState([]);
useEffect(() => {
  window.scrollTo(0, 0);
},[])
  // Fetch: Bán chạy
  useEffect(() => {
    const fetchSoldDesc = async () => {
      setLoading(true);
      try {
        const res = await getAllProducthadSoldDesc(pageProductHadSolDescs);
        setProductHadSolDescs(res.data);
        setTotalProductHadSolDescs(res.total);
      } catch (err) {
        message.error(err.message || "Lỗi khi tải sản phẩm bán chạy");
      } finally {
        setLoading(false);
      }
    };
    fetchSoldDesc();
  }, [pageProductHadSolDescs.current, pageProductHadSolDescs.pageSize]);

  // Fetch: Giảm giá
  useEffect(() => {
    const fetchPromotions = async () => {
      setLoading(true);
      try {
        const res = await getAllProducthadPromotion(pageProductHadPromotion);
        setProductHadPromotions(res.data);
        setTotalProductHadPromotion(res.total);  // Lưu tổng số sản phẩm giảm giá
      } catch (err) {
        message.error(err.message || "Lỗi khi tải sản phẩm giảm giá");
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, [pageProductHadPromotion.current, pageProductHadPromotion.pageSize]);

  // View sản phẩm
  const addViewProduct = async (productId) => {
    try {
      await apiAddViewProduct(productId);
    } catch (err) {
      message.error(err.message || "Lỗi khi cập nhật lượt xem");
    }
  };

  return (
        <Content >
          {/* Bán chạy */}
          <Card
            style={{ borderRadius: 0, marginBottom: "0.3rem" }}
            title={
              <Row
                style={{
                  fontSize: "19px",
                  fontWeight: "normal",
                  backgroundColor: COLORS.backgroundcolor2,
                  // padding: "10px",
                  margin: "1rem",
                  color: COLORS.pending,
                }}
              >
                SẢN PHẨM BÁN CHẠY
              </Row>
            }
          >
            <Row gutter={[5, 5]} wrap>
              {productHadSolDescs.map((product, index) => (
                <Col key={index} flex="20%" style={{maxWidth: "20%"}}>
                  <Link
                    to={`/products/product-detail/${product.productId}?colorId=${product.colorId}&sizeId=${product.sizeId}&genderId=${product.genderId}&materialId=${product.materialId}&soleId=${product.soleId}`}
                    style={{ textDecoration: "none", color: "black" }}
                    onClick={() => addViewProduct(product.productId)}
                  >
                    <PropProduct
                      product={{
                        name: product.productName?.trim() || "Sản phẩm chưa có tên",
                        price: product.price ?? 0,
                        promotionView: product.promotionView,
                        sale: product.sold ?? 0,
                        url: product.imageUrl || "https://placehold.co/50",
                        views: product.views ?? 0,
                        rate: product.rate ?? 5,
                      }}
                    />
                  </Link>
                </Col>
              ))}
            </Row>
            <Row className="p-3">
              <Pagination
                current={pageProductHadSolDescs.current}
                pageSize={pageProductHadSolDescs.pageSize}
                total={totalProductHadSolDescs}
                onChange={(page, pageSize) =>
                  setPageProductHadSolDescs({ current: page, pageSize })
                }
                showSizeChanger
                pageSizeOptions={["2", "16", "24"]}
              />
            </Row>
          </Card>

          {/* Giảm giá */}
          <Card
            style={{ borderRadius: 0, marginBottom: "0.3rem" }}
            title={
              <Row
                style={{
                  fontSize: "19px",
                  fontWeight: "normal",
                  backgroundColor: COLORS.backgroundcolor2,
                  padding: "10px",
                  margin: "1rem",
                  color: COLORS.pending,
                }}
              >
                SẢN PHẨM ĐANG GIẢM GIÁ
              </Row>
            }
          >
            <Row gutter={[5, 5]}>
              {productHadPromotions.map((product, index) => (
                <Col key={index} flex="20%" style={{maxWidth:"20%"}}>
                  <Link
                    to={`/products/product-detail/${product.productId}?colorId=${product.colorId}&sizeId=${product.sizeId}&genderId=${product.genderId}&materialId=${product.materialId}&soleId=${product.soleId}`}
                    style={{ textDecoration: "none", color: "black" }}
                    onClick={() => addViewProduct(product.productId)}
                  >
                    <PropProduct
                      product={{
                        name: product.productName?.trim() || "Sản phẩm chưa có tên",
                        price: product.price ?? 0,
                        promotionView: product.promotionView,
                        sale: product.sold ?? 0,
                        url: product.imageUrl || "https://placehold.co/100",
                        views: product.views ?? 0,
                        rate: product.rate ?? 5,
                      }}
                    />
                  </Link>
                </Col>
              ))}
            </Row>
            <Row className="p-3">
              <Pagination
                current={pageProductHadPromotion.current}
                pageSize={pageProductHadPromotion.pageSize}
                total={totalProductHadPromotion}
                onChange={(page, pageSize) =>
                  setPageProductHadPromotion({ current: page, pageSize })
                }
                showSizeChanger
                pageSizeOptions={["2", "16", "24"]}
              />
            </Row>
          </Card>

        </Content>
  );
}

export default Product;
