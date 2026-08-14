import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import style from "../TestComponent/TestComponent.module.css";
import clsx from "clsx";
import styles from "./Product.module.css";
import PropProduct from "./PropProduct.jsx";
import { Content } from "antd/es/layout/layout.js";
import {
  Button,
  Card,
  Col,
  Divider,
  Flex,
  InputNumber,
  Layout,
  Menu,
  message,
  Pagination,
  Radio,
  Rate,
  Row,
  Select,
  Slider,
  Space,
} from "antd";
import Sider from "antd/es/layout/Sider.js";
import {
  LaptopOutlined,
  NotificationOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { COLORS } from "../../../constants/constants.js";
import {
  apiAddViewProduct,
  getAllProductHadCreatedAtDesc,
  getAllProducthadPromotion,
  getAllProducthadSoldDesc,
  getAllProducthadViewsDesc,
} from "./api.js";
import { FaFilter } from "react-icons/fa";
import { FiFilter } from "react-icons/fi";
import { Link, useSearchParams } from "react-router-dom";
import FilterSelect from "./FilterSelect.jsx";
import {
  fetchDataSelectBrand,
  fetchDataSelectColor,
  fetchDataSelectGender,
  fetchDataSelectMaterial,
  fetchDataSelectProduct,
  fetchDataSelectSize,
  fetchDataSelectSole,
  fetchDataSelectType,
} from "../../../admin/product/ProductDetail/ApiProductDetail.js";

const url =
  "https://res.cloudinary.com/dieyhvcou/image/upload/v1742735758/5_1_b5fisz.png";

const items2 = [UserOutlined, LaptopOutlined, NotificationOutlined].map(
  (icon, index) => {
    const key = String(index + 1);
    return {
      key: `sub${key}`,
      icon: React.createElement(icon),
      label: `Danh mục ${key}`,
      children: new Array(4).fill(null).map((_, j) => {
        const subKey = index * 4 + j + 1;
        return {
          key: subKey,
          label: `danh mục con${subKey}`,
        };
      }),
    };
  }
);

function ProductsPage() {
  const [searchParams] = useSearchParams();

  // Memoize URL parameters
  const urlParams = useMemo(
    () => ({
      productName: searchParams.get("productName"),
      brandName: searchParams.get("brandName"),
      typeName: searchParams.get("typeName"),
      colorName: searchParams.get("colorName"),
      materialName: searchParams.get("materialName"),
      genderName: searchParams.get("genderName"),
    }),
    [searchParams]
  );

  const [filteredData, setFilteredData] = useState({
    products: [],
    pagination: {},
    filters: {},
  });

  // Memoize pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    totalPages: 0,
    totalElements: 0,
  });

  // Memoize data select states
  const [dataSelectBrand, setDataSelectBrand] = useState([]);
  const [dataSelectColor, setDataSelectColor] = useState([]);
  const [dataSelectGender, setDataSelectGender] = useState([]);
  const [dataSelectMaterial, setDataSelectMaterial] = useState([]);
  const [dataSelectProduct, setDataSelectProduct] = useState([]);
  const [dataSelectSize, setDataSelectSize] = useState([]);
  const [dataSelectSole, setDataSelectSole] = useState([]);
  const [dataSelectType, setDataSelectType] = useState([]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  // Memoize filter handler
  const handleFilter = useCallback(
    (data) => {
      setFilteredData(data);
      if (
        data?.pagination.totalPages !== pagination.totalPages ||
        data?.pagination.totalElements !== pagination.totalElements
      ) {
        setPagination((prev) => ({
          ...prev,
          totalPages: data?.pagination.totalPages || 0,
          totalElements: data?.pagination.totalElements || 0,
        }));
      }
    },
    [pagination.totalPages, pagination.totalElements]
  );

  // Memoize pagination handler
  const handlePaginationChange = useCallback((newPagination) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  }, []);

  // Memoize page change handler
  const onPageChange = useCallback(
    (page, pageSize) => {
      handlePaginationChange({ current: page, pageSize });
    },
    [handlePaginationChange]
  );

  // Memoize filter string formatter
  const formatFiltersToString = useCallback(
    (filters) => {
      const filterParts = [];

      if (filters.productId) {
        const product = dataSelectProduct.find(
          (p) => p.id === filters.productId
        );
        filterParts.push(`Sản phẩm: ${product?.productName || "N/A"}`);
      }
      if (filters.brandId) {
        const brand = dataSelectBrand.find((b) => b.id === filters.brandId);
        filterParts.push(`Thương hiệu: ${brand?.brandName || "N/A"}`);
      }
      if (filters.typeId) {
        const type = dataSelectType.find((t) => t.id === filters.typeId);
        filterParts.push(`Loại giày: ${type?.typeName || "N/A"}`);
      }
      if (filters.colorId) {
        const color = dataSelectColor.find((c) => c.id === filters.colorId);
        filterParts.push(`Màu sắc: ${color?.colorName || "N/A"}`);
      }
      if (filters.materialId) {
        const material = dataSelectMaterial.find(
          (m) => m.id === filters.materialId
        );
        filterParts.push(`Chất liệu: ${material?.materialName || "N/A"}`);
      }
      if (filters.sizeId) {
        const size = dataSelectSize.find((s) => s.id === filters.sizeId);
        filterParts.push(`Kích cỡ: ${size?.sizeName || "N/A"}`);
      }
      if (filters.soleId) {
        const sole = dataSelectSole.find((s) => s.id === filters.soleId);
        filterParts.push(`Đế giày: ${sole?.soleName || "N/A"}`);
      }
      if (filters.genderId) {
        const gender = dataSelectGender.find((g) => g.id === filters.genderId);
        filterParts.push(`Giới tính: ${gender?.genderName || "N/A"}`);
      }
      if (filters.minPrice !== null) {
        filterParts.push(
          `Giá tối thiểu: ${filters.minPrice?.toLocaleString() || 0}`
        );
      }
      if (filters.maxPrice !== null) {
        filterParts.push(
          `Giá tối đa: ${filters.maxPrice?.toLocaleString() || 0}`
        );
      }

      return filterParts.length > 0
        ? filterParts.join(", ")
        : "Chưa có dữ liệu lọc";
    },
    [
      dataSelectProduct,
      dataSelectBrand,
      dataSelectType,
      dataSelectColor,
      dataSelectMaterial,
      dataSelectSize,
      dataSelectSole,
      dataSelectGender,
    ]
  );

  // Memoize add view handler
  const addViewProduct = useCallback(async (productId) => {
    try {
      await apiAddViewProduct(productId);
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
    }
  }, []);

  // Fetch data only once on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          brandData,
          productData,
          typeData,
          colorData,
          materialData,
          sizeData,
          soleData,
          genderData,
        ] = await Promise.all([
          fetchDataSelectBrand(),
          fetchDataSelectProduct(),
          fetchDataSelectType(),
          fetchDataSelectColor(),
          fetchDataSelectMaterial(),
          fetchDataSelectSize(),
          fetchDataSelectSole(),
          fetchDataSelectGender(),
        ]);

        setDataSelectBrand(brandData.data);
        setDataSelectProduct(productData.data);
        setDataSelectType(typeData.data);
        setDataSelectColor(colorData.data);
        setDataSelectMaterial(materialData.data);
        setDataSelectSize(sizeData.data);
        setDataSelectSole(soleData.data);
        setDataSelectGender(genderData.data);
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Content>
        <Layout>
          <Sider width={200} style={{ backgroundColor: "white" }}>
            <Content style={{ padding: "0.5rem" }}>
              <FilterSelect
                onFilter={handleFilter}
                onPaginationChange={handlePaginationChange}
                pagination={pagination}
                dataSelectProduct={dataSelectProduct}
                dataSelectBrand={dataSelectBrand}
                dataSelectType={dataSelectType}
                dataSelectColor={dataSelectColor}
                dataSelectMaterial={dataSelectMaterial}
                dataSelectSize={dataSelectSize}
                dataSelectSole={dataSelectSole}
                dataSelectGender={dataSelectGender}
                productName={urlParams.productName}
                brandName={urlParams.brandName}
                typeName={urlParams.typeName}
                colorName={urlParams.colorName}
                materialName={urlParams.materialName}
                genderName={urlParams.genderName}
              />
            </Content>
          </Sider>

          <Content style={{ padding: "0 0 0 7px", minHeight: 280 }}>
            <Card
              style={{ borderRadius: 0, marginBottom: "0.3rem" }}
              title={
                <Row
                  style={{
                    fontSize: "19px",
                    fontWeight: "normal",
                    backgroundColor: `${COLORS.backgroundcolor2}`,
                    padding: "10px",
                    margin: "1rem",
                    color: `${COLORS.pending}`,
                  }}
                >
                  SẢN PHẨM LỌC THEO:{" "}
                  {formatFiltersToString(filteredData?.filters)}
                </Row>
              }
            >
              <Row gutter={[5, 5]} wrap>
                {filteredData.products.length > 0 ? (
                  filteredData.products.map((product, index) => (
                    <Col key={index} flex={"20%"} style={{ maxWidth: "20%" }}>
                      <Link
                        to={`/products/product-detail/${product.productId}?colorId=${product.colorId}&sizeId=${product.sizeId}&genderId=${product.genderId}&materialId=${product.materialId}&soleId=${product.soleId}`}
                        style={{
                          textDecoration: "none",
                          color: "black",
                          fontWeight: "normal",
                        }}
                        onClick={() => addViewProduct(product.productId)}
                      >
                        <PropProduct
                          product={{
                            name:
                              product.productName?.trim() ||
                              "Sản phẩm chưa có tên",
                            price: product.price ?? 0,
                            promotionView: {
                              rangePriceRoot:
                                product.promotionView?.rangePriceRoot,
                              rangePriceAfterPromotion:
                                product.promotionView?.rangePriceAfterPromotion,
                              maxDiscount: product.promotionView?.maxDiscount,
                            },
                            sale: product.sold ?? 0,
                            url: product.imageUrl || "https://placehold.co/50",
                            views: product.views ?? 0,
                            rate: product.rate ?? 5,
                          }}
                        />
                      </Link>
                    </Col>
                  ))
                ) : (
                  <div>Không tìm thấy sản phẩm nào!</div>
                )}
              </Row>
              <Row className="p-3">
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.totalElements}
                  onChange={onPageChange}
                  showSizeChanger
                  pageSizeOptions={["10", "20", "50"]}
                />
              </Row>
            </Card>
          </Content>
        </Layout>
      </Content>
    </>
  );
}

export default ProductsPage;
