import React, { useEffect, useRef, useState } from "react";
import {
  Row,
  Col,
  Select,
  InputNumber,
  Button,
  Card,
  Table,
  Form,
  Upload,
  notification,
  Modal,
} from "antd";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  apiGetAttributeOfproductExists,
  createProductDetailList,
  fetchDataSelectBrandHD,
  fetchDataSelectColorHD,
  fetchDataSelectGenderHD,
  fetchDataSelectMaterialhd,
  fetchDataSelectProducthd,
  fetchDataSelectSizehd,
  fetchDataSelectSolehd,
  fetchDataSelectTypehd,
} from "./ApiProductDetail";
import { PlusOutlined } from "@ant-design/icons";
import { MdAdd } from "react-icons/md";
import { createProduct } from "../Product/ApiProduct";
import ModalAddProduct from "../Product/ModalAddProduct";
import { createSize } from "../Size/ApiSize";
import { createColor } from "../Color/ApiColor";
import { createBrand } from "../Brand/apibrand";
import { createSole } from "../Sole/ApiSole";
import { createType } from "../Type/ApiType";
import { createMaterial } from "../Material/ApiMaterial";
import { createGender } from "../Gender/ApiGender";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../../../constants/constants";
import ModalAddNew from "./ModalAddNew";
import ModalAddNewSize from "./ModalAddNewSize";
import { a, table } from "framer-motion/client";
import { set } from "lodash";

const ProductDetailDrawer = () => {
  const navigate = useNavigate();

  const [tableData, setTableData] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [products, setProducts] = useState([]);
  const [color, setColor] = useState([]); // Màu sắc đã chọn
  const [size, setSize] = useState([]); // Kích cỡ đã chọn
  const [product, setProduct] = useState(null); // Sản phẩm đã chọn
  const [form] = Form.useForm();
  const [formModalSLVaGia] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [commonQuantity, setCommonQuantity] = useState(0);
  const [commonPrice, setCommonPrice] = useState(0);
  const [commonWeight, setCommonWeight] = useState(0);

  // Modal states
  const [openCreateProduct, setOpenCreateProduct] = useState(false);
  const [addTypeModalVisible, setAddTypeModalVisible] = useState(false);
  const [addBrandModalVisible, setAddBrandModalVisible] = useState(false);
  const [addColorModalVisible, setAddColorModalVisible] = useState(false);
  const [addSizeModalVisible, setAddSizeModalVisible] = useState(false);
  const [addMaterialModalVisible, setAddMaterialModalVisible] = useState(false);
  const [addSoleModalVisible, setAddSoleModalVisible] = useState(false);
  const [addGenderModalVisible, setAddGenderModalVisible] = useState(false);

  const [loading, setLoading] = useState(false);
  const [dataSelectBrand, setDataSelectBrand] = useState([]);
  const [dataSelectColor, setDataSelectColor] = useState([]);
  const [dataSelectGender, setDataSelectGender] = useState([]);
  const [dataSelectMaterial, setDataSelectMaterial] = useState([]);
  const [dataSelectProduct, setDataSelectProduct] = useState([]);
  const [dataSelectSize, setDataSelectSize] = useState([]);
  const [dataSelectSole, setDataSelectSole] = useState([]);
  const [dataSelectType, setDataSelectType] = useState([]);

  const [request, setRequest] = useState({
    status: "HOAT_DONG",
    productId: null,
    brandId: null,
    genderId: null,
    materialId: null,
    typeId: null,
    soleId: null,
    colorId: [],
    sizeId: [],
    description: "",
  });

  const [cleanUpImage, setCleanUpImage] = useState([]);
  const cleanUpImageRef = useRef(cleanUpImage);
  const [attributeOfproductExist, setAttributeOfproductExist] = useState();
  useEffect(() => {
    cleanUpImageRef.current = cleanUpImage;
  }, [cleanUpImage]);
  useEffect(() => {
    console.log("dữ liiwu", tableData);
  }, [tableData]);
  useEffect(() => {
    return () => {
      deleteImages(cleanUpImageRef.current);
    };
  }, []);

  // Fetch dữ liệu ban đầu
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [
          brandData,
          colorData,
          genderData,
          materialData,
          productData,
          sizeData,
          soleData,
          typeData,
        ] = await Promise.all([
          fetchDataSelectBrandHD(),
          fetchDataSelectColorHD(),
          fetchDataSelectGenderHD(),
          fetchDataSelectMaterialhd(),
          fetchDataSelectProducthd(),
          fetchDataSelectSizehd(),
          fetchDataSelectSolehd(),
          fetchDataSelectTypehd(),
        ]);
        setDataSelectBrand(brandData.data);
        setDataSelectColor(colorData.data);
        setDataSelectGender(genderData.data);
        setDataSelectMaterial(materialData.data);
        setDataSelectProduct(productData.data);
        setDataSelectSize(sizeData.data);
        setDataSelectSole(soleData.data);
        setDataSelectType(typeData.data);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Đồng bộ state với dữ liệu từ API
  useEffect(() => {
   const init = async () => {
    setProducts(dataSelectProduct);
    setSizes(dataSelectSize);
    setColors(dataSelectColor);

    if (dataSelectProduct.length > 0 && !product) {
      const attributeOfproductExits = await apiGetAttributeOfproductExists(
        dataSelectProduct[0]?.id
      );    
      attributeOfproductExits.data == null ?setAttributeOfproductExist(false):setAttributeOfproductExist(true)
      setProduct(dataSelectProduct[0]?.id || null);
      setRequest((prev) => ({
        ...prev,
        productId: dataSelectProduct[0]?.id || null,
        genderId: dataSelectGender[0]?.id || null,
        materialId: dataSelectMaterial[0]?.id || null,
        soleId: dataSelectSole[0]?.id || null,
        brandId: attributeOfproductExits.data?.brandId || dataSelectBrand[0]?.id,
        typeId: attributeOfproductExits.data?.typeId || dataSelectType[0]?.id,
      }));
    } 
  }
  init();
  }, [
    dataSelectProduct,
    dataSelectSize,
    dataSelectColor,
    dataSelectBrand,
    dataSelectGender,
    dataSelectMaterial,
    dataSelectSole,
    dataSelectType,
  ]);

  // Cloudinary functions
  const cloudinaryUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "uploaddatn");
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dieyhvcou/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    setCleanUpImage((prev) => [...prev, data.public_id]);
    return { url: data.secure_url, public_id: data.public_id };
  };

  const deleteImages = async (imageIds) => {
    if (!imageIds || imageIds.length === 0) return;
    await Promise.all(
      imageIds.map((id) =>
        fetch("http://localhost:8080/cloudinary/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_id: id }),
        })
      )
    );
  };
  const showConfirm = () => {
    Modal.confirm({
      title: "Xác nhận thêm Sản phẩm",
      content:
        "Bạn có chắc chắn muốn thêm các chi tiết của sản phẩm này không?",
      okText: "Xác nhận",

      okButtonProps: {
        style: {
          backgroundColor: "#ff974d", // Nền cam
          borderColor: "#ff974d", // Viền cam
          color: "#fff", // Chữ trắng để dễ nhìn
        },
      },
      cancelText: "Hủy",
      centered: true,
      onOk: handleCreateProductDetail, // Gọi hàm handleOk khi nhấn xác nhận
    });
  };
  const onChange = (color, { fileList }) => {
    const updatedImages = fileList.map((file) => ({
      url: file.response?.url || file.url,
      publicId: file.response?.public_id || file.public_id,
    }));
    setTableData((prev) =>
      prev.map((item) =>
        item.color === color
          ? { ...item, image: updatedImages.slice(0, 6) }
          : item
      )
    );
  };

  const handleRemove = async (file, color) => {
    if (file.response?.public_id) {
      await fetch("http://localhost:8080/cloudinary/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id: file.response.public_id }),
      });
      setTableData((prev) =>
        prev.map((item) =>
          item.color === color
            ? {
                ...item,
                image: item.image.filter(
                  (img) => img.publicId !== file.response.public_id
                ),
              }
            : item
        )
      );
    }
  };

  const onPreview = async (file) => {
    let src =
      file.url ||
      (file.originFileObj && URL.createObjectURL(file.originFileObj));
    if (src) {
      const image = new Image();
      image.src = src;
      const imgWindow = window.open(src);
      imgWindow?.document.write(image.outerHTML);
    }
  };

  // Handlers
  const generateTableData = (
    selectedColors,
    selectedSizes,
    selectedProduct
  ) => {
    if (!selectedColors.length || !selectedSizes.length || !selectedProduct) {
      setTableData([]);
      return;
    }

    const newData = [];
    selectedColors.forEach((colorId) => {
      const colorItem = colors.find((item) => item.id === colorId);
      const productItem = products.find((item) => item.id === selectedProduct);
      if (!colorItem || !productItem) {
        console.error("Missing color or product:", colorId, selectedProduct);
        return;
      }

      const variants = selectedSizes
        .map((sizeId) => {
          const sizeItem = sizes.find((item) => item.id === sizeId);
          if (!sizeItem) {
            console.error("Missing size:", sizeId);
            return null;
          }
          return {
            key: `${colorId}-${sizeId}`,
            colorId,
            sizeId,
            productId: selectedProduct,
            productName: `${productItem.productName} [ ${sizeItem.sizeName}-${colorItem.colorName} ]`,
            quantity: 1,
            price: 1000,
            weight: 500,
            image: [],
            status: 1,
            color: colorId,
            brandId: request.brandId,
            genderId: request.genderId,
            materialId: request.materialId,
            typeId: request.typeId,
            soleId: request.soleId,
            description: request.description,
          };
        })
        .filter(Boolean);

      newData.push(...variants);
    });

    setTableData(newData);
  };

  const handleColorChange = (selectedColors) => {
    setColor(selectedColors);
    setRequest((prev) => ({ ...prev, colorId: selectedColors }));
    generateTableData(selectedColors, size, product);
  };

  const handleSizeChange = (selectedSizes) => {
    setSize(selectedSizes);
    setRequest((prev) => ({ ...prev, sizeId: selectedSizes }));
    generateTableData(color, selectedSizes, product);
  };

  const handleProductChange = async (selectedProduct) => {
    const attributeOfproductExits = await apiGetAttributeOfproductExists(
      selectedProduct
    );    
    attributeOfproductExits.data == null ?setAttributeOfproductExist(false):setAttributeOfproductExist(true)
    setProduct(selectedProduct);
    setRequest((prev) => ({
      ...prev,
      productId: selectedProduct,
      brandId: attributeOfproductExits.data?.brandId || dataSelectBrand[0]?.id,
      typeId: attributeOfproductExits.data?.typeId || dataSelectType[0]?.id,
    }));
    generateTableData(color, size, selectedProduct);
  };

  const handleAttributeChange = (field, value) => {
    setRequest((prev) => ({ ...prev, [field]: value }));
    // Chỉ cập nhật thuộc tính tương ứng trong tableData, giữ nguyên các giá trị khác
    setTableData((prev) =>
      prev.map((item) => ({
        ...item,
        [field]: value, // Cập nhật field cụ thể (brandId, genderId, v.v.)
      }))
    );
  };

  const handleInputChange = (key, dataIndex, value) => {
    const numericValue = Number(value);
    if (numericValue <= 0 && dataIndex !== "weight") {
      notification.error({
        message: "Lỗi nhập liệu",
        description: `${
          dataIndex === "quantity" ? "Số lượng" : "Giá"
        } không được nhỏ hơn hoặc bằng 0!`,
      });
      return;
    }
    if (dataIndex === "price" && numericValue < 1000) {
      notification.error({
        message: "Lỗi nhập liệu",
        description: `
       Giá không được nhỏ hơn 1.000đ!`,
      });
      return;
    }
    setTableData((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [dataIndex]: numericValue } : item
      )
    );
  };

  const handleDelete = (key) => {
    setTableData((prev) => prev.filter((item) => item.key !== key));
  };

  const handleCreateProductDetail = async () => {
    try {
      setLoading(true);
      await createProductDetailList(tableData);
      notification.success({ message: "Thêm sản phẩm thành công!" });
      resetForm();
      navigate(-1);
    } catch (error) {
      notification.error({ message: "Thêm sản phẩm thất bại!" });
      deleteImages(cleanUpImageRef.current);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTableData([]);
    setColor([]);
    setSize([]);
    setProduct(dataSelectProduct[0]?.id || null);
    setRequest({
      status: "HOAT_DONG",
      productId: dataSelectProduct[0]?.id || null,
      brandId: dataSelectBrand[0]?.id || null,
      genderId: dataSelectGender[0]?.id || null,
      materialId: dataSelectMaterial[0]?.id || null,
      typeId: dataSelectType[0]?.id || null,
      soleId: dataSelectSole[0]?.id || null,
      colorId: [],
      sizeId: [],
      description: "",
    });
    setCleanUpImage([]);
  };

  const handleModalOk = async () => {
    try {
      await formModalSLVaGia.validateFields();
      setTableData((prev) =>
        prev.map((item) => ({
          ...item,
          quantity: commonQuantity,
          price: commonPrice,
          weight: commonWeight,
        }))
      );
      // formModalSLVaGia.resetFields();
      setIsModalVisible(false);
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  const handleModalCancel = () => {
    setCommonQuantity(0);
    setCommonPrice(0);
    setCommonWeight(0);
    setIsModalVisible(false);
  };

  const columns = [
    { title: "Tên sản phẩm", dataIndex: "productName" },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      render: (text, record) => (
        <InputNumber
          // min={1}
          max={9999}
          maxLength={4}
          value={record.quantity}
          onChange={(value) => handleInputChange(record.key, "quantity", value)}
          addonAfter="Đôi"
        />
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      render: (text, record, index) => (
        <InputNumber
          // min={100}
          max={99999999}
          step={10000}
          maxLength={8}
          value={record.price}
          onChange={(value) => handleInputChange(record.key, "price", value)}
          addonAfter="VNĐ"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
        />
      ),
    },
    {
      title: "Cân nặng",
      dataIndex: "weight",
      render: (text, record) => (
        <InputNumber
          min={100}
          max={9999}
          maxLength={4}
          value={record.weight}
          onChange={(value) => handleInputChange(record.key, "weight", value)}
          addonAfter="gram"
        />
      ),
    },
    {
      title: "Action",
      render: (_, record) => (
        <Button type="primary" onClick={() => handleDelete(record.key)}>
          Xóa
        </Button>
      ),
    },
    {
      title: "Hình ảnh",
      dataIndex: "color",
      width: 400,
      fixed: "right",
      render: (text, record) => {
        const isFirst =
          record.key ===
          tableData.find((item) => item.color === record.color)?.key;
        const imageList = Array.isArray(record.image) ? record.image : [];
        return isFirst ? (
          <Form.Item>
            <Upload
              customRequest={({ file, onSuccess, onError }) =>
                cloudinaryUpload(file)
                  .then((data) => onSuccess(data))
                  .catch(onError)
              }
              listType="picture-card"
              onChange={(info) => onChange(record.color, info)}
              onRemove={(file) => handleRemove(file, record.color)}
              onPreview={onPreview}
              multiple={true}
              accept="image/jpeg, image/png"
            >
              {imageList.length < 6 && (
                <button style={{ border: 0, background: "none" }} type="button">
                  <PlusOutlined />
                  <div>Upload</div>
                </button>
              )}
            </Upload>
          </Form.Item>
        ) : null;
      },
      onCell: (record) => ({
        rowSpan: tableData.filter((item) => item.color === record.color).length,
      }),
    },
  ];

  const groupedData = color.map((colorId) => ({
    colorName: dataSelectColor.find((c) => c.id === colorId)?.colorName || "",
    rows: tableData.filter((row) => row.colorId === colorId),
  }));

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card style={{ marginBottom: "1rem" }}>
          <h6 style={{ fontWeight: "bold" }}>Thông tin cơ bản</h6>
          <Row gutter={[16, 0]}>
            <Col span={24}>
              <div>Tên sản phẩm</div>
              <Row gutter={[5, 0]}>
                <Col>
                  <Select
                    showSearch
                    style={{ width: "15rem" }}
                    placeholder="Chọn sản phẩm"
                    value={request.productId}
                    onChange={handleProductChange}
                    options={dataSelectProduct.map((p) => ({
                      value: p.id,
                      label: p.productName,
                    }))}
                    
                  />
                </Col>
                <Col>
                  <Button
                    style={{ padding: 0, backgroundColor: COLORS.primary }}
                    onClick={() => setOpenCreateProduct(true)}
                  >
                    <MdAdd size={25} color="white" />
                  </Button>
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <div>Mô tả</div>
              <ReactQuill
                theme="snow"
                value={request.description}
                onChange={(value) =>
                  handleAttributeChange("description", value)
                }
                maxLength={1000}
              />
            </Col>
          </Row>
        </Card>
        <Card>
          <h6>Thuộc tính</h6>
          <Row gutter={[0, 16]} className="mb-2">
            <Col span={8}>
              <div>Thương hiệu</div>
              <Row gutter={[5, 0]}>
                <Col>
                  <Select
                    showSearch
                    style={{ width: "15rem" }}
                    placeholder="Chọn thương hiệu"
                    value={request.brandId}
                    onChange={(value) =>
                      handleAttributeChange("brandId", value)
                    }
                    options={dataSelectBrand.map((b) => ({
                      value: b.id,
                      label: b.brandName,
                    }))}
                    disabled={attributeOfproductExist}
                  />
                </Col>
                <Col>
                  <Button
                    style={{ padding: 0, backgroundColor: COLORS.primary }}
                    onClick={() => setAddBrandModalVisible(true)}
                  >
                    <MdAdd size={25} color="white" />
                  </Button>
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <div>Giới tính</div>
              <Row gutter={[5, 0]}>
                <Col>
                  <Select
                    showSearch
                    style={{ width: "15rem" }}
                    placeholder="Chọn giới tính"
                    value={request.genderId}
                    onChange={(value) =>
                      handleAttributeChange("genderId", value)
                    }
                    options={dataSelectGender.map((g) => ({
                      value: g.id,
                      label: g.genderName,
                    }))}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <div>Chất liệu</div>
              <Row gutter={[5, 0]}>
                <Col>
                  <Select
                    showSearch
                    style={{ width: "15rem" }}
                    placeholder="Chọn chất liệu"
                    value={request.materialId}
                    onChange={(value) =>
                      handleAttributeChange("materialId", value)
                    }
                    options={dataSelectMaterial.map((m) => ({
                      value: m.id,
                      label: m.materialName,
                    }))}
                  />
                </Col>
                <Col>
                  <Button
                    style={{ padding: 0, backgroundColor: COLORS.primary }}
                    onClick={() => setAddMaterialModalVisible(true)}
                  >
                    <MdAdd size={25} color="white" />
                  </Button>
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <div>Loại giày</div>
              <Row gutter={[5, 0]}>
                <Col>
                  <Select
                    showSearch
                    style={{ width: "15rem" }}
                    placeholder="Chọn loại giày"
                    value={request.typeId}
                    onChange={(value) => handleAttributeChange("typeId", value)}
                    options={dataSelectType.map((t) => ({
                      value: t.id,
                      label: t.typeName,
                    }))}
                    disabled={attributeOfproductExist}

                  />
                </Col>
                <Col>
                  <Button
                    style={{ padding: 0, backgroundColor: COLORS.primary }}
                    onClick={() => setAddTypeModalVisible(true)}
                  >
                    <MdAdd size={25} color="white" />
                  </Button>
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <div>Loại đế giày</div>
              <Row gutter={[5, 0]}>
                <Col>
                  <Select
                    showSearch
                    style={{ width: "15rem" }}
                    placeholder="Chọn loại đế giày"
                    value={request.soleId}
                    onChange={(value) => handleAttributeChange("soleId", value)}
                    options={dataSelectSole.map((s) => ({
                      value: s.id,
                      label: s.soleName,
                    }))}
                  />
                </Col>
                <Col>
                  <Button
                    style={{ padding: 0, backgroundColor: COLORS.primary }}
                    onClick={() => setAddSoleModalVisible(true)}
                  >
                    <MdAdd size={25} color="white" />
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            {" "}
            <Col span={8}>
              <div>Màu sắc</div>
              <Row gutter={[5, 0]}>
                <Col>
                  <Select
                    mode="multiple"
                    showSearch
                    style={{ width: "15rem" }}
                    placeholder="Chọn màu sắc"
                    value={request.colorId}
                    onChange={handleColorChange}
                    options={dataSelectColor.map((c) => ({
                      value: c.id,
                      label: (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
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
                    }))}
                  />
                </Col>
                <Col>
                  <Button
                    style={{ padding: 0, backgroundColor: COLORS.primary }}
                    onClick={() => setAddColorModalVisible(true)}
                  >
                    <MdAdd size={25} color="white" />
                  </Button>
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <div>Kích cỡ</div>
              <Row gutter={[5, 0]}>
                <Col>
                  <Select
                    mode="multiple"
                    showSearch
                    style={{ width: "15rem" }}
                    placeholder="Chọn kích cỡ"
                    value={request.sizeId}
                    onChange={handleSizeChange}
                    options={dataSelectSize.map((s) => ({
                      value: s.id,
                      label: s.sizeName,
                    }))}
                  />
                </Col>
                <Col>
                  <Button
                    style={{ padding: 0, backgroundColor: COLORS.primary }}
                    onClick={() => setAddSizeModalVisible(true)}
                  >
                    <MdAdd size={25} color="white" />
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
        {tableData.length > 0 && (
          <Row gutter={[16, 16]}>
            <Col>
              <Button type="primary" onClick={showConfirm}>
                Lưu thông tin
              </Button>
            </Col>
            <Col>
              <Button type="primary" onClick={() => setIsModalVisible(true)}>
                Chỉnh số lượng và giá chung
              </Button>
            </Col>
          </Row>
        )}
      </Col>
      <Col span={24}>
        <Row gutter={[16, 16]}>
          {groupedData.map((group) => (
            <Col span={24} key={group.colorName}>
              <Card title={`Sản phẩm chi tiết: ${group.colorName}`}>
                <Table
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

      <ModalAddProduct
        open={openCreateProduct}
        onCreate={async (data) => {
          await createProduct(data);
          const productData = await fetchDataSelectProducthd();
          setDataSelectProduct(productData.data);
          setOpenCreateProduct(false);
        }}
        onCancel={() => setOpenCreateProduct(false)}
      />
      <Modal
        title="Chỉnh số lượng và giá chung"
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={[
          <Button key="back" onClick={handleModalCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleModalOk}>
            Xác nhận
          </Button>,
        ]}
      >
        <Form form={formModalSLVaGia} layout="vertical">
          <Form.Item
            label="Số lượng chung"
            name="commonQuantity"
            rules={[
              {
                required: true,
                message: "Số lượng không được để trống và lớn hơn hoặc bằng 1",
              },
              {
                type: "number",
                min: 1,
                message: "Số lượng phải lớn hơn 0",
              },
              {
                type: "number",
                max: 9999,
                message: "Số lượng không được lớn hơn 9999",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              // min={1}
              max={9999}
              maxLength={4}
              value={commonQuantity}
              onChange={setCommonQuantity}
              suffix="Đôi"
            />
          </Form.Item>
          <Form.Item
            label="Giá chung"
            name="commonPrice"
            rules={[
              { required: true, message: "Giá không được để trống" },
              {
                type: "number",
                min: 1000,
                message: "Giá phải lớn hơn 1000",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              // min={100}
              max={99999999}
              maxLength={10}
              step={10000}
              value={commonPrice}
              onChange={setCommonPrice}
              suffix="VNĐ"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>
          <Form.Item
            label="Cân nặng chung"
            name="commonWeight"
            rules={[
              {
                required: true,
                message: "Cân nặng không được để trống",
              },
              {
                type: "number",
                min: 100,
                message: "Cân nặng phải lớn hơn 100",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              max={9999}
              maxLength={4}
              value={commonWeight}
              onChange={setCommonWeight}
              suffix="gram"
            />
          </Form.Item>
        </Form>
      </Modal>
      <ModalAddNew
        open={addTypeModalVisible}
        onCancel={() => setAddTypeModalVisible(false)}
        title="Loại giày"
        req="typeName"
        onCreate={async (data) => {
          await createType(data);
          const typeData = await fetchDataSelectTypehd();
          setDataSelectType(typeData.data);
          setAddTypeModalVisible(false);
        }}
      />
      <ModalAddNew
        open={addBrandModalVisible}
        onCancel={() => setAddBrandModalVisible(false)}
        title="Thương hiệu"
        req="brandName"
        onCreate={async (data) => {
          await createBrand(data);
          const brandData = await fetchDataSelectBrandHD();
          setDataSelectBrand(brandData.data);
          setAddBrandModalVisible(false);
        }}
      />
      <ModalAddNew
        open={addGenderModalVisible}
        onCancel={() => setAddGenderModalVisible(false)}
        title="Giới tính"
        req="genderName"
        onCreate={async (data) => {
          await createGender(data);
          const genderData = await fetchDataSelectGenderHD();
          setDataSelectGender(genderData.data);
          setAddGenderModalVisible(false);
        }}
      />
      <ModalAddNew
        open={addMaterialModalVisible}
        onCancel={() => setAddMaterialModalVisible(false)}
        title="Chất liệu"
        req="materialName"
        onCreate={async (data) => {
          await createMaterial(data);
          const materialData = await fetchDataSelectMaterialhd();
          setDataSelectMaterial(materialData.data);
          setAddMaterialModalVisible(false);
        }}
      />
      <ModalAddNew
        open={addSoleModalVisible}
        onCancel={() => setAddSoleModalVisible(false)}
        title="Đế giày"
        req="soleName"
        onCreate={async (data) => {
          await createSole(data);
          const soleData = await fetchDataSelectSolehd();
          setDataSelectSole(soleData.data);
          setAddSoleModalVisible(false);
        }}
      />
      <ModalAddNew
        open={addColorModalVisible}
        onCancel={() => setAddColorModalVisible(false)}
        title="Màu sắc"
        req="colorName"
        onCreate={async (data) => {
          await createColor(data);
          const colorData = await fetchDataSelectColorHD();
          setDataSelectColor(colorData.data);
          setAddColorModalVisible(false);
        }}
      />
      <ModalAddNewSize
        open={addSizeModalVisible}
        onCancel={() => setAddSizeModalVisible(false)}
        title="Kích cỡ"
        req="sizeName"
        onCreate={async (data) => {
          await createSize(data);
          const sizeData = await fetchDataSelectSizehd();
          setDataSelectSize(sizeData.data);
          setAddSizeModalVisible(false);
        }}
      />
    </Row>
  );
};

export default ProductDetailDrawer;
