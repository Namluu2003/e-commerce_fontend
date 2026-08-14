import { baseUrl } from "../../helpers/Helpers.js";
import {
    Modal, Table, Input, Button, Row, Col, Typography, Card, Checkbox, message, InputNumber, Form, DatePicker, Select, Collapse, Space, Tooltip, Spin
} from "antd";
import { SearchOutlined, FilterOutlined, ClearOutlined, DownOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import _ from "lodash"; // Import lodash để debounce API call
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "react-toastify";

const { Option } = Select;
const { Title } = Typography;
const { Panel } = Collapse;

const AddPromotion = () => {
    const [form] = Form.useForm();
    const [filterForm] = Form.useForm();
    const [loading, setLoading] = useState(false); // Trạng thái loading
    const [filterLoading, setFilterLoading] = useState(false); // Thêm state filterLoading
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
    //lưu sp detail
    const [originalProductDetails, setOriginalProductDetails] = useState([]);
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

    // Thêm state để lưu trữ danh sách ban đầu
    const [originalList, setOriginalList] = useState([]);

    // Cập nhật useEffect để lưu danh sách ban đầu
    useEffect(() => {
        if (Array.isArray(productDetails) && productDetails.length > 0 && originalList.length === 0) {
            setOriginalList([...productDetails]);
        }
    }, [productDetails]);

    // Generate filter options
    const generateFilterOptions = useCallback((details) => {
        if (!details || !Array.isArray(details)) {
            return {
                brands: [],
                types: [],
                colors: [],
                materials: [],
                sizes: [],
                soles: [],
                genders: [],
                weights: [],
            };
        }
        
        const options = {
            brands: [],
            types: [],
            colors: [],
            materials: [],
            sizes: [],
            soles: [],
            genders: [],
            weights: [],
        };

        details.forEach(item => {
            if (item?.brandName) options.brands.push(item.brandName);
            if (item?.typeName) options.types.push(item.typeName);
            if (item?.colorName) options.colors.push(item.colorName);
            if (item?.materialName) options.materials.push(item.materialName);
            if (item?.sizeName) options.sizes.push(item.sizeName);
            if (item?.soleName) options.soles.push(item.soleName);
            if (item?.genderName) options.genders.push(item.genderName);
            if (item?.weight) options.weights.push(item.weight);
        });

        // Remove duplicates and sort
        Object.keys(options).forEach(key => {
            options[key] = [...new Set(options[key])].sort();
        });

        return options;
    }, []);

    useEffect(() => {
        if (Array.isArray(productDetails)) {
            const options = generateFilterOptions(productDetails);
            setFilterOptions(options);
        }
    }, [productDetails, generateFilterOptions]);

    // Cập nhật useEffect để lưu danh sách ban đầu
    useEffect(() => {
        if (Array.isArray(productDetails) && productDetails.length > 0 && originalProductDetails.length === 0) {
            setOriginalProductDetails([...productDetails]);
        }
    }, [productDetails]);

    // Sửa lại handleFilterSearch để lọc từ danh sách gốc
    const handleFilterSearch = useCallback(() => {
        try {
            setFilterLoading(true);
            const values = filterForm.getFieldsValue();
            let filteredResults = Array.isArray(originalProductDetails) ? [...originalProductDetails] : [];

            const filters = [
                { 
                    key: 'productName', 
                    value: values?.productName, 
                    filter: (item, val) => {
                        if (!item?.productName || !val) return true;
                        return item.productName.toLowerCase().includes(val.toLowerCase());
                    }
                },
                { key: 'brandName', value: values?.brandName },
                { key: 'typeName', value: values?.typeName },
                { key: 'colorName', value: values?.colorName },
                { key: 'materialName', value: values?.materialName },
                { key: 'sizeName', value: values?.sizeName },
                { key: 'soleName', value: values?.soleName },
                { key: 'genderName', value: values?.genderName },
                { key: 'weight', value: values?.weight },
            ];

            filteredResults = filters.reduce((results, { key, value, filter }) => {
                if (!value) return results;
                return results.filter(item => {
                    if (filter) return filter(item, value);
                    return item?.[key] === value;
                });
            }, filteredResults);

            setProductDetails(filteredResults);
            toast.success(`Tìm thấy ${filteredResults.length} sản phẩm phù hợp`);
        } catch (error) {
            console.error("Lỗi khi lọc sản phẩm:", error);
            toast.error("Đã xảy ra lỗi khi tìm kiếm sản phẩm!");
            setProductDetails([]);
        } finally {
            setFilterLoading(false);
        }
    }, [filterForm, originalProductDetails]);

    const debouncedFilterSearch = useCallback(
        _.debounce((value) => {
            if (!value) {
                handleFilterSearch();
            } else {
                filterForm.setFieldsValue({ productName: value });
                handleFilterSearch();
            }
        }, 500),
        [filterForm, handleFilterSearch]
    );

    // Sửa lại handleClearFilter để gọi API lấy lại danh sách gốc
    const handleClearFilter = useCallback(async () => {
        try {
            setFilterLoading(true);
            filterForm.resetFields();
            
            if (selectedProducts.length > 0) {
                const allDetails = [];
                for (const product of selectedProducts) {
                    const response = await axios.get(`${baseUrl}/api/admin/productdetail/product/${product.id}`);
                    if (response.data?.data) {
                        allDetails.push(...response.data.data);
                    }
                }
                setProductDetails(allDetails);
                setOriginalProductDetails(allDetails);
                toast.success('Đã xóa bộ lọc và khôi phục danh sách gốc');
            } else {
                setProductDetails([]);
                setOriginalProductDetails([]);
                toast.warning('Không có sản phẩm nào được chọn');
            }
        } catch (error) {
            console.error("Lỗi khi xóa bộ lọc:", error);
            toast.error("Đã xảy ra lỗi khi xóa bộ lọc!");
        } finally {
            setFilterLoading(false);
        }
    }, [filterForm, selectedProducts]);

    const filterOption = useCallback((input, option) => {
        if (!option?.children || !input) return false;
        return option.children.toLowerCase().includes(input.toLowerCase());
    }, []);

    const renderSelect = useCallback((name, label, options) => {
        const safeOptions = Array.isArray(options) ? options : [];
        return (
            <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item 
                    name={name} 
                    label={
                        <Space>
                            {label}
                            <Tooltip title={`Lọc theo ${label.toLowerCase()}`}>
                                <InfoCircleOutlined style={{ color: '#1890ff' }} />
                            </Tooltip>
                        </Space>
                    }
                    rules={[
                        {
                            validator: (_, value) => {
                                if (value && value.length > 50) {
                                    return Promise.reject(`${label} không được vượt quá 50 ký tự`);
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}
                >
                    <Select
                        placeholder={`Chọn ${label.toLowerCase()}`}
                        allowClear
                        showSearch
                        filterOption={filterOption}
                        onChange={(value) => !value && handleFilterSearch()}
                        loading={filterLoading}
                        optionFilterProp="children"
                        notFoundContent={filterLoading ? <Spin size="small" /> : "Không tìm thấy"}
                    >
                        {safeOptions.map(item => (
                            <Option key={item} value={item}>
                                {item}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            </Col>
        );
    }, [filterOption, handleFilterSearch, filterLoading]);

    //xử lí nút add
    const handleAddPromotion = async () => {
        try {
            await form.validateFields();
            const values = form.getFieldsValue();
            console.log("Form values:", values);
            console.log("Selected products:", selectedProducts);
            console.log("Selected product details:", selectedProductDetails);
            // 🛑 Kiểm tra nếu chưa chọn sản phẩm nào
            if (selectedProducts.length === 0) {
                toast.error("Vui lòng chọn ít nhất một sản phẩm!");
                return;
            }
            if (selectedProductDetails.length === 0) {
                toast.error("Vui lòng chọn ít nhất một sản phẩm chi tiết!");
                return;
            }
            const requestData = {
                ...values,
                discountType: "PERCENT",
                startDate: values.startDate ? dayjs(values.startDate).format("YYYY-MM-DDTHH:mm:ss[Z]") : null,
                endDate: values.endDate ? dayjs(values.endDate).format("YYYY-MM-DDTHH:mm:ss[Z]") : null,

                productIds: selectedProducts.map(item => item.id), // ✅ Đúng với BE
                productDetailIds: selectedProductDetails.map(item => item.id), // ✅ Đúng với BE
            };


            // ✅ In ra console để kiểm tra dữ liệu trước khi gửi
            console.log("Dữ liệu gửi lên backend:", requestData);

            const response = await axios.post(`${baseUrl}/api/admin/promotion/add`, requestData);

            // ✅ In ra phản hồi từ backend để kiểm tra
            console.log("Phản hồi từ backend:", response.data.data);

            toast.success("Thêm chương trình khuyến mãi thành công!");

            form.resetFields();
            setSelectedProducts([]);
            setSelectedProductDetails([]);

            // ✅ Chuyển hướng về trang danh sách khuyến mãi
            navigate("/admin/PromotionList");


        } catch (error) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi thêm chương trình khuyến mãi!");
            console.error("Lỗi:", error.response?.data || error.message);
        }
    };

    const handleConfirmAddPromotion = () => {
        Modal.confirm({
            title: "Xác nhận thêm chương trình khuyến mãi",
            content: "Bạn có chắc chắn muốn thêm chương trình khuyến mãi này không?",
            onOk: handleAddPromotion, // Nếu OK, thì gọi hàm xử lý add
            okText: "Xác nhận",

             okButtonProps: {
                            style: {
                                backgroundColor: '#ff974d', // Nền cam
                                borderColor: '#ff974d', // Viền cam
                                color: '#fff', // Chữ trắng để dễ nhìn
                            },
                        },
            onCancel() {
                toast.info("Hủy thêm chương trình khuyến mãi.");
            },
        });
    };

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
            toast.error("Có lỗi xảy ra khi tải dữ liệu.");
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
            toast.error("Có lỗi xảy ra khi tìm kiếm.");
        } finally {
            setLoading(false);
        }
    };
    //tìm kiếm sản phẩm chi tiết
    const handleFilterResults = (filteredProducts) => {
        const selectedIds = selectedProductDetails.map((item) => item.id);
        setProductDetails(filteredProducts);
      

      };
    


    //tìm kiếm sản phẩm chi tiết
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
                const response = await axios.get(`${baseUrl}/api/admin/productdetail/product/${record.id}`);
        
                if (response.data?.data) {
                    const newDetails = response.data.data.filter(
                        (detail) => !productDetails.some((item) => item.id === detail.id)
                    );
        
                    const updatedDetails = [...productDetails, ...newDetails];
                    setProductDetails(updatedDetails);
                    setSelectedProducts((prevSelected) => [...prevSelected, record]);
                    // Lưu danh sách gốc khi thêm sản phẩm mới
                    setOriginalProductDetails(updatedDetails);
                }
            } catch (error) {
                toast.error("Lỗi khi tải chi tiết sản phẩm.");
            }
        } else {
            // Remove the product from selected products
            const updatedSelectedProducts = selectedProducts.filter((p) => p.id !== record.id);
            setSelectedProducts(updatedSelectedProducts);
            
            // Nếu vẫn còn sản phẩm được chọn, gọi API lấy lại danh sách biến thể
            if (updatedSelectedProducts.length > 0) {
                try {
                    const allDetails = [];
                    for (const product of updatedSelectedProducts) {
                        const response = await axios.get(`${baseUrl}/api/admin/productdetail/product/${product.id}`);
                        if (response.data?.data) {
                            allDetails.push(...response.data.data);
                        }
                    }
                    setProductDetails(allDetails);
                    setOriginalProductDetails(allDetails);
                } catch (error) {
                    toast.error("Lỗi khi tải chi tiết sản phẩm.");
                }
            } else {
                // Nếu không còn sản phẩm nào được chọn, xóa toàn bộ dữ liệu
                setProductDetails([]);
                setOriginalProductDetails([]);
            }
            
            // Xóa các biến thể đã chọn của sản phẩm vừa bỏ chọn
            setSelectedProductDetails((prevSelected) =>
                prevSelected.filter((detail) => detail.productId !== record.id)
            );
        }
    };
    useEffect(() => {
        fetchProductsData();
    }, []);

    const columns = [
        {
            title: (
                <Checkbox
                    checked={selectedProducts.length === products.length && products.length > 0}
                    indeterminate={selectedProducts.length > 0 && selectedProducts.length < products.length}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedProducts(products);
                            setProductDetails([]); // Reset chi tiết sản phẩm
                            products.forEach(async (record) => {
                                try {
                                    const response = await axios.get(`${baseUrl}/api/admin/productdetail/product/${record.id}`);
                                    if (response.data?.data) {
                                        setProductDetails(prev => [...prev, ...response.data.data]);
                                    }
                                } catch (error) {
                                    toast.error("Lỗi khi tải chi tiết sản phẩm.");
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
                    <Form form={form} layout="vertical">
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

                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const num = Number(value);
                                        if (!value) return Promise.reject(new Error("Không được bỏ trống"));
                                        if (!Number.isInteger(num) || num < 1 || num > 100) {
                                            return Promise.reject(new Error("Giá trị giảm (%) phải từ 1 đến 100"));
                                        }
                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                        >
                            <InputNumber
                                placeholder="Nhập giá trị giảm"
                                style={{ width: "100%" }}
                                min={1}
                                max={100}
                                formatter={(value) => `${value}%`}
                                parser={(value) => value.replace(/\D/g, "")}
                                addonAfter="%"
                            />
                        </Form.Item>

                        <Form.Item name="discountType" initialValue="PERCENT" hidden>
                            <Input />
                        </Form.Item>


                        <Form.Item
                            name="startDate"
                            label="Ngày bắt đầu"
                            rules={[
                                { required: true, message: 'Vui lòng chọn ngày bắt đầu' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || !getFieldValue('endDate') || value.isBefore(getFieldValue('endDate'))) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Ngày bắt đầu phải trước ngày kết thúc'));
                                    },
                                }),
                            ]}
                        >
                            <DatePicker
                                showTime={{ format: 'HH:mm:ss' }}
                                format="DD/MM/YYYY HH:mm:ss"
                                style={{ width: '100%' }}
                                getValueProps={(value) => ({ value: value ? dayjs(value).utcOffset(7) : null })}
                            />
                        </Form.Item>

                        <Form.Item
                            name="endDate"
                            label="Ngày kết thúc"
                            rules={[
                                { required: true, message: 'Không được bỏ trống' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || !getFieldValue('startDate') || value.isAfter(getFieldValue('startDate'))) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Ngày kết thúc phải lớn hơn ngày bắt đầu!'));
                                    },
                                }),
                            ]}
                        >
                            <DatePicker
                                showTime={{ format: 'HH:mm:ss' }}
                                format="DD/MM/YYYY HH:mm:ss"
                                style={{ width: '100%' }}
                                getValueProps={(value) => ({ value: value ? dayjs(value).utcOffset(7) : null })}
                            />
                        </Form.Item>

                        <Button
                            type="primary"
                            size="middle "
                            style={{ width: "60%", margin: "0 auto", display: "block" }}
                            onClick={handleConfirmAddPromotion} // ✅ Gọi Modal xác nhận trước khi thêm
                        >
                            Thêm mới
                        </Button>

                    </Form>
                </Card>
            </Col>

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
            <Card style={{ marginTop: "30px", width: "100%" }}>
                <Title level={2}>Sản Phẩm Chi Tiết</Title>
                
                {/* Bộ lọc sản phẩm chi tiết */}
                <Card style={{ marginBottom: '10px' }}>
                    <Title level={4}><FilterOutlined /> Bộ lọc sản phẩm chi tiết</Title>
                    <Form form={filterForm} layout="vertical">
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={8} lg={6}>
                                <Form.Item 
                                    name="productName" 
                                    label={
                                        <Space>
                                            Tên Sản Phẩm
                                            <Tooltip title="Tìm kiếm theo tên sản phẩm">
                                                <InfoCircleOutlined style={{ color: '#1890ff' }} />
                                            </Tooltip>
                                        </Space>
                                    }
                                    rules={[
                                        {
                                            validator: (_, value) => {
                                                if (value && value.length > 100) {
                                                    return Promise.reject('Tên sản phẩm không được vượt quá 100 ký tự');
                                                }
                                                return Promise.resolve();
                                            },
                                        },
                                    ]}
                                >
                                    <Input 
                                        placeholder="Nhập tên sản phẩm" 
                                        allowClear 
                                        onChange={(e) => debouncedFilterSearch(e.target.value)}
                                        suffix={filterLoading ? <Spin size="small" /> : null}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                <Collapse  style={{background:"white",border:"none"}} defaultActiveKey={[]} expandIcon={({ isActive })  =>
                                    
                                    <DownOutlined rotate={isActive ? 180 : 0} />}>
                                    <Panel header="Bộ lọc nâng cao" key="1">
                                        <Row gutter={[8, 0]}>
                                            {renderSelect('brandName', 'Thương Hiệu', filterOptions?.brands || [])}
                                            {renderSelect('typeName', 'Loại', filterOptions?.types || [])}
                                            {renderSelect('colorName', 'Màu Sắc', filterOptions?.colors || [])}
                                            {renderSelect('materialName', 'Chất Liệu', filterOptions?.materials || [])}
                                            {renderSelect('sizeName', 'Kích Cỡ', filterOptions?.sizes || [])}
                                            {renderSelect('soleName', 'Đế Giày', filterOptions?.soles || [])}
                                            {renderSelect('genderName', 'Giới Tính', filterOptions?.genders || [])}
                                            {renderSelect('weight', 'Trọng lượng', filterOptions?.weights || [])}
                                        </Row>
                                    </Panel>
                                </Collapse>
                            </Col>
                        </Row>
                        <Row justify="flex">
                            <Space>
                                <Button 
                                    icon={<ClearOutlined />} 
                                    onClick={handleClearFilter}
                                    disabled={filterLoading}
                                >
                                    Xóa bộ lọc
                                </Button>
                                <Button 
                                    type="primary" 
                                    icon={<SearchOutlined />} 
                                    onClick={handleFilterSearch} 
                                    loading={filterLoading}
                                >
                                    Tìm kiếm
                                </Button>
                            </Space>
                        </Row>
                    </Form>
                </Card>

                <Table
                    columns={columnsDetail}
                    dataSource={productDetails}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: currentPage1,
                        pageSize: pageSize1,
                        total: productDetails.length,
                        onChange: (page) => setCurrentPage1(page),
                    }}
                />
            </Card>
        </Row>
    );
};

export default AddPromotion;
