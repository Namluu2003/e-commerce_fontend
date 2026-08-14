import {
    Modal, Table, Input, Button, Row, Col, Typography, Card, Checkbox, message, InputNumber, Form, DatePicker, Select
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import _ from "lodash"; // Import lodash để debounce API call
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";


const DetailPromotion = () => {
    const [form] = Form.useForm();
    const { Title } = Typography;
    const [loading, setLoading] = useState(false); // Trạng thái loading
    const [products, setProducts] = useState([]); // Danh sách sản phẩm
    const [selectedProducts, setSelectedProducts] = useState([]); // Danh sách sản phẩm đã chọn
    const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm
    const pageSize = 5; // Số lượng sản phẩm mỗi trang
    const [currentPage, setCurrentPage] = useState(1); // State lưu trang hiện tại
    const pageSize1 = 5; // Số lượng sản phẩm mỗi trang
    const [currentPage1, setCurrentPage1] = useState(1); // State lưu trang hiện tại
    const [productDetails, setProductDetails] = useState([]);
    const [selectedProductDetails, setSelectedProductDetails] = useState([]);
    const navigate = useNavigate();


    const { id } = useParams(); // 🟢 Lấy ID từ URL

    useEffect(() => {
        if (!id) return; // Nếu không có ID thì không gọi API

        const fetchPromotionDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/admin/promotion/detail/${id}`);
                const promoData = response.data.data;

                if (promoData) {
                    form.setFieldsValue({
                        ...promoData,
                        startDate: promoData.startDate ? dayjs(promoData.startDate) : null,
                        endDate: promoData.endDate ? dayjs(promoData.endDate) : null,
                    });

                    const selectedProductIds = promoData.productIds || [];
                    const selectedProductDetailIds = promoData.productDetailIds || [];

                    const productResponse = await axios.get("http://localhost:8080/api/admin/product/hien");
                    const filteredProducts = productResponse.data.data.filter(product => product.totalQuantity > 0);

                    const selectedProductsData = filteredProducts.filter(product => selectedProductIds.includes(product.id));

                    let allProductDetails = [];
                    for (let product of selectedProductsData) {
                        try {
                            const detailResponse = await axios.get(`http://localhost:8080/api/admin/productdetail/product/${product.id}`);
                            allProductDetails = [...allProductDetails, ...detailResponse.data.data];
                        } catch (error) {
                            console.error("Lỗi khi tải chi tiết sản phẩm:", error);
                        }
                    }

                    const selectedProductDetailsData = allProductDetails.filter(detail => selectedProductDetailIds.includes(detail.id));

                    setProducts(filteredProducts);
                    setSelectedProducts(selectedProductsData);
                    setProductDetails(allProductDetails);
                    setSelectedProductDetails(selectedProductDetailsData);
                }
            } catch (error) {
                message.error("Có lỗi xảy ra khi tải dữ liệu chương trình khuyến mãi.");
            }
        };

        fetchPromotionDetails();
    }, [id]); // 🟢 Gọi lại khi ID thay đổi
    //xử lí nút add
    const handleAddPromotion = async () => {
        try {
            await form.validateFields();
            const values = form.getFieldsValue();
            console.log("Form values:", values);
            console.log("Selected products:", selectedProducts);
            console.log("Selected product details:", selectedProductDetails);
            const requestData = {
                ...values,
                discountType: "PERCENT",
                productIds: selectedProducts.map(item => item.id), // ✅ Đúng với BE
                productDetailIds: selectedProductDetails.map(item => item.id), // ✅ Đúng với BE
            };


            // ✅ In ra console để kiểm tra dữ liệu trước khi gửi
            console.log("Dữ liệu gửi lên backend:", requestData);

            const response = await axios.put(`http://localhost:8080/api/admin/promotion/update/${id}`, requestData);

            // ✅ In ra phản hồi từ backend để kiểm tra
            console.log("Phản hồi từ backend:", response.data.data);

            message.success("Thêm chương trình khuyến mãi thành công!");

            form.resetFields();
            setSelectedProducts([]);
            setSelectedProductDetails([]);

            // ✅ Chuyển hướng về trang danh sách khuyến mãi
            navigate("/admin/PromotionList");


        } catch (error) {
            message.error(error.response?.data?.message || "Có lỗi xảy ra khi thêm chương trình khuyến mãi!");
            console.error("Lỗi:", error.response?.data || error.message);
        }
    };

    const handleConfirmAddPromotion = () => {
        Modal.confirm({
            title: "Xác nhận thêm chương trình khuyến mãi",
            content: "Bạn có chắc chắn muốn thêm chương trình khuyến mãi này không?",
            onOk: handleAddPromotion, // Nếu OK, thì gọi hàm xử lý add
            onCancel() {
                message.info("Hủy thêm chương trình khuyến mãi.");
            },
        });
    };

    /**
     * 🟢 Hàm gọi API lấy danh sách sản phẩm khi load trang
     */
    const fetchProductsData = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:8080/api/admin/product/hien");

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
                    `http://localhost:8080/api/admin/product/searchQuantityProduct/${productName}`
                );
            } else {
                response = await axios.get(
                    `http://localhost:8080/api/admin/product/searchNameProduct/${productName}`
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
            setSelectedProductDetails(prev => [...prev, record]);
        } else {
            setSelectedProductDetails(prev => prev.filter(item => item.id !== record.id));
        }
    };
    const handleCheckboxChange = async (e, record) => {
        if (e.target.checked) {
            try {
                const response = await axios.get(`http://localhost:8080/api/admin/productdetail/product/${record.id}`);

                if (response.data?.data) {
                    const newDetails = response.data.data.filter(detail =>
                        !productDetails.some(item => item.id === detail.id)
                    );

                    setProductDetails(prevDetails => [...prevDetails, ...newDetails]);
                    setSelectedProducts(prevSelected => [...prevSelected, record]);
                }
            } catch (error) {
                message.error("Lỗi khi tải chi tiết sản phẩm.");
            }
        } else {
            // ✅ Xóa sản phẩm khỏi danh sách đã chọn
            const updatedSelectedProducts = selectedProducts.filter(p => p.id !== record.id);
            setSelectedProducts(updatedSelectedProducts);

            // ✅ Xóa chi tiết sản phẩm liên quan
            setProductDetails(prevDetails => prevDetails.filter(detail => detail.productId !== record.id));
            setSelectedProductDetails(prevSelected => prevSelected.filter(detail => detail.productId !== record.id));

            // ✅ Nếu không còn sản phẩm nào được chọn, xóa hết danh sách chi tiết
            if (updatedSelectedProducts.length === 0) {
                setProductDetails([]);
                setSelectedProductDetails([]);
            }
        }
    };




    const columns = [
        {
            title: (
                <Checkbox
                    checked={selectedProducts.length === products.length && products.length > 0}
                    indeterminate={selectedProducts.length > 0 && selectedProducts.length < products.length}
                    disabled={true}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedProducts(products);
                            setProductDetails([]); // Reset chi tiết sản phẩm

                            products.forEach(async (record) => {
                                try {
                                    const response = await axios.get(`http://localhost:8080/api/admin/productdetail/product/${record.id}`);
                                    if (response.data?.data) {
                                        setProductDetails(prev => [...prev, ...response.data.data]);
                                    }
                                } catch (error) {
                                    message.error("Lỗi khi tải chi tiết sản phẩm.");
                                }
                            });
                        } else {
                            setSelectedProducts([]);
                            setProductDetails([]);
                            setSelectedProductDetails([]);
                        }
                    }}
                />
            ),
            dataIndex: "select",
            key: "select",
            width: "5rem",
            render: (_, record) => (
                <Checkbox
                    checked={selectedProducts.some(p => p.id === record.id)}
                    onChange={(e) => handleCheckboxChange(e, record)}
                    disabled={true}
                />
            ),
        },
        {
            title: "STT",
            dataIndex: "stt",
            key: "stt",
            width: "5rem",
            render: (_, __, index) => (currentPage - 1) * pageSize + index + 1, // ✅ Tính STT theo trang hiện tại
        },
        {
            title: "Tên Sản Phẩm",
            dataIndex: "productName",
            key: "productName",
            width: "20rem",
        },
        {
            title: "Số lượng",
            dataIndex: "totalQuantity",
            key: "totalQuantity",
            width: "20rem",
        },
    ];
    const columnsDetail = [
        {
            title: (
                <Checkbox
                    checked={selectedProductDetails.length === productDetails.length && productDetails.length > 0}
                    indeterminate={selectedProductDetails.length > 0 && selectedProductDetails.length < productDetails.length}
                    disabled={true}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedProductDetails(productDetails);
                        } else {
                            setSelectedProductDetails([]);
                        }
                    }}
                />
            ),
            dataIndex: "select",
            key: "select",
            width: "5rem",
            render: (_, record) => (
                <Checkbox
                    checked={selectedProductDetails.some(p => p.id === record.id)}
                    disabled={true}
                    onChange={(e) => handleDetailCheckboxChange(e, record)}
                />
            ),
        },
        { title: "STT", dataIndex: "stt", key: "stt", width: "5rem", render: (_, __, index) => (currentPage1 - 1) * pageSize1 + index + 1 },
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
    const [nameLength, setNameLength] = useState(0);

    return (
        <Row gutter={24}>

            <Col span={8}>
                <Card>
                    <Form form={form} layout="vertical" disabled> {/* Chỉnh label lên trên */}
                        <Form.Item
                            name="promotionName"
                            label={`Tên đợt giảm giá (${nameLength}/50)`}
                            style={{ marginBottom: "12px" }}
                            rules={[
                                { required: true, message: "Không được bỏ trống" },
                                { min: 1, max: 50, message: "Tên đợt giảm giá phải từ 1 đến 50 ký tự" }
                            ]}
                        >
                            <Input
                                placeholder="Nhập tên đợt giảm giá"
                                style={{ width: "100%" }}
                                maxLength={50}
                                onChange={(e) => setNameLength(e.target.value.length)}
                            />
                        </Form.Item>



                        <Form.Item
                            name="discountValue"
                            label="Giá trị giảm"
                            style={{ marginBottom: "12px" }}
                            rules={[
                                {
                                    required: true,
                                    message: 'Không được bỏ trống',
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const num = Number(value);

                                        if (!value) return Promise.reject(new Error('Không được bỏ trống'));

                                        if (!Number.isInteger(num) || num < 1 || num > 100) {
                                            return Promise.reject(new Error('Giá trị giảm (%) phải từ 1 đến 100'));
                                        }

                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                        >
                            <InputNumber
                                placeholder="Nhập giá trị giảm"
                                style={{ width: '100%' }}
                                min={1}
                                max={100}
                                formatter={value => `${value}%`}
                                parser={value => value.replace(/\D/g, '')} // Chỉ cho nhập số
                                addonAfter="%"
                            />
                        </Form.Item>

                        {/* Trường hidden để lưu discountType */}
                        <Form.Item name="discountType" initialValue="PERCENT" hidden>
                            <Input />
                        </Form.Item>



                        <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}>
                            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item name="endDate" label="Ngày kết thúc" rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc!' }]}>
                            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                        </Form.Item>


                    </Form>
                </Card>
            </Col>

            <Col span={16}>
                <Card>
                    <Title level={2}>Sản Phẩm</Title>

                    <Row gutter={[16, 16]}>
                        <Col span={20}>
                            <Input disabled
                                placeholder="Nhập vào tên sản phẩm bạn muốn tìm!"
                                prefix={<SearchOutlined />}
                                allowClear
                                onChange={handleSearchChange}
                            />
                        </Col>

                    </Row>

                    <Table disabled
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
            <Card style={{ marginTop: "30px" }}>
                <Title level={2}>Sản Phẩm Chi Tiết</Title>
{/* 
                <Row gutter={[16, 16]}>
                    <Col span={20}>
                        <Input disabled
                            placeholder="Nhập vào tên sản phẩm bạn muốn tìm!"
                            prefix={<SearchOutlined />}
                            allowClear
                            onChange={handleSearchChange}
                        />
                    </Col>

                </Row> */}

                <Table disabled
                    columns={columnsDetail}
                    dataSource={productDetails}  // ✅ Hiển thị danh sách chi tiết thay vì `products`
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: currentPage1,
                        pageSize: pageSize1,
                        total: productDetails.length, // ✅ Sử dụng độ dài của productDetails
                        onChange: (page) => setCurrentPage1(page), // ✅ Cập nhật currentPage1
                    }}

                />

            </Card>
        </Row>
    );
};

export default DetailPromotion;
