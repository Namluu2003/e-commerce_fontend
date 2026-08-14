import React, { useEffect, useState } from "react";
import {
  Drawer,
  Row,
  Col,
  Select,
  InputNumber,
  Input,
  Button,
  Space,
  Card,
  Table,
  Form,
  Upload,
} from "antd";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const { TextArea } = Input;

const ProductDetailDrawer = ({
  open,
  onClose,
  onSubmit,
  request,
  setRequest,
  dataSelectProduct,
  dataSelectBrand,
  dataSelectGender,
  dataSelectMaterial,
  dataSelectType,
  dataSelectSole,
  dataSelectColor,
  dataSelectSize,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [value, setValue] = useState("");
  const [tableData, setTableData] = useState([]);
  const [colors, setColors] = useState([]); // Khởi tạo với mảng rỗng để tránh lỗi
  const [sizes, setSizes] = useState([]);
  const [color, setColor] = useState([]); // Khởi tạo với mảng rỗng để tránh lỗi
  const [size, setSize] = useState([]);
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    setProducts(dataSelectProduct);
    setSizes(dataSelectSize);
    setColors(dataSelectColor);
  }, [color,size,product]);
  const resetFrom = () => {
    form.resetFields();
    generateTableData(color, size, product);
    setTableData([]);
    setRequest({})
  };
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setHasSelected(newSelectedRowKeys.length > 0);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const handleTableDataChange = (field, value) => {
    const updatedData = tableData.map((item) => ({ ...item, [field]: value }));
    setTableData(updatedData); // Cập nhật lại state
    console.log(tableData);
    
  };

  const handleInputChange = (key, dataIndex, value) => {
    const numericValue = parseFloat(value);

    // Kiểm tra nếu giá trị âm
    if (numericValue < 0) {
      notification.error({
        message: "Lỗi nhập liệu",
        description: `${
          dataIndex === "soLuong" ? "Số lượng" : "Giá"
        } không được nhỏ hơn 0`,
        duration: 3,
      });
      return; // Dừng xử lý khi phát hiện giá trị âm
    }
    const updatedData = tableData.map((item) => {
      if (item.key === key) {
        return { ...item, [dataIndex]: numericValue };
      }
      return item;
    });
    setTableData(updatedData);
    console.log(tableData);
  };
  const columns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
    },

    {
      title: "Số lượng",
      dataIndex: "quantity",
      render: (text, record) => (
        <Input
          type="number"
          min={0}
          value={record.quantity}
          defaultValue={text}
          onChange={(e) =>
            handleInputChange(record.key, "quantity", e.target.value)
          }
          suffix={<span>Đôi</span>}
        />
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      render: (text, record) => (
        <Input
          type="number"
          min={0}
          defaultValue={text}
          value={record.price}
          onChange={(e) =>
            handleInputChange(record.key, "price", e.target.value)
          }
          suffix={<span>VNĐ</span>}
        />
      ),
    },
    {
      title: "Cân nặng",
      dataIndex: "weight",
      render: (text, record) => (
        <Input
          type="number"
          min={0}
          defaultValue={text}
          value={record.weight}
          onChange={(e) =>
            handleInputChange(record.key, "weight", e.target.value)
          }
          suffix={<span>Kg</span>}
        />
      ),
    },
    {
      title: "Action",
      dataIndex: "status",
      render: (text, record) => (
        <Button type="primary" danger onClick={() => handleDelete(record.key)}>
          Xóa
        </Button>
      ),
    },
  ];
  const generateTableData = (
    selectedColors,
    selectedSizes,
    selectedProduct
  ) => {
    const newData = [];

    selectedColors.forEach((color) => {
      const colorItem = colors.find((item) => item.id === color);
      const productItem = products.find((item) => item.id === selectedProduct);
      if (!productItem) {
        console.log(products);
        
        console.error("Không tìm thấy sản phẩm với id:", selectedProduct);
        return; // Dừng nếu không tìm thấy sản phẩm
      }
      const variants = selectedSizes.map((size) => {
        const sizeItem = sizes.find((item) => item.id === size); // Sửa lỗi

        return {
          key: `${color}-${size}`,
          colorId: color,
          sizeId: size,
          productId: product, //selectedProduct.id,
          productName: `${productItem.productName} [ ${sizeItem.sizeName}-${colorItem.colorName} ]`,
          quantity: 0,
          price: 0,
          image: "",
          status: 1,
          color: color, // Thêm trường color để nhóm các dòng cùng màu
          // mỗi biến thể khi render ra đều có các thuộc tính
          brandId: request.brandId||null,
          materialId: request.materialId||null,
          genderId: request.genderId||null,
          typeId: request.typeId||null,
          soleId: request.soleId||null,
          description: request.description||null,
        };
      });

      console.log(tableData);
      console.log(productItem);
      
      newData.push(...variants);
    });

    setTableData(newData);
  };
  const handleColorChange = (selectedColors) => {
    setColor(selectedColors);
    console.log("color đã chọn" + color);

    generateTableData(selectedColors, size, product);
  };

  const handleSizeChange = (selectedSizes) => {
    setSize(selectedSizes);
    generateTableData(color, selectedSizes, product);
  };
  const handleProductChange = (selectedProduct) => {
    setProduct(selectedProduct);
    generateTableData(color, size, selectedProduct);
    console.log(selectedProduct);
  };
  const handleDelete = (key) => {
    const updatedData = tableData.filter((item) => item.key !== key); // Lọc bỏ dòng có key tương ứng
    setTableData(updatedData); // Cập nhật lại dữ liệu
  };
  const groupedData = color.map((colorId) => ({
    colorName: dataSelectColor.find((c) => c.id === colorId)?.colorName,
    rows: tableData.filter((row) => row.colorId === colorId),
  }));
  return (
    <Drawer
      title="Thêm sản phẩm"
      width={1440}
      onClose={onClose}
      open={open}
      bodyStyle={{
        paddingBottom: 80,
      }}
      extra={
        <Space>
          <Button onClick={onClose}>Hủy</Button>
          <Button  onClick={async () => {
                await onSubmit(tableData);
                resetFrom();
              }} type="primary">
            Thêm
          </Button>
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card
            style={{
              marginBottom: "1rem",
            }}
          >
            <Row gutter={[16, 16]}>
              <Col>
                <h6>Thông tin cơ bản</h6>
              </Col>
              <Col span={24}>
                <div>Tên sản phẩm</div>
                <Form.Item>

                <Select
                  showSearch
                  style={{ width: "12rem" }}
                  placeholder="Chọn sản phẩm"
                  optionFilterProp="label"
                  value={request.productId}
                  onChange={handleProductChange}
                  options={dataSelectProduct?.map((p) => ({
                    value: p.id,
                    label: p.productName,
                  }))}
                />
                </Form.Item>
              </Col>
              <Col span={24}>
                <div>Mô tả</div>
                <ReactQuill
                  theme="snow"
                  value={request.description}
                  placeholder="Mô tả tối đa 200 từ"
                   onChange={(value) =>{
                    setRequest((prev) => ({
                      ...prev,
                      description: value,
                    }))

                    handleTableDataChange("description",value)
                  }
             
                  }
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, false] }],
                      ["bold", "italic", "underline"],
                      [false, false],
                    ],
                  }}
                />
              </Col>
            </Row>
          </Card>
          <Card>
            <Row gutter={[5, 5]}>
              <Col span={24}>
                <h6>Thuộc tính</h6>
              </Col>
              <Col span={8}>
                <div>Thương hiệu</div>
                <Select
                  showSearch
                  style={{ width: "12rem" }}
                  placeholder="Chọn thương hiệu"
                  optionFilterProp="label"
                  value={request.brandId}
                  onChange={(value) =>{
                    setRequest((prev) => ({
                      ...prev,
                      brandId: value,
                    }))

                    handleTableDataChange("brandId",value)
                  }
             
                  }
                  options={dataSelectBrand?.map((b) => ({
                    value: b.id,
                    label: b.brandName,
                  }))}
                />
              </Col>
              <Col span={8}>
                <div>Giới tính</div>
                <Select
                  showSearch
                  style={{ width: "12rem" }}
                  placeholder="Chọn giới tính"
                  optionFilterProp="label"
                  value={request.genderId}
                  onChange={(value) =>{
                    setRequest((prev) => ({
                      ...prev,
                      genderId: value,
                    }))

                    handleTableDataChange("genderId",value)
                  }
             
                  }
                  options={dataSelectGender?.map((g) => ({
                    value: g.id,
                    label: g.genderName,
                  }))}
                />
              </Col>
              <Col span={8}>
                <div>Chất liệu</div>
                <Select
                  showSearch
                  style={{ width: "12rem" }}
                  placeholder="Chọn chất liệu"
                  optionFilterProp="label"
                  value={request.materialId}
                  onChange={(value) =>{
                    setRequest((prev) => ({
                      ...prev,
                      materialId: value,
                    }))

                    handleTableDataChange("materialId",value)
                  }
             
                  }
                  options={dataSelectMaterial?.map((m) => ({
                    value: m.id,
                    label: m.materialName,
                  }))}
                />
              </Col>
              <Col span={8}>
                <div>Loại giày</div>
                <Select
                  showSearch
                  style={{ width: "12rem" }}
                  placeholder="Chọn loại giày"
                  optionFilterProp="label"
                  value={request.typeId}
                  onChange={(value) =>{
                    setRequest((prev) => ({
                      ...prev,
                      typeId: value,
                    }))

                    handleTableDataChange("typeId",value)
                  }
             
                  }
                  options={dataSelectType?.map((t) => ({
                    value: t.id,
                    label: t.typeName,
                  }))}
                />
              </Col>
              <Col span={8}>
                <div>Loại đế giày</div>
                <Select
                  showSearch
                  style={{ width: "12rem" }}
                  placeholder="Chọn loại đế giày"
                  optionFilterProp="label"
                  value={request.soleId}
                  onChange={(value) =>{
                    setRequest((prev) => ({
                      ...prev,
                      soleId: value,
                    }))

                    handleTableDataChange("soleId",value)
                  }
             
                  }
                  options={dataSelectSole?.map((s) => ({
                    value: s.id,
                    label: s.soleName,
                  }))}
                />
              </Col>
            </Row>
            <Row gutter={[22, 15]} style={{ marginTop: "16px" }}>
              <Col>
                <div>Màu sắc</div>
                <Select
                  mode="multiple"
                  showSearch
                  style={{ width: "12rem" }}
                  placeholder="Chọn màu sắc"
                  optionFilterProp="label"
                  // value={request.colorId}
                  onChange={handleColorChange}
                  options={dataSelectColor?.map((c) => ({
                    value: c.id,
                    label: c.colorName,
                  }))}
                />
              </Col>
              <Col>
                <div>Kích cỡ</div>
                <Select
                  mode="multiple"
                  showSearch
                  style={{ width: "12rem" }}
                  placeholder="Chọn kích cỡ"
                  optionFilterProp="label"
                  // value={request.sizeId}
                  onChange={handleSizeChange}
                  options={dataSelectSize?.map((s) => ({
                    value: s.id,
                    label: s.sizeName,
                  }))}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={12}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Row gutter={[16, 16]}>
                {groupedData.map((group) => (
                  <Col span={24} key={group.colorName}>
                    <Card title={`Sản phẩm chi tiết: ${group.colorName}`}>
                      <Table
                        rowSelection={rowSelection}
                        columns={columns}
                        dataSource={group.rows}
                        pagination={false}
                        rowKey="key"
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </Drawer>
  );
};

export default ProductDetailDrawer;
