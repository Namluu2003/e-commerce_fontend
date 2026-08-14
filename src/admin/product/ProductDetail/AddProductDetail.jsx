import { baseUrl } from "../../../helpers/Helpers.js";
import React, { useEffect, useRef, useState } from "react";
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
  notification,
  Modal,
  ColorPicker,
} from "antd";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  createProductDetailList,
  fetchDataSelectBrand,
  fetchDataSelectBrandHD,
  fetchDataSelectColor,
  fetchDataSelectColorHD,
  fetchDataSelectGender,
  fetchDataSelectGenderHD,
  fetchDataSelectMaterial,
  fetchDataSelectMaterialhd,
  fetchDataSelectProduct,
  fetchDataSelectProducthd,
  fetchDataSelectSize,
  fetchDataSelectSizehd,
  fetchDataSelectSole,
  fetchDataSelectSolehd,
  fetchDataSelectType,
  fetchDataSelectTypehd,
} from "./ApiProductDetail";
import { PlusOutlined } from "@ant-design/icons";
import { IoAddCircleOutline, IoAddCircleSharp } from "react-icons/io5";
import { MdAdd, MdAddBox, MdAddCircleOutline } from "react-icons/md";
import { BiSolidMessageSquareAdd } from "react-icons/bi";
import { IoMdAdd } from "react-icons/io";
import { createProduct } from "../Product/ApiProduct";
import ModalAddProduct from "../Product/ModalAddProduct";
import { createSize } from "../Size/ApiSize";
import { createColor } from "../Color/ApiColor";
import { createBrand } from "../Brand/apibrand";
import { createSole } from "../Sole/ApiSole";
import { createType } from "../Type/ApiType";
import { createMaterial } from "../Material/ApiMaterial";
import { createGender } from "../Gender/ApiGender";
import { Navigate, useNavigate } from "react-router-dom";
import Breadcrumb from "../BreadCrumb";
import { COLORS } from "../../../constants/constants";
import ModalAddNew from "./ModalAddNew";
import ModalAddNewSize from "./ModalAddNewSize";
import {toast} from "react-toastify";

const { TextArea } = Input;

const ProductDetailDrawer = () => {
  const navigate = useNavigate();

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [tableData, setTableData] = useState([]);
  const [colors, setColors] = useState([]); // Khởi tạo với mảng rỗng để tránh lỗi
  const [sizes, setSizes] = useState([]);
  const [color, setColor] = useState([]); // Khởi tạo với mảng rỗng để tránh lỗi
  const [size, setSize] = useState([]);
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState([]);
  const [form] = Form.useForm();
  const [hasSelected, setHasSelected] = useState(false);

  const [formModalSLVaGia] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [commonQuantity, setCommonQuantity] = useState(0);
  const [commonPrice, setCommonPrice] = useState(0);
  const [commonWeight, setCommonWeight] = useState(0);

  // modal
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

  const [totalProducts, setTotalProducts] = useState(0);
  const [request, setRequest] = useState(() => ({
    status: "HOAT_DONG",
  }));

  // them nhanh khi nhap
  const [searchProduct, setSearchProduct] = useState("");
  const [searchBrand, setSearchBrand] = useState("");
  const [searchColor, setSearchColor] = useState("");
  const [searchGender, setSearchGender] = useState("");
  const [searchMaterial, setSearchMaterial] = useState("");
  const [searchSole, setSearchSole] = useState("");
  const [searchSize, setSearchSize] = useState("");
  const [searchType, setSearchType] = useState("");

  const [requestFilter, setRequestFilter] = useState();
  const [requestUpdate, setRequestUpdate] = useState({
    productName: null,
    brandName: null,
    typeName: null,
    colorName: null,
    materialName: null,
    sizeName: null,
    soleName: null,
    genderName: null,
    status: null,
    sortByQuantity: null,
    sortByPrice: null,
  });
  // ảnh
  const [cleanUpImage, setCleanUpImage] = useState([]);

  // Cấu hình Cloudinary
  // Hàm upload ảnh lên Cloudinary và nhận URL và public_id

  const cleanUpImageRef = useRef(cleanUpImage);

  useEffect(() => {
    // Cập nhật giá trị mới của cleanUpImage vào ref khi nó thay đổi
    cleanUpImageRef.current = cleanUpImage;
  }, [cleanUpImage]);

  // Hàm xóa ảnh
  const deleteImages = async (imageIds) => {
    if (!imageIds || imageIds.length === 0) return;

    try {
      const deleteRequests = imageIds.map((id) =>
        fetch(`${baseUrl}/cloudinary/delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_id: id }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.result === "ok") {
              console.log(` Đã xóa ảnh ${id} khỏi Cloudinary`);
            } else {
              console.error("Lỗi xóa ảnh:", data);
            }
          })
          .catch((error) => console.error("Lỗi khi xóa ảnh:", error))
      );

      await Promise.all(deleteRequests); // Đợi tất cả các ảnh được xóa
    } catch (error) {
      console.error("Lỗi khi xóa ảnh hàng loạt:", error);
    }
  };

  useEffect(() => {
    return () => {
      console.log("🧹 Dọn dẹp ảnh...");
      console.log(cleanUpImageRef.current);

      deleteImages(cleanUpImageRef.current); // Gọi hàm xóa ảnh
    };
  }, []);

  useEffect(() => {
    console.log("Clean up images updated:", cleanUpImage);
  }, [cleanUpImage]);

  const cloudinaryUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "uploaddatn"); // Thay bằng preset của bạn

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dieyhvcou/image/upload`, 
      { method: "POST", body: formData }
    );
    const data = await res.json();
    console.log("Cloudinary Upload Response:", data); // Log thông tin trả về từ Cloudinary
    setCleanUpImage((pre) => [...pre, data.public_id]);

    if (data.secure_url && data.public_id) {
      // Trả về thông tin của ảnh (url và public_id)
      return {
        url: data.secure_url, // URL ảnh
        public_id: data.public_id, // public_id ảnh
      };
    } else {
      throw new Error("Upload failed");
    }
  };

  // Hàm xử lý thay đổi (upload và thêm ảnh vào tableData)
  const onChange = async (color, { fileList }) => {
    const updatedImages = fileList.map((file) => ({
      url: file.response?.url || file.url, // Lấy URL từ response (nếu có) hoặc từ fileList
      publicId: file.response?.public_id || file.public_id, // Lấy public_id từ response
      // uid: file.uid,
      // status: file.status,
    }));

    // Cập nhật `tableData` ngay sau khi có URL từ Cloudinary
    setTableData((prev) =>
      prev.map((item) =>
        item.color === color
          ? { ...item, image: updatedImages.slice(0, 6) } // Giữ tối đa 6 ảnh
          : item
      )
    );

    console.log("Updated Table Data:", tableData);
  };

  // Hàm xử lý khi xóa ảnh
  const handleRemove = async (file, color) => {
    console.log(file);

    if (file.response?.public_id) {
      try {
        const res = await fetch(`${baseUrl}/cloudinary/delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_id: file.response?.public_id }),
        });

        const data = await res.json();
        if (data.result === "ok") {
          setTableData((prev) =>
            prev.map((item) =>
              item.color === color
                ? {
                    ...item,
                    image: Array.isArray(item.image)
                      ? item.image.filter(
                          (img) => img.public_id !== file.response?.public_id
                        )
                      : [], // Nếu không phải là mảng, gán thành mảng rỗng
                  }
                : item
            )
          );
        } else {
          console.error("Lỗi xóa ảnh:", data);
        }
      } catch (error) {
        console.error("Lỗi khi xóa ảnh:", error);
      }
    } else {
      console.warn("Ảnh không có public_id, không thể xóa");
    }
    console.log("đây là dữ liệu", tableData);
  };

  // Hàm Preview
  const onPreview = async (file) => {
    let src = file.url;

    if (!src && file.originFileObj) {
      // Nếu chưa có URL, tạo URL tạm thời cho ảnh
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }

    if (typeof src === "string") {
      const image = new Image();
      image.src = src;
      const imgWindow = window.open(src);
      imgWindow?.document.write(image.outerHTML);
    }
  };

  // Cột trong bảng

  // hết doạn up ảnh
  const handleModalOk = async () => {
    try {
      // Kích hoạt validation
      const values = await formModalSLVaGia.validateFields();
      // Nếu validation thành công, thực hiện các hành động bạn muốn
      console.log(values);

      const updatedData = tableData.map((item) => {
        // if (selectedRowKeys.includes(item.key)) {
        return {
          ...item,
          quantity: commonQuantity,
          price: commonPrice,
          weight: commonWeight,
        };
        // }
        // return item;
      });
      setTableData(updatedData);
      formModalSLVaGia.resetFields(); // Đặt lại trường form
      setSelectedRowKeys([]); // Bỏ chọn tất cả các dòng
      setHasSelected(false); // Bỏ chọn tất cả các dòng
      setIsModalVisible(false); // Đóng modal
    } catch (error) {
      // Nếu có lỗi, chỉ cần thông báo
      console.log("Validation failed:", error);
    }
    // Cập nhật giá và số lượng chung cho các dòng được chọn
  };
  const handleModalCancel = () => {
    setCommonPrice(0); // Đặt giá chung về 0
    setCommonWeight(0);
    setCommonQuantity(0); // Đặt số lượng chung về 0
    setSelectedRowKeys([]); // Bỏ chọn tất cả các dòng
    setHasSelected(false); // Bỏ chọn tất cả các dòng
    setIsModalVisible(false); // Đóng modal mà không thay đổi gì
  };
  // thêm nhanh
  const handleCreateProduct = async (productData) => {
    try {
      setLoading(true);
      console.log(request);
      await createProduct(productData);
      fetchDataProduct();
      notification.success({
        message: "Success",
        duration: 4,
        pauseOnHover: false,
        showProgress: true,
        description: `Thêm sản phẩm  thành công!`,
      });
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Error",
        duration: 4,
        pauseOnHover: false,
        showProgress: true,
        description: "Failed to update san pham",
      });
    } finally {
      setLoading(false);
      setOpenCreateProduct(false);
    }
  };

  const handleCreateSize = async (data) => {
    try {
      setLoading(true);
      await createSize(data);
      fetchDataSize();
      notification.success({
        message: "Success",
        duration: 4,
        pauseOnHover: false,
        showProgress: true,
        description: `Thêm Kích cỡ  thành công!`,
      });
      setAddSizeModalVisible(false);
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Error",
        duration: 4,
        pauseOnHover: false,
        showProgress: true,
        description: "Thêm kích cỡ thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateColor = async (data) => {
    try {
      setLoading(true);
      await createColor(data);
      fetchDataColor();
      notification.success({
        message: "Success",
        duration: 4,
        pauseOnHover: false,
        showProgress: true,
        description: `Thêm Màu sắc thành công!`,
      });
      setAddColorModalVisible(false);
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Error",
        duration: 4,
        pauseOnHover: false,
        showProgress: true,
        description: "Thêm Màu sắc thất bại",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleCreateBrand = async (data) => {
    try {
      setLoading(true);
      await createBrand(data);
      fetchDataBrand();
      notification.success({
        message: "Success",
        duration: 4,
        pauseOnHover: false,
        showProgress: true,
        description: `Thêm Thương hiệu thành công!`,
      });
      setAddBrandModalVisible(false);
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Error",
        duration: 4,
        pauseOnHover: false,
        showProgress: true,
        description: "Thêm Thương hiệu thất bại",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleCreateSole = async (data) => {
    try {
      setLoading(true);
      await createSole(data);
      fetchDataSole();
      notification.success({
        message: "Success",
        duration: 4,
        pauseOnHover: false,
        showProgress: true,
        description: `Thêm Đế giày thành công!`,
      });
      setAddSoleModalVisible(false);
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Error",
        duration: 4,
        pauseOnHover: false,
        showProgress: true,
        description: "Thêm Đế giày thất bại",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleCreateType = async (data) => {
    try {
      setLoading(true);
      await createType(data);
      fetchDataType();
      notification.success({
        message: "Success",
        duration: 4,
        pauseOnHover: false,
        showProgress: true,
        description: `Thêm Loại giày thành công!`,
      });
      setAddTypeModalVisible(false);
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Error",
        duration: 4,
        pauseOnHover: false,
        showProgress: true,
        description: "Thêm Loại giày thất bại",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleCreateMaterial = async (data) => {
    try {
      setLoading(true);
      await createMaterial(data);
      fetchDataMaterial();
      notification.success({
        message: "Success",
        duration: 4,
        pauseOnHover: false,
        showProgress: true,
        description: `Thêm Chất liệu thành công!`,
      });
      setAddMaterialModalVisible(false);
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Error",
        duration: 4,
        pauseOnHover: false,
        showProgress: true,
        description: "Thêm Chất liệu thất bại",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleCreateGenDer = async (data) => {
    try {
      setLoading(true);
      await createGender(data);
      fetchDataGender();
      notification.success({
        message: "Success",
        duration: 4,
        pauseOnHover: false,
        showProgress: true,
        description: `Thêm Giới tính thành công!`,
      });
      setAddGenderModalVisible(false);
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Error",
        duration: 4,
        pauseOnHover: false,
        showProgress: true,
        description: "Thêm Giới Tính thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setProducts(dataSelectProduct);
    setSizes(dataSelectSize);
    setColors(dataSelectColor);

    fetchDataBrand();
    fetchDataColor();
    fetchDataGender();
    fetchDataMaterial();
    fetchDataProduct();
    fetchDataSize();
    fetchDataSole();
    fetchDataType();
  }, []);

  useEffect(() => {
    setProducts(dataSelectProduct);
    setSizes(dataSelectSize);
    setColors(dataSelectColor);
  }, [color, size, product]);
  useEffect(() => {
    setRequest((prev) => ({
      ...prev,
      productId: dataSelectProduct[0]?.id || null,
      brandId: dataSelectBrand[0]?.id || null,
      genderId: dataSelectGender[0]?.id || null,
      materialId: dataSelectMaterial[0]?.id || null,
      typeId: dataSelectType[0]?.id || null,
      soleId: dataSelectSole[0]?.id || null,
    }));
    setProduct(dataSelectProduct[0]?.id || null);
  }, [
    dataSelectBrand,
    dataSelectGender,
    dataSelectMaterial,
    dataSelectType,
    dataSelectSole,
  ]); // Chạy lại khi `dataSelectBrand` thay đổi

  const fetchDataBrand = async () => {
    setLoading(true);
    try {
      const response = await fetchDataSelectBrandHD();
      console.log("Response from API brand:", response); // Log response để kiểm tra dữ liệu trả về
      setDataSelectBrand(response.data);
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };
  const fetchDataColor = async () => {
    setLoading(true);
    try {
      const response = await fetchDataSelectColorHD();
      console.log("Response from API color:", response); // Log response để kiểm tra dữ liệu trả về
      setDataSelectColor(response.data);
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };
  const fetchDataGender = async () => {
    setLoading(true);
    try {
      const response = await fetchDataSelectGenderHD();
      console.log("Response from API gender:", response); // Log response để kiểm tra dữ liệu trả về
      setDataSelectGender(response.data);
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDataProduct = async () => {
    setLoading(true);
    try {
      const response = await fetchDataSelectProducthd();
      console.log("Response from API product:", response); // Log response để kiểm tra dữ liệu trả về
      setDataSelectProduct(response.data);
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };
  const fetchDataMaterial = async () => {
    setLoading(true);
    try {
      const response = await fetchDataSelectMaterialhd();
      console.log("Response from API material:", response); // Log response để kiểm tra dữ liệu trả về
      setDataSelectMaterial(response.data);
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDataSize = async () => {
    setLoading(true);
    try {
      const response = await fetchDataSelectSizehd();
      console.log("Response from API size:", response); // Log response để kiểm tra dữ liệu trả về
      setDataSelectSize(response.data);
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDataSole = async () => {
    setLoading(true);
    try {
      const response = await fetchDataSelectSolehd();
      console.log("Response from API Sole:", response); // Log response để kiểm tra dữ liệu trả về
      setDataSelectSole(response.data);
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDataType = async () => {
    setLoading(true);
    try {
      const response = await fetchDataSelectTypehd();
      console.log("Response from API type:", response); // Log response để kiểm tra dữ liệu trả về
      setDataSelectType(response.data);
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProductDetail = async (tableData) => {
    try {
      setLoading(true);
      await createProductDetailList(tableData);
      // setFilterActice(false);
      // fetchProductsData(); // Refresh data after creation
      notification.success({
        message: "Success",
        duration: 4,
        pauseOnHover: false,
        showProgress: true,
        description: `Thêm sản phẩm  thành công!`,
      });
    } catch (error) {
      console.error("Failed to update san pham", error);
      notification.error({
        message: "Error",
        duration: 4,
        pauseOnHover: false,
        showProgress: true,
        description: "Failed to update san pham",
      });
      deleteImages(cleanUpImageRef.current); // Gọi hàm xóa ảnh khoit
    } finally {
      setLoading(false);
    }
  };
  const resetFrom = () => {
    generateTableData(color, size, product);
    setTableData([]);
    setRequest((prev) => ({
      // ...prev,
      productId: dataSelectProduct[0]?.id || null,
      brandId: dataSelectBrand[0]?.id || null,
      genderId: dataSelectGender[0]?.id || null,
      materialId: dataSelectMaterial[0]?.id || null,
      typeId: dataSelectType[0]?.id || null,
      soleId: dataSelectSole[0]?.id || null,
    }));

    console.log("đã reset from");
    console.log(request);
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
    console.log("đây là row đã chọn" + selectedRowKeys);
    console.log("đây là row đã chọn" + selectedRowKeys);
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
        <InputNumber
          min={1}
          max={999999} // Giới hạn tối đa 6 chữ số
          value={record.quantity}
          onChange={(value) => handleInputChange(record.key, "quantity", value)}
          addonAfter="Đôi"
        />
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      render: (text, record) => (
        <InputNumber
          min={1}
          max={9999999} // Giới hạn tối đa 7 chữ số
          step={10000} // Nhập bước nhảy 1,000 VNĐ
          value={record.price}
          onChange={(value) => handleInputChange(record.key, "price", value)}
          addonAfter="VNĐ"
        />
      ),
    },
    {
      title: "Cân nặng",
      dataIndex: "weight",
      render: (text, record) => (
        <InputNumber
          min={1}
          max={9999} // Giới hạn tối đa 2 chữ số
          value={record.weight}
          onChange={(value) => handleInputChange(record.key, "weight", value)}
          addonAfter="gram"
        />
      ),
    },
    {
      title: "Action",
      dataIndex: "status",
      render: (text, record) => (
        <Button
          type="primary"
          style={{}}
          onClick={() => handleDelete(record.key)}
        >
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
        // Kiểm tra nếu là item đầu tiên có màu color
        const isFirst =
          record.key ===
          tableData.find((item) => item.color === record.color)?.key;

        // Đảm bảo record.image luôn là mảng và chứa các URL hợp lệ
        const imageList = Array.isArray(record.image) ? record.image : [];

        return isFirst ? (
          <Form.Item label="" valuePropName="fileList">
            <Upload
              customRequest={({ file, onSuccess, onError }) => {
                cloudinaryUpload(file)
                  .then(({ url, public_id }) => {
                    onSuccess({ url, public_id }); // Trả cả public_id về
                  })
                  .catch(onError);
              }}
              listType="picture-card"
              // fileList={imageList.map(img => ({
              //   url: img,          // Đảm bảo sử dụng đúng URL ảnh từ Cloudinary
              //   uid: img,          // UID cho từng ảnh
              //   status: 'done',    // Đánh dấu ảnh đã tải lên thành công
              // }))}
              onChange={(info) => onChange(record.color, info)} // Gọi hàm onChange khi ảnh thay đổi
              onRemove={(file) => handleRemove(file, record.color)} // Xử lý khi ảnh bị xóa
              onPreview={onPreview} // Hàm xem trước ảnh khi nhấp
              multiple={true}
              // beforeUpload={(file) => {
              //   const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";

              //   console.log("File type:", file.type); // Debug kiểm tra loại file

              //   if (!isJpgOrPng) {
              //     message.error("Chỉ được chọn file JPG hoặc PNG!");
              //     return Upload.LIST_IGNORE; // Ngăn không cho upload file không hợp lệ
              //   }
              //   return true; // Cho phép tải lên nếu đúng định dạng
              // }}
              accept="image/jpeg, image/png" // Chỉ cho phép chọn JPG hoặc PNG
            >
              {/* Hiển thị nút upload nếu số lượng ảnh ít hơn 6 */}
              {imageList.length < 6 && (
                <button
                  style={{
                    border: 0,
                    background: "none",
                    width: "80px",
                    height: "80px",
                  }}
                  type="button"
                >
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </button>
              )}
            </Upload>
          </Form.Item>
        ) : null;
      },
      onCell: (record) => {
        const sameColorItems = tableData.filter(
          (item) => item.color === record.color
        );
        return { rowSpan: sameColorItems.length }; // Tính rowSpan để hiển thị đúng các hàng cùng màu
      },
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
          quantity: 1,
          price: 1,
          weight: 500,
          image: [],
          status: 1,
          color: color, // Thêm trường color để nhóm các dòng cùng màu
          // mỗi biến thể khi render ra đều có các thuộc tính
          brandId: dataSelectBrand[0]?.id || null,
          genderId: dataSelectGender[0]?.id || null,
          materialId: dataSelectMaterial[0]?.id || null,
          typeId: dataSelectType[0]?.id || null,
          soleId: dataSelectSole[0]?.id || null,
          description: null,
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
    console.log(request);
    setRequest((prev) => ({
      ...prev,
      productId: selectedProduct,
    }));
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
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card
          style={{
            marginBottom: "1rem",
          }}
        >
          <Row gutter={[16, 0]}>
            <Col>
              <h5>Thông tin cơ bản</h5>
            </Col>
            <Col span={24}>
              <div>Tên sản phẩm</div>

              <Row gutter={[5, 0]}>
                <Col>
                  <Select
                    showSearch
                    style={{ width: "15rem" }}
                    placeholder="Chọn sản phẩm"
                    optionFilterProp="label"
                    value={request.productId}
                    onSearch={(value) => setSearchProduct(value)} // Lưu giá trị tìm kiếm
                    notFoundContent={
                      <a
                        onClick={() =>
                          handleCreateProduct({ productName: searchProduct })
                        }
                        style={{ padding: 0, color: "black" }}
                      >
                        Thêm nhanh: {searchProduct}
                      </a>
                    }
                    onChange={handleProductChange}
                    options={dataSelectProduct?.map((p) => ({
                      value: p.id,
                      label: p.productName,
                    }))}
                  />
                </Col>
                <Col>
                  <Button
                    style={{ padding: 0, backgroundColor: `${COLORS.primary}` }}
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
                placeholder="Mô tả tối đa 200 từ"
                onChange={(value) => {
                  setRequest((prev) => ({
                    ...prev,
                    description: value,
                  }));

                  handleTableDataChange("description", value);
                }}
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
          <Row>
            <Col span={24}>
              <h6>Thuộc tính</h6>
            </Col>

            <Col span={8}>
              <div>Thương hiệu</div>
              <Row gutter={[5, 0]}>
                <Col>
                  <Select
                    showSearch
                    style={{ width: "15rem" }}
                    placeholder="Chọn thương hiệu"
                    optionFilterProp="label"
                    value={request.brandId}
                    onSearch={(value) => setSearchBrand(value)} // Lưu giá trị tìm kiếm
                    notFoundContent={
                      <a
                        onClick={() =>
                          handleCreateBrand({ brandName: searchBrand })
                        }
                        style={{ padding: 0, color: "black" }}
                      >
                        Thêm nhanh: {searchBrand}
                      </a>
                    }
                    onChange={(value) => {
                      setRequest((prev) => ({
                        ...prev,
                        brandId: value,
                      }));

                      handleTableDataChange("brandId", value);
                    }}
                    options={dataSelectBrand?.map((b) => ({
                      value: b.id,
                      label: b.brandName,
                    }))}
                  />
                </Col>
                <Col>
                  <Button
                    style={{ padding: 0, backgroundColor: `${COLORS.primary}` }}
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
                    optionFilterProp="label"
                    value={request.genderId}
                    onSearch={(value) => setSearchGender(value)} // Lưu giá trị tìm kiếm
                    notFoundContent={
                      <a
                        onClick={() =>
                          handleCreateGenDer({ genderName: searchGender })
                        }
                        style={{ padding: 0, color: "black" }}
                      >
                        Thêm nhanh: {searchGender}
                      </a>
                    }
                    onChange={(value) => {
                      setRequest((prev) => ({
                        ...prev,
                        genderId: value,
                      }));

                      handleTableDataChange("genderId", value);
                    }}
                    options={dataSelectGender?.map((g) => ({
                      value: g.id,
                      label: g.genderName,
                    }))}
                  />
                </Col>
                {/* <Col>
                  <Button
                    style={{ padding: 0, backgroundColor: `${COLORS.primary}` }}
                    onClick={() => setAddGenderModalVisible(true)}
                  >
                    <MdAdd size={25} color="white" />
                  </Button>
                </Col> */}
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
                    optionFilterProp="label"
                    value={request.materialId}
                    onSearch={(value) => setSearchMaterial(value)} // Lưu giá trị tìm kiếm
                    notFoundContent={
                      <a
                        onClick={() =>
                          handleCreateMaterial({
                            materialName: searchMaterial,
                          })
                        }
                        style={{ padding: 0, color: "black" }}
                      >
                        Thêm nhanh: {searchMaterial}
                      </a>
                    }
                    onChange={(value) => {
                      setRequest((prev) => ({
                        ...prev,
                        materialId: value,
                      }));

                      handleTableDataChange("materialId", value);
                    }}
                    options={dataSelectMaterial?.map((m) => ({
                      value: m.id,
                      label: m.materialName,
                    }))}
                  />
                </Col>
                <Col>
                  <Button
                    style={{ padding: 0, backgroundColor: `${COLORS.primary}` }}
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
                    optionFilterProp="label"
                    value={request.typeId}
                    onSearch={(value) => setSearchType(value)} // Lưu giá trị tìm kiếm
                    notFoundContent={
                      <a
                        onClick={() =>
                          handleCreateType({ typeName: searchType })
                        }
                        style={{ padding: 0, color: "black" }}
                      >
                        Thêm nhanh: {searchType}
                      </a>
                    }
                    onChange={(value) => {
                      setRequest((prev) => ({
                        ...prev,
                        typeId: value,
                      }));

                      handleTableDataChange("typeId", value);
                    }}
                    options={dataSelectType?.map((t) => ({
                      value: t.id,
                      label: t.typeName,
                    }))}
                  />
                </Col>
                <Col>
                  <Button
                    style={{ padding: 0, backgroundColor: `${COLORS.primary}` }}
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
                    optionFilterProp="label"
                    value={request.soleId}
                    onSearch={(value) => setSearchSole(value)} // Lưu giá trị tìm kiếm
                    notFoundContent={
                      <a
                        onClick={() =>
                          handleCreateSole({ soleName: searchSole })
                        }
                        style={{ padding: 0, color: "black" }}
                      >
                        Thêm nhanh: {searchSole}
                      </a>
                    }
                    onChange={(value) => {
                      setRequest((prev) => ({
                        ...prev,
                        soleId: value,
                      }));

                      handleTableDataChange("soleId", value);
                    }}
                    options={dataSelectSole?.map((s) => ({
                      value: s.id,
                      label: s.soleName,
                    }))}
                  />
                </Col>
                <Col>
                  <Button
                    style={{ padding: 0, backgroundColor: `${COLORS.primary}` }}
                    onClick={() => setAddSoleModalVisible(true)}
                  >
                    <MdAdd size={25} color="white" />
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row gutter={[0, 15]} style={{ marginTop: "16px" }}>
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
                    onSearch={(value) => setSearchColor(value)} // Lưu giá trị tìm kiếm
                    notFoundContent={
                      <a
                        onClick={() =>
                          handleCreateColor({ colorName: searchColor })
                        }
                        style={{ padding: 0, color: "black" }}
                      >
                        Thêm nhanh: {searchColor}
                      </a>
                    }
                    optionFilterProp="title" // Sử dụng 'title' để tìm kiếm
                    onChange={handleColorChange}
                    options={dataSelectColor?.map((c) => ({
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
                      title: c.colorName, // Dùng 'title' để lọc khi search
                    }))}
                  />
                </Col>
                <Col>
                  <Button
                    style={{ padding: 0, backgroundColor: `${COLORS.primary}` }}
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
                    optionFilterProp="label"
                    value={request.sizeId}
                    onSearch={(value) => setSearchSize(value)} // Lưu giá trị tìm kiếm
                    notFoundContent={
                      <a
                        onClick={() =>
                          handleCreateSize({ sizeName: searchSize })
                        }
                        style={{ padding: 0, color: "black" }}
                      >
                        Thêm nhanh: {searchSize}
                      </a>
                    }
                    onChange={handleSizeChange}
                    options={dataSelectSize?.map((s) => ({
                      value: s.id,
                      label: s.sizeName,
                    }))}
                  />
                </Col>
                <Col>
                  <Button
                    style={{ padding: 0, backgroundColor: `${COLORS.primary}` }}
                    onClick={() => setAddSizeModalVisible(true)}
                  >
                    <MdAdd size={25} color="white" />
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
      </Col>
      <Col span={24}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Row gutter={[16, 16]}>
              <Col>
                {tableData.length > 0 && (
                  <Row gutter={[16, 16]}>
                    <Col>
                      <Button
                        onClick={() => {
                          handleCreateProductDetail(tableData);
                          resetFrom();
                          setCleanUpImage([]);
                          navigate(-1);
                        }}
                        type="primary"
                        style={{}}
                      >
                        Lưu thông tin
                      </Button>
                    </Col>
                    <Col>
                      <Button
                        type="primary"
                        onClick={() => setIsModalVisible(true)}
                        // disabled={!hasSelected}
                        loading={loading}
                        style={{}}
                      >
                        Chỉnh số lượng và giá chung
                      </Button>
                    </Col>
                  </Row>
                )}
              </Col>
              {groupedData.map((group) => (
                <Col span={24} key={group.colorName}>
                  <Card title={`Sản phẩm chi tiết: ${group.colorName}`}>
                    <Table
                      // rowSelection={rowSelection}
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

      <ModalAddProduct
        open={openCreateProduct}
        onCreate={handleCreateProduct}
        onCancel={() => setOpenCreateProduct(false)}
      />
      <Modal
        title="Set số lượng và giá chung"
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={[
          <Button key="back" onClick={handleModalCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleModalOk}
            style={{}}
          >
            Xác nhận
          </Button>,
        ]}
      >
        <Form
          form={formModalSLVaGia} // Gán form instance vào form
          layout="vertical"
        >
          <Form.Item
            label="Số lượng chung"
            name="commonQuantity"
            rules={[
              {
                required: true,
                message: "Số lượng chung không được để trống!",
              },
              {
                type: "number",
                min: 0,
                message: "Số lượng phải là số dương!",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              type="number"
              min={1}
              maxLength={6}
              value={commonQuantity}
              onChange={(value) => setCommonQuantity(value)}
              suffix={<span>Đôi</span>}
            />
          </Form.Item>
          <Form.Item
            label="Giá chung"
            name="commonPrice"
            rules={[
              { required: true, message: "Giá chung không được để trống!" },
              {
                type: "number",
                min: 0,
                max: 500000000, // Giới hạn giá trị tối đa là 500 triệu
                message: "Giá phải là số dương và nhỏ hơn 500 triệu!",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              type="number"
              min={1}
              maxLength={7}
              value={commonPrice}
              onChange={(value) => setCommonPrice(value)}
              suffix={<span>VNĐ</span>}
            />
          </Form.Item>

          <Form.Item
            label="Cân nặng chung"
            name="commonWeight"
            rules={[
              {
                required: true,
                message: "Cân nặng chung không được để trống!",
              },
              {
                type: "number",
                min: 0,
                max: 10, // Giới hạn giá trị tối đa là 500 triệu
                message: "Cân nặng phải là số dương và nhỏ hơn 10kg !",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              type="number"
              min={1}
              maxLength={2}
              value={commonWeight}
              onChange={(value) => setCommonWeight(value)}
              suffix={<span>Kg</span>}
            />
          </Form.Item>
        </Form>
      </Modal>
      <ModalAddNew
        open={addTypeModalVisible}
        onCancel={() => setAddTypeModalVisible(false)}
        title={"Loại giày"}
        req={"typeName"}
        onCreate={handleCreateType}
      />
      <ModalAddNew
        open={addBrandModalVisible}
        onCancel={() => setAddBrandModalVisible(false)}
        title={"Thương hiệu"}
        req={"brandName"}
        onCreate={handleCreateBrand}
      />
      <ModalAddNew
        open={addGenderModalVisible}
        onCancel={() => setAddGenderModalVisible(false)}
        title={"Giới tính"}
        req={"genderName"}
        onCreate={handleCreateGenDer}
      />
      <ModalAddNew
        open={addMaterialModalVisible}
        onCancel={() => setAddMaterialModalVisible(false)}
        title={"Chất liệu"}
        req={"materialName"}
        onCreate={handleCreateMaterial}
      />
      <ModalAddNew
        open={addSoleModalVisible}
        onCancel={() => setAddSoleModalVisible(false)}
        title={"Đế giày"}
        req={"soleName"}
        onCreate={handleCreateSole}
      />
      <ModalAddNew
        open={addColorModalVisible}
        onCancel={() => setAddColorModalVisible(false)}
        title={"Màu sắc"}
        req={"colorName"}
        onCreate={handleCreateColor}
      />
      <ModalAddNewSize
        open={addSizeModalVisible}
        onCancel={() => setAddSizeModalVisible(false)}
        title={"Kích cỡ"}
        req={"sizeName"}
        onCreate={handleCreateSize}
      />
    </Row>
  );
};

export default ProductDetailDrawer;
