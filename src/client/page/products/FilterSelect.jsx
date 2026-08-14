import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Row, Col, Select, InputNumber, Button, Space } from "antd";
import { apiFilter } from "./api";
import Title from "antd/es/typography/Title";
import { COLORS } from "../../../constants/constants";


const FilterSelect = ({
  onFilter,
  onPaginationChange,
  pagination = { current: 1, pageSize: 10 },
  dataSelectProduct = [],
  dataSelectBrand = [],
  dataSelectType = [],
  dataSelectColor = [],
  dataSelectMaterial = [],
  dataSelectSize = [],
  dataSelectSole = [],
  dataSelectGender = [],
  productName,
  brandName,
  typeName,
  colorName,
  materialName,
  genderName,
  sizeName,
  soleName,
}) => {
  // Khởi tạo state filter ban đầu và memoize để tránh tạo lại object mỗi lần render
  const initialFilterState = useMemo(() => ({
    productId: null,
    brandId: null,
    typeId: null,
    colorId: null,
    materialId: null,
    sizeId: null,
    soleId: null,
    genderId: null,
    minPrice: null,
    maxPrice: null,
  }), []);

  // State quản lý các filter hiện tại
  const [requestFilter, setRequestFilter] = useState(initialFilterState);

  // Memoize các options cho các Select component để tránh tạo lại mỗi lần render
  const selectOptions = useMemo(() => ({
    product: [
      { value: null, label: "Tất cả sản phẩm" },
      ...dataSelectProduct.map((p) => ({
        value: p.id,
        label: p.productName,
      })),
    ],
    brand: [
      { value: null, label: "Tất cả thương hiệu" },
      ...dataSelectBrand.map((b) => ({
        value: b.id,
        label: b.brandName,
      })),
    ],
    type: [
      { value: null, label: "Tất cả loại giày" },
      ...dataSelectType.map((t) => ({
        value: t.id,
        label: t.typeName,
      })),
    ],
    color: [
      { value: null, label: "Tất cả màu sắc" },
      ...dataSelectColor.map((c) => ({
        value: c.id,
        label: (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "1.2rem",
                height: "1.2rem",
                backgroundColor: c.code,
                borderRadius: "50%",
                border: "1px solid #ccc",
              }}
            />
            {c.colorName}
          </div>
        ),
        title: c.colorName,
      })),
    ],
    material: [
      { value: null, label: "Tất cả chất liệu" },
      ...dataSelectMaterial.map((m) => ({
        value: m.id,
        label: m.materialName,
      })),
    ],
    gender: [
      { value: null, label: "Tất cả giới tính" },
      ...dataSelectGender.map((g) => ({
        value: g.id,
        label: g.genderName,
      })),
    ],
  }), [dataSelectProduct, dataSelectBrand, dataSelectType, dataSelectColor, 
       dataSelectMaterial, dataSelectGender]);

  // Effect để cập nhật filter khi URL parameters thay đổi
  useEffect(() => {
    const newRequestFilter = {
      productId: dataSelectProduct.find(p => p.productName === productName)?.id || null,
      brandId: dataSelectBrand.find(b => b.brandName === brandName)?.id || null,
      typeId: dataSelectType.find(t => t.typeName === typeName)?.id || null,
      colorId: dataSelectColor.find(c => c.colorName === colorName)?.id || null,
      materialId: dataSelectMaterial.find(m => m.materialName === materialName)?.id || null,
      sizeId: dataSelectSize.find(s => s.sizeName === sizeName)?.id || null,
      soleId: dataSelectSole.find(s => s.soleName === soleName)?.id || null,
      genderId: dataSelectGender.find(g => g.genderName === genderName)?.id || null,
      minPrice: null,
      maxPrice: null,
    };

    setRequestFilter(newRequestFilter);
  }, [productName, brandName, typeName, colorName, materialName, genderName,
      dataSelectProduct, dataSelectBrand, dataSelectType, dataSelectColor,
      dataSelectMaterial, dataSelectGender]);

  // Handler xử lý thay đổi filter, được memoize để tránh tạo lại mỗi lần render
  const handleFilterChange = useCallback((key, value) => {
    // Kiểm tra giá trị minPrice và maxPrice hợp lệ
    if (
      key === "maxPrice" &&
      value !== null &&
      requestFilter.minPrice !== null &&
      value < requestFilter.minPrice
    ) {
      return;
    }
    if (
      key === "minPrice" &&
      value !== null &&
      requestFilter.maxPrice !== null &&
      value > requestFilter.maxPrice
    ) {
      return;
    }
    // Reset về trang đầu tiên khi filter thay đổi
    onPaginationChange({
      current: 1,
      pageSize: pagination?.pageSize || 10,
    });
    // Cập nhật filter
    setRequestFilter(prev => ({
      ...prev,
      [key]: value,
    }));
  }, [requestFilter, onPaginationChange, pagination]);

  // Handler xử lý reset filter, được memoize để tránh tạo lại mỗi lần render
  const handleResetFilter = useCallback(() => {
    setRequestFilter(initialFilterState);
    onPaginationChange({
      current: 1,
      pageSize: pagination?.pageSize || 10,
    });
  }, [initialFilterState, onPaginationChange, pagination]);

  // Effect để fetch dữ liệu khi filter hoặc pagination thay đổi
  const prevPaginationRef = useRef(pagination);
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        const filterParams = {
          productId: requestFilter.productId,
          brandId: requestFilter.brandId,
          genderId: requestFilter.genderId,
          typeId: requestFilter.typeId,
          colorId: requestFilter.colorId,
          materialId: requestFilter.materialId,
          minPrice: requestFilter.minPrice,
          maxPrice: requestFilter.maxPrice,
          page: pagination?.current || 1,
          size: pagination?.pageSize || 10,
        };
        const response = await apiFilter(filterParams);

        // Gửi dữ liệu lên component cha
        onFilter({
          products: response.data,
          pagination: {
            current: pagination?.current || 1,
            pageSize: pagination?.pageSize || 10,
            totalPages: response.meta.totalPages,
            totalElements: response.meta.totalElement,
          },
          filters: requestFilter,
        });
      } catch (error) {
        console.error("Error fetching filtered products:", error);
      }
    };

    // Chỉ gọi API khi pagination hoặc filter thay đổi
    const paginationChanged =
      JSON.stringify(prevPaginationRef.current) !== JSON.stringify(pagination);

    if (paginationChanged || requestFilter) {
      fetchFilteredProducts();
    }

    // Lưu lại giá trị pagination hiện tại
    prevPaginationRef.current = pagination;
  }, [requestFilter, pagination, onFilter]);

  return (
    <Row gutter={[16, 16]}>
      <h5 className="p-2" style={{ color: `${COLORS.primary}` }}>
        Bộ Lọc Tìm Kiếm
      </h5>
      {/* Select sản phẩm */}
      <Col>
        <Select
          showSearch
          style={{ width: "10rem" }}
          placeholder="Tất cả sản phẩm"
          optionFilterProp="label"
          value={requestFilter.productId}
          onChange={(value) => handleFilterChange("productId", value)}
          options={selectOptions.product}
        />
      </Col>
      {/* Select thương hiệu */}
      <Col>
        <Select
          showSearch
          style={{ width: "10rem" }}
          placeholder="Tất cả thương hiệu"
          optionFilterProp="label"
          value={requestFilter.brandId}
          onChange={(value) => handleFilterChange("brandId", value)}
          options={selectOptions.brand}
        />
      </Col>
      {/* Select loại giày */}
      <Col>
        <Select
          showSearch
          style={{ width: "10rem" }}
          placeholder="Tất cả loại giày"
          optionFilterProp="label"
          value={requestFilter.typeId}
          onChange={(value) => handleFilterChange("typeId", value)}
          options={selectOptions.type}
        />
      </Col>
      {/* Select màu sắc */}
      <Col>
        <Select
          showSearch
          style={{ width: "10rem" }}
          placeholder="Tất cả màu sắc"
          optionFilterProp="title"
          value={requestFilter.colorId}
          onChange={(value) => handleFilterChange("colorId", value)}
          options={selectOptions.color}
        />
      </Col>
      {/* Select chất liệu */}
      <Col>
        <Select
          showSearch
          style={{ width: "10rem" }}
          placeholder="Tất cả chất liệu"
          optionFilterProp="label"
          value={requestFilter.materialId}
          onChange={(value) => handleFilterChange("materialId", value)}
          options={selectOptions.material}
        />
      </Col>
      {/* Select giới tính */}
      <Col>
        <Select
          showSearch
          style={{ width: "10rem" }}
          placeholder="Tất cả giới tính"
          optionFilterProp="label"
          value={requestFilter.genderId}
          onChange={(value) => handleFilterChange("genderId", value)}
          options={selectOptions.gender}
        />
      </Col>
      {/* Input giá tối thiểu */}
      <Col>
        <InputNumber
          style={{ width: "10rem" }}
          placeholder="Giá tối thiểu"
          min={0}
          value={requestFilter.minPrice}
          onChange={(value) => handleFilterChange("minPrice", value)}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          suffix="VND"
          step={10000}
        />
      </Col>
      {/* Input giá tối đa */}
      <Col>
        <InputNumber
          style={{ width: "10rem" }}
          placeholder="Giá tối đa"
          min={0}
          value={requestFilter.maxPrice}
          onChange={(value) => handleFilterChange("maxPrice", value)}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          suffix="VND"
          step={10000}
        />
      </Col>
      {/* Button reset filter */}
      <Col>
        <Button onClick={handleResetFilter} type="primary">
          Xóa bộ lọc
        </Button>
      </Col>
    </Row>
  );
};

// Sử dụng React.memo để tránh render lại khi props không thay đổi
export default React.memo(FilterSelect);
