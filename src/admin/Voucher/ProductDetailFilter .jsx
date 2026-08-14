import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Input, Button, Space, Typography, Form, Collapse, message } from 'antd';
import { FilterOutlined, ClearOutlined, SearchOutlined, DownOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title } = Typography;
const { Panel } = Collapse;

const ProductDetailFilter = ({ productDetails, originalDetails, onFilterResults, rootProductDetails }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    types: [],
    colors: [],
    materials: [],
    sizes: [],
    soles: [],
    genders: [],
    weights: [],
  });

  useEffect(() => {
    if (productDetails?.length > 0) {
      setFilterOptions({
        brands: [...new Set((productDetails.map(item => item.brandName)).filter(Boolean))],
        types: [...new Set((productDetails.map(item => item.typeName)).filter(Boolean))],
        colors: [...new Set((productDetails.map(item => item.colorName)).filter(Boolean))],
        materials: [...new Set((productDetails.map(item => item.materialName)).filter(Boolean))],
        sizes: [...new Set((productDetails.map(item => item.sizeName)).filter(Boolean))],
        soles: [...new Set((productDetails.map(item => item.soleName)).filter(Boolean))],
        genders: [...new Set((productDetails.map(item => item.genderName)).filter(Boolean))],
        weights: [...new Set((productDetails.map(item => item.weight)).filter(Boolean))],
      });
    }
  }, [productDetails]);

  const handleSearch = () => {
    try {
      setLoading(true);
      const values = form.getFieldsValue();
      let filteredResults = [...productDetails];

      // Apply filters
      const filters = [
        { key: 'productName', value: values.productName, filter: (item, val) => item.productName?.toLowerCase().includes(val.toLowerCase()) },
        { key: 'brandName', value: values.brandName },
        { key: 'typeName', value: values.typeName },
        { key: 'colorName', value: values.colorName },
        { key: 'materialName', value: values.materialName },
        { key: 'sizeName', value: values.sizeName },
        { key: 'soleName', value: values.soleName },
        { key: 'genderName', value: values.genderName },
        { key: 'weight', value: values.weight },
      ];

      filters.forEach(({ key, value, filter }) => {
        if (value) {
          filteredResults = filteredResults.filter(item => filter ? filter(item, value) : item[key] === value);
        }
      });

      if (!Object.values(values).some(Boolean)) {
        filteredResults = [...originalDetails];
      }

      onFilterResults(filteredResults);
      message.success(`Tìm thấy ${filteredResults.length} sản phẩm phù hợp`);
    } catch (error) {
      console.error("Lỗi khi lọc sản phẩm:", error);
      message.error("Đã xảy ra lỗi khi tìm kiếm sản phẩm!");
      onFilterResults([]);
    } finally {
      setLoading(false);
    }
  };
  const handleClearForm = () => {
    form.resetFields();
    onFilterResults(rootProductDetails); // rootProductDetails sẽ là originalProductDetails từ AddPromotion
  };

  const filterOption = (input, option) => option.children.toLowerCase().includes(input.toLowerCase());

  const renderSelect = (name, label, options) => (
    <Col xs={24} sm={12} md={8} lg={6}>
      <Form.Item name={name} label={label}>
        <Select
          placeholder={`Chọn ${label.toLowerCase()}`}
          allowClear
          showSearch
          filterOption={filterOption}
          onChange={(value) => !value && handleSearch()}
        >
          {options.map(item => <Option key={item} value={item}>{item}</Option>)}
        </Select>
      </Form.Item>
    </Col>
  );

  return (
    <Card style={{ marginBottom: '10px' }}>
      <Title level={4}><FilterOutlined /> Bộ lọc sản phẩm chi tiết</Title>
      <Form form={form} layout="vertical">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="productName" label="Tên Sản Phẩm">
              <Input placeholder="Nhập tên sản phẩm" allowClear onChange={(e) => !e.target.value && handleSearch()} />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Collapse defaultActiveKey={['1']} expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}>
              <Panel header="Bộ lọc nâng cao" key="1">
                <Row gutter={[8, 0]}>
                  {renderSelect('brandName', 'Thương Hiệu', filterOptions.brands)}
                  {renderSelect('typeName', 'Loại', filterOptions.types)}
                  {renderSelect('colorName', 'Màu Sắc', filterOptions.colors)}
                  {renderSelect('materialName', 'Chất Liệu', filterOptions.materials)}
                  {renderSelect('sizeName', 'Kích Cỡ', filterOptions.sizes)}
                  {renderSelect('soleName', 'Đế Giày', filterOptions.soles)}
                  {renderSelect('genderName', 'Giới Tính', filterOptions.genders)}
                  {renderSelect('weight', 'Trọng lượng', filterOptions.weights)}
                </Row>
              </Panel>
            </Collapse>
          </Col>
        </Row>
        <Row justify="end">
          <Space>
            <Button icon={<ClearOutlined />} onClick={handleClearForm}>Xóa bộ lọc</Button>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} loading={loading}>Tìm kiếm</Button>
          </Space>
        </Row>
      </Form>
    </Card>
  );
};

export default ProductDetailFilter;