import { baseUrl } from "../../helpers/Helpers.js";
import {
    Table, Input, Button, Row, Col, Typography, Card, Checkbox, message
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import _ from "lodash"; // Import lodash để debounce API call

const AddPromotion = () => {
    const { Title } = Typography;

    const [loading, setLoading] = useState(false); // Trạng thái loading
    const [products, setProducts] = useState([]); // Danh sách sản phẩm
    const [selectedProducts, setSelectedProducts] = useState([]); // Danh sách sản phẩm đã chọn
    const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm
    const pageSize = 5; // Số lượng sản phẩm mỗi trang
    const [currentPage, setCurrentPage] = useState(1); // State lưu trang hiện tại
    const [productDetails, setProductDetails] = useState([]);


    /**
     * 🟢 Hàm gọi API lấy danh sách sản phẩm khi load trang
     */
    const fetchProductsData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${baseUrl}/api/admin/product/hien`);

            // Lọc dữ liệu: chỉ lấy sản phẩm có totalQuantity > 0
            const filteredProducts = response.data.data.filter(product => product.totalQuantity > 0);

            setProducts(filteredProducts);
        } catch (error) {
            message.error("Có lỗi xảy ra khi tải dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    /**
     * 🟢 Hàm gọi API tìm kiếm sản phẩm theo từ khóa
     */
    const searchProducts = async (productName) => {
        if (!productName) {
            fetchProductsData(); // Nếu không có từ khóa, lấy danh sách đầy đủ
            return;
        }

        setLoading(true);
        try {
            let response;
            // Kiểm tra nếu productName là số thì gọi API minQuantity, ngược lại gọi API productname
            if (!isNaN(productName)) {
                response = await axios.get(
                    `${baseUrl}/api/admin/product/searchQuantityProduct/${productName}`
                );
            } else {
                response = await axios.get(
                    `${baseUrl}/api/admin/product/searchNameProduct/${productName}`
                );
            }

            // Kiểm tra xem dữ liệu có tồn tại không
            if (response.data?.data) {
                // Lọc lại dữ liệu: chỉ lấy sản phẩm có totalQuantity > 0
                const filteredProducts = response.data.data.filter(product => product.totalQuantity > 0);
                setProducts(filteredProducts);
            } else {
                setProducts([]); // Không có dữ liệu trả về
            }
        } catch (error) {
            console.error("Lỗi khi tìm kiếm sản phẩm:", error);
            message.error("Có lỗi xảy ra khi tìm kiếm.");
        } finally {
            setLoading(false);
        }
    };



    /**
     * 🟢 Xử lý khi người dùng nhập vào ô tìm kiếm
     */
    const handleSearchChange = _.debounce((e) => {
        setSearchTerm(e.target.value);
        searchProducts(e.target.value);
    }, 500);

    /**
     * 🟢 Xử lý chọn sản phẩm bằng checkbox
     */
    const handleDetailCheckboxChange = (e, record) => {
        if (e.target.checked) {
            setSelectedProducts([...selectedProducts, record]); // ✅ Lưu dữ liệu đã chọn
        } else {
            setSelectedProducts(selectedProducts.filter((p) => p.id !== record.id));
        }
    };
    const fetchProductDetails = async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(`${baseUrl}/api/admin/product/detail/${id}`);
            setProductDetails(response.data.data || []);
        } catch (error) {
            message.error("Không thể tải chi tiết sản phẩm.");
        } finally {
            setLoading(false);
        }
    };


    const handleCheckboxChange = async (e, record) => {
        if (e.target.checked) {
            try {
                const response = await axios.get(`${baseUrl}/api/admin/productdetail/product/${record.id}`);

                if (response.data?.data) {
                    setProductDetails(response.data.data); // ✅ Cập nhật danh sách chi tiết
                } else {
                    setProductDetails([]); // ✅ Không có dữ liệu thì hiển thị rỗng
                }
            } catch (error) {
                message.error("Lỗi khi tải chi tiết sản phẩm.");
            }
        } else {
            setProductDetails([]); // ✅ Bỏ chọn thì xóa dữ liệu chi tiết
        }
    };

    useEffect(() => {
        if (selectedProducts.length > 0) {
            fetchProductDetails(selectedProducts[0].id); // ✅ Lấy chi tiết của sản phẩm đầu tiên được chọn
        }
    }, [selectedProducts]);

    const columns = [
        {
            dataIndex: "select", key: "select", width: "5rem",
            render: (_, record) => (
                <Checkbox
                    checked={selectedProducts.some((p) => p.id === record.id)}
                    onChange={(e) => handleCheckboxChange(e, record)}
                />),
        },
        { title: "STT", dataIndex: "stt", key: "stt", width: "5rem", render: (_, __, index) => (currentPage - 1) * pageSize + index + 1, },
        { title: "Tên Sản Phẩm", dataIndex: "productName", key: "productName", width: "20rem", },
        { title: "Số lượng", dataIndex: "totalQuantity", key: "totalQuantity", width: "20rem", },
    ];
    const columnsDetail = [
        {
            dataIndex: "select", key: "select", width: "5rem",
            render: (_, record) => (
                <Checkbox
                    checked={selectedProducts.some((p) => p.id === record.id)}
                    onChange={(e) => handleDetailCheckboxChange(e, record)}
                />),
        },
        { title: "STT", dataIndex: "stt", key: "stt", width: "5rem", render: (_, __, index) => index + 1 },
        { title: "Tên Sản Phẩm", dataIndex: "productName", key: "productName", width: "20rem" },
        { title: "Thương Hiệu", dataIndex: "brandName", key: "brandName", width: "15rem" },
        { title: "Loại", dataIndex: "typeName", key: "typeName", width: "15rem" },
        { title: "Màu Sắc", dataIndex: "colorName", key: "colorName", width: "10rem" },
        { title: "Chất Liệu", dataIndex: "materialName", key: "materialName", width: "15rem" },
        { title: "Kích Cỡ", dataIndex: "sizeName", key: "sizeName", width: "10rem" },
        { title: "Đế Giày", dataIndex: "soleName", key: "soleName", width: "15rem" },
        { title: "Giới Tính", dataIndex: "genderName", key: "genderName", width: "10rem" },
        { title: "Số lượng", dataIndex: "quantity", key: "quantity", width: "10rem" },
        { title: "Trọng Lượng (kg)", dataIndex: "weight", key: "weight", width: "10rem" },
    ];
    return (
        <Row gutter={20}>
            <Col span={16}>
                <Card>
                    <Title level={2}>Sản Phẩm</Title>
                    <Row gutter={[16, 16]}>
                        <Col span={20}>
                            <Input
                                placeholder="Nhập vào tên sản phẩm bạn muốn tìm!"
                                prefix={<SearchOutlined />}
                                allowClear
                                onChange={handleSearchChange}
                            />
                        </Col>
                    </Row>
                    <Table
                        columns={columns}
                        dataSource={products}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            current: currentPage,
                            pageSize: pageSize,
                            total: products.length,
                            onChange: (page) => setCurrentPage(page),
                        }}
                    />
                </Card>
            </Col>
            {/* <Col span={16}>
                <Card>
                    <Title level={2}>Sản Phẩm Chi Tiết</Title>

                    <Row gutter={[16, 16]}>
                        <Col span={20}>
                            <Input
                                placeholder="Nhập vào tên sản phẩm bạn muốn tìm!"
                                prefix={<SearchOutlined />}
                                allowClear
                                onChange={handleSearchChange}
                            />
                        </Col>

                    </Row>

                    <Table
                        columns={columnsDetail}
                        dataSource={productDetails}  // ✅ Hiển thị danh sách chi tiết thay vì `products`
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            current: currentPage,
                            pageSize: pageSize,
                            total: products.length,
                            onChange: (page) => setCurrentPage(page),
                        }}

                    />

                </Card>
            </Col> */}
        </Row>
    );
};

export default AddPromotion;
