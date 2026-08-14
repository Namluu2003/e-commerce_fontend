import { Select, Row, Col, Card } from "antd";

const FilterSection = ({
                           setPagination,
                           setFilterActive,
                           setRequestFilter,
                           requestFilter,
                           dataSelectProduct,
                           dataSelectBrand,
                           dataSelectType,
                           dataSelectColor,
                           dataSelectMaterial,
                           dataSelectSize,
                           dataSelectSole,
                           dataSelectGender,
                       }) => {
    const filters = [
        { key: "productName", placeholder: "Tất cả sản phẩm", data: dataSelectProduct, valueKey: "productName" },
        { key: "brandName", placeholder: "Tất cả thương hiệu", data: dataSelectBrand, valueKey: "brandName" },
        { key: "typeName", placeholder: "Tất cả loại giày", data: dataSelectType, valueKey: "typeName" },
        { key: "colorName", placeholder: "Tất cả màu sắc", data: dataSelectColor, valueKey: "colorName" },
        { key: "materialName", placeholder: "Tất cả chất liệu", data: dataSelectMaterial, valueKey: "materialName" },
        { key: "sizeName", placeholder: "Tất cả kích cỡ", data: dataSelectSize, valueKey: "sizeName" },
        { key: "soleName", placeholder: "Tất cả loại đế giày", data: dataSelectSole, valueKey: "soleName" },
        { key: "genderName", placeholder: "Tất cả giới tính", data: dataSelectGender, valueKey: "genderName" },
    ];

    const handleChange = (key, value) => {
        setFilterActive(true);
        setPagination((prev) => ({ ...prev, current: 1 }));
        setRequestFilter((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <Card style={{ padding: "16px", backgroundColor: "#f9f9f9" }}>
            <Row gutter={[16, 16]}>
                {filters.map(({ key, placeholder, data, valueKey }) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={key}>
                        <Select
                            showSearch
                            style={{ width: "100%" }}
                            placeholder={placeholder}
                            value={requestFilter[key] ?? null}
                            optionFilterProp="label"
                            onChange={(value) => handleChange(key, value)}
                            options={[
                                { value: null, label: placeholder },
                                ...(data?.map((item) => ({
                                    value: item[valueKey],
                                    label: key === "colorName" ? (
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                          style={{
                              width: "1.2rem",
                              height: "1.2rem",
                              backgroundColor: item.code,
                              borderRadius: "50%",
                              border: "1px solid #ccc",
                          }}
                      />
                                            {item[valueKey]}
                                        </div>
                                    ) : (
                                        item[valueKey]
                                    ),
                                })) || []),
                            ]}
                        />
                    </Col>
                ))}
            </Row>
        </Card>
    );
};

export default FilterSection;
