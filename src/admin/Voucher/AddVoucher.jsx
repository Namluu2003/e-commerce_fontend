import React, { useState, useEffect } from 'react';
import {
    Table,
    Input,
    DatePicker,
    Select,
    Card,
    Form,
    Spin,
    Alert,
    Col,
    Row,
    Radio,
    Button,
    Flex,
    Modal,
    message,
    InputNumber,
    Slider
} from 'antd';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { color } from 'framer-motion';
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { baseUrl, convertStatusVoucher, ConvertvoucherType, ConvertdiscountType } from '../../helpers/Helpers.js';
import dayjs from 'dayjs';
import { useWatch } from 'antd/es/form/Form';
import {toast} from "react-toastify";
import axiosInstance from "../../utils/axiosInstance.js";
import moment from "moment/moment.js";
import {DownloadOutlined, PlusOutlined, ReloadOutlined, SearchOutlined} from "@ant-design/icons";




const { Option } = Select;


const columnsCustomers = [
    {
        title: 'STT',
        dataIndex: 'stt',
        key: 'stt',
        render: (_, __, index) => index + 1, // ✅ Tính STT theo trang hiện tại
    },
    {
        title: 'Họ và tên',
        dataIndex: 'fullName',
        key: 'fullName',
    },
    // {
    //     title: 'CCCD',
    //     dataIndex: 'citizenId',
    //     key: 'citizenId',
    // },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
    },
    {
        title: 'Số điện thoại',
        dataIndex: 'phoneNumber',
        key: 'phoneNumber',
    },
    {
        title: 'Ngày sinh',
        dataIndex: 'dateBirth',
        key: 'dateBirth',
        render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '',
    }

];

const AddVoucher = () => {
    const [form] = Form.useForm();
    const [value, setValue] = useState("PUBLIC");
    const [customers, setCustomers] = useState([]);
    const [error, setError] = useState(null);
    const [showTable, setShowTable] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const navigate = useNavigate(); // Khởi tạo navigate
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    const [status, setStatus] = useState('null');
    const [dobRange, setDobRange] = useState([]);
    const [ageRange, setAgeRange] = useState([0, 100]);
    const [searchText, setSearchText] = useState('');

    const {RangePicker} = DatePicker;


    const showConfirm = () => {
        Modal.confirm({
            title: "Xác nhận thêm phiếu giảm giá",
            content: "Bạn có chắc chắn muốn thêm phiếu giảm giá này không?",
            okText: "Xác nhận",

            okButtonProps: {
                style: {
                    backgroundColor: '#ff974d', // Nền cam
                    borderColor: '#ff974d', // Viền cam
                    color: '#fff', // Chữ trắng để dễ nhìn
                },
            },
            cancelText: "Hủy",
            centered: true,
            onOk: handleOk, // Gọi hàm handleOk khi nhấn xác nhận

        });
    }
    const start = () => {
        setLoading(true);
        setTimeout(() => {
            setSelectedRowKeys([]);
            setLoading(false);
        }, 1000);
    };

    const onSelectChange = (newSelectedRowKeys) => {
        console.log("selectedRowKeys changed: ", newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
        setSelectedCustomers(newSelectedRowKeys);
    };

    useEffect(() => {
        if (value === "PRIVATE") {
            // Khi chọn "Riêng tư", cập nhật số lượng bằng số lượng khách hàng được chọn
            form.setFieldsValue({ quantity: selectedCustomers.length });
        }

    }, [selectedCustomers, value, form]);
    // Xử lý tự động cập nhật discountMaxValue khi chọn MONEY
    useEffect(() => {
        const discountType = form.getFieldValue("discountType");
        const discountValue = form.getFieldValue("discountValue");

        if (discountType === "MONEY" && discountValue !== undefined) {
            form.setFieldsValue({ discountMaxValue: discountValue });
        }
        form.setFieldsValue({ voucherType: "PUBLIC" });

    }, [form, form.getFieldValue("discountType"), form.getFieldValue("discountValue")]);
    const discountType = useWatch("discountType", form);
    useEffect(() => {
        if (form.getFieldValue("discountType") === "MONEY") {
            form.setFieldsValue({ discountMaxValue: form.getFieldValue("discountValue") });
        } else {
            form.setFieldsValue({ discountMaxValue: null });
        }
    }, [form.getFieldValue("discountType")]);



    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const hasSelected = selectedRowKeys.length > 0;


    // Xử lý khi chọn loại phiếu giảm giá
    const onChange = (e) => {
        const selectedValue = e.target.value;
        setValue(selectedValue);

        if (selectedValue === "PRIVATE") {
            setShowTable(true); // Hiển thị bảng khi chọn "Riêng tư"
            handleSearchCustomer()
        } else {
            setShowTable(false); // Ẩn bảng nếu chọn "Công khai"
            setSelectedRowKeys([]); // Reset danh sách đã chọn khi chuyển sang công khai
            form.setFieldsValue({ quantity: '' });// Xóa số lượng khi chuyển sang công khai
        }
    };

    const handleTableChange = (pagination) => {
        setPagination(pagination);
        const params = {
            searchText: searchText || null,
            status: status === 'null' ? null : status,
            startDate: dobRange && dobRange[0] ? dobRange[0].format('YYYY-MM-DD') : null,
            endDate: dobRange && dobRange[1] ? dobRange[1].format('YYYY-MM-DD') : null,
            minAge: ageRange[0] === 0 ? null : ageRange[0],
            maxAge: ageRange[1] === 100 ? null : ageRange[1],
            page: pagination.current - 1,
            size: pagination.pageSize
        };

        axiosInstance.get('/api/admin/customers/index', {params})
            .then((response) => {
                const { content, totalElements } = response.data;
                const fetchedData = content.map((item, index) => ({
                    key: index + 1,
                    id: item.id,
                    avatar: item.avatar,
                    fullName: item.fullName,
                    CitizenId: item.citizenId,
                    phoneNumber: item.phoneNumber,
                    dateBirth: item.dateBirth,
                    status: item.status,
                    email: item.email,
                    gender: item.gender === 1 ? 'Nam' : 'Nữ',
                    addresses: item.addresses,
                    password: item.password
                }));
                setCustomers(fetchedData);
                setPagination(prev => ({
                    ...prev,
                    total: totalElements
                }));
            })
            .catch((error) => {
                console.error('Error fetching filtered data:', error);
                toast.error('Có lỗi xảy ra khi tải dữ liệu!');
            });
    };


    const handleSearchCustomer = () => {
        const params = {
            searchText: searchText || null,
            status: status === 'null' ? null : status,
            startDate: dobRange && dobRange[0] ? dobRange[0].format('YYYY-MM-DDTHH:mm:ss') : null,
            endDate: dobRange && dobRange[1] ? dobRange[1].format('YYYY-MM-DDTHH:mm:ss') : null,
            minAge: ageRange[0] === 0 ? null : ageRange[0],
            maxAge: ageRange[1] === 100 ? null : ageRange[1],
            page: pagination.current - 1,
            size: pagination.pageSize
        };

        axiosInstance.get('/api/admin/customers/index', {params})
            .then((response) => {
                const { content, totalElements } = response.data;
                const fetchedData = content.map((item, index) => ({
                    key: index + 1,
                    id: item.id,
                    avatar: item.avatar,
                    fullName: item.fullName,
                    CitizenId: item.citizenId,
                    phoneNumber: item.phoneNumber,
                    dateBirth: item.dateBirth,
                    status: item.status,
                    email: item.email,
                    gender: item.gender === 1 ? 'Nam' : 'Nữ',
                    addresses: item.addresses,
                    password: item.password
                }));
                setCustomers(fetchedData);
                setPagination(prev => ({
                    ...prev,
                    total: totalElements
                }));
            })
            .catch((error) => {
                console.error('Error fetching filtered data:', error);
                toast.error('Có lỗi xảy ra khi tìm kiếm!');
            });
    };

    const handleReset = () => {
        setSearchText('');
        setStatus('null');
        setDobRange([]);
        setAgeRange([0, 100]);
        setPagination(prev => ({
            ...prev,
            current: 1
        }));
        handleSearchCustomer()
    };


    const handleOk = async () => {
        try {
            // Kiểm tra toàn bộ form
            await form.validateFields();

            // Lấy dữ liệu từ form
            const values = form.getFieldsValue();

            // Lấy danh sách email từ danh sách khách hàng đã chọn
            const selectedEmails = customers
                .filter((customer) => selectedCustomers.includes(customer.id))
                .map((customer) => customer.email);

            const requestData = {
                ...values,
                startDate: values.startDate ? dayjs(values.startDate).format("YYYY-MM-DDTHH:mm:ss[Z]") : null,
                endDate: values.endDate ? dayjs(values.endDate).format("YYYY-MM-DDTHH:mm:ss[Z]") : null,

                voucherType: value, // Truyền loại voucher (1: công khai, 2: riêng tư)
                gmailkh: selectedEmails, // Gửi danh sách email thay vì ID khách hàng
            };

            console.log("Dữ liệu gửi lên API:", requestData);

            await axios.post("http://localhost:8080/api/admin/voucher/add", requestData);
            toast.success("Thêm mới phiếu giảm giá thành công!");

            form.resetFields();
            setSelectedRowKeys([]);
            setSelectedCustomers([]);
            navigate("/admin/vouchelist"); // Thay đổi đường dẫn theo cấu trúc của bạn

        } catch (error) {
            toast.error("Lỗi khi lưu dữ liệu!");
        }
    };



    //     };
    const [nameLength, setNameLength] = useState(0);

    return (
        <Row gutter={20}>
            <Col span={8}>
                <h3>Thêm mới phiếu giảm giá</h3>
                <Card>
                    <Form form={form} layout="vertical">
                        <Form.Item
                            name="voucherName"
                            label={`Tên phiếu giảm giá (${nameLength}/50)`}
                            style={{ marginBottom: "12px" }}
                            rules={[
                                { required: true, message: "Không được bỏ trống" },
                                { min: 1, max: 50, message: "Tên phiếu giảm giá phải từ 1 đến 50 ký tự" }
                            ]}
                        >
                            <Input
                                placeholder="Nhập tên đợt giảm giá"
                                style={{ width: "100%" }}
                                maxLength={50}
                                onChange={(e) => setNameLength(e.target.value.length)}
                            />
                        </Form.Item>
                        <Form.Item name="quantity" label="Số lượng" rules={[
                            { required: true, message: 'Vui lòng nhập số lượng' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || (Number(value) >= 1 && Number.isInteger(Number(value)))) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Số lượng phải là số nguyên dương lớn hơn hoặc bằng 1'));
                                },
                            }),
                        ]}>
                            <Input type="number" placeholder="Nhập số lượng" min={1} disabled={value === "PRIVATE"} />
                        </Form.Item>

                        <Form.Item label="Giá trị giảm" required>
                            <Input.Group compact>
                                <Form.Item
                                    name="discountValue"
                                    noStyle
                                    dependencies={["discountType"]}
                                    rules={[
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                const num = Number(value);
                                                const type = getFieldValue("discountType");

                                                if (!value) return Promise.reject(new Error("Không được bỏ trống"));

                                                if (type === "PERCENT" && (!Number.isInteger(num) || num < 1 || num > 99)) {
                                                    return Promise.reject(new Error("Giá trị giảm (%) phải từ 1 đến 99"));
                                                }

                                                if (num < 1) {
                                                    return Promise.reject(new Error("Giá trị giảm phải lớn hơn 0"));
                                                }

                                                return Promise.resolve();
                                            },
                                        }),
                                    ]}
                                >
                                    <InputNumber
                                        placeholder="Nhập giá trị giảm"
                                        style={{ width: "70%" }}
                                        onChange={(value) => {
                                            if (form.getFieldValue("discountType") === "MONEY") {
                                                form.setFieldsValue({ discountMaxValue: value });
                                            }
                                        }}
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                        parser={(value) => value.replace(/\D/g, "")} // Chỉ cho nhập số
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="discountType"
                                    initialValue="PERCENT"
                                    noStyle
                                    rules={[{ required: true, message: "Không được bỏ trống" }]}
                                >
                                    <Select placeholder="Chọn loại giảm" style={{ width: "30%" }}>
                                        <Option value="PERCENT">%</Option>
                                        <Option value="MONEY">đ</Option>
                                    </Select>
                                </Form.Item>
                            </Input.Group>
                        </Form.Item>



                        <Form.Item
                            name="billMinValue"
                            label="Giá trị đơn hàng tối thiểu"
                            rules={[
                                { required: true, message: 'Vui lòng nhập giá trị đơn hàng tối thiểu' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (value === undefined || value < 0 || !Number.isInteger(Number(value))) {
                                            return Promise.reject(new Error('Giá trị phải là số nguyên dương'));
                                        }
                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                        >
                            <InputNumber
                                placeholder="Nhập giá trị đơn hàng tối thiểu"
                                style={{ width: '100%' }}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                suffix="đ"
                            />
                        </Form.Item>


                        <Form.Item
                            name="discountMaxValue"
                            label="Giá trị phiếu giảm giá tối đa"

                            dependencies={["billMinValue", "discountType", "discountValue"]}
                            rules={[
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const discountType = getFieldValue("discountType");
                                        const discountValue = getFieldValue("discountValue");
                                        const minValue = getFieldValue("billMinValue");

                                        if (discountType === "MONEY") {
                                            if (value !== discountValue) {
                                                return Promise.reject(
                                                    new Error("Giá trị phiếu giảm giá tối đa phải bằng giá trị giảm khi giảm giá bằng tiền")
                                                );
                                            }
                                        } else if (discountType === "PERCENT") {
                                            if (value === undefined || value < 0 || !Number.isInteger(Number(value))) {
                                                return Promise.reject(new Error("Giá trị phải là số nguyên dương"));
                                            }
                                            if (minValue !== undefined && minValue !== null && Number(value) > Number(minValue)) {
                                                return Promise.reject(new Error("Giá trị phiếu giảm giá tối đa không được lớn hơn giá trị đơn hàng tối thiểu"));
                                            }
                                        }
                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                        >
                            <InputNumber
                                placeholder="Nhập giá trị phiếu giảm giá tối đa"
                                style={{ width: "100%" }}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                                suffix="đ"
                                disabled={discountType === "MONEY"}
                            />
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
                        <Form.Item name="voucherType" label="Loại phiếu giảm giá" rules={[{ required: true, message: 'Không được bỏ trống' }]}>
                            <Radio.Group onChange={onChange} value={value}>
                                <Radio  value={"PUBLIC"}>Công khai</Radio>
                                <Radio value={"PRIVATE"}>Riêng tư</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Form>
                    {/* <Link to={"/admin/vouchelist"} > */}

                    <Button
                        onClick={showConfirm}
                        type="primary"
                        size="middle "
                        style={{ width: "60%", margin: "0 auto", display: "block" }}
                    >
                        Thêm mới
                    </Button>
                    {/* </Link> */}
                    {/* </Modal> */}

                </Card>
            </Col>
            <Col span={16}>
                {/* Bảng khách hàng hiển thị khi chọn "Riêng tư" */}
                {showTable && (
                    <>

                        <Flex gap="middle" vertical>
                            {loading && <Spin style={{ marginTop: 10 }} />}
                            {error && <Alert message={error} type="error" showIcon style={{ marginTop: 10 }} />}
                            <Flex align="center" gap="middle">
                                <Button type="primary"
                                    onClick={() => {
                                        setSelectedRowKeys([]); // Xóa các ô đã tích
                                        handleSearchCustomer()
                                    }}
                                    disabled={loading}
                                    loading={loading}
                                >
                                    Tải lại danh sách khách hàng
                                </Button>


                                {hasSelected ? `Đã chọn ${selectedRowKeys.length} khách hàng` : null}
                            </Flex>


                            <Card>
                                <h3>Bộ lọc</h3>
                                <hr/>
                                <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                                    <label style={{marginRight: '10px', fontWeight: '500'}}>Tìm kiếm:</label>
                                    <Input
                                        placeholder="Tìm kiếm tên và sdt..."
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        style={{width: '250px', marginRight: '20px', borderRadius: '10px'}}
                                    />

                                    <label style={{marginRight: '10px', fontWeight: '500'}}>Ngày sinh:</label>
                                    <RangePicker
                                        format="YYYY-MM-DD"
                                        showTime
                                        value={dobRange}
                                        onChange={(dates) => setDobRange(dates)}
                                        style={{marginRight: '20px', borderRadius: '10px'}}
                                    />
                                </div>
                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    <label style={{marginRight: '10px', fontWeight: '500'}}>Trạng thái:</label>
                                    <Select
                                        value={status}
                                        onChange={(value) => setStatus(value)}
                                        style={{width: '250px', marginRight: "20px", borderRadius: '10px'}}
                                    >
                                        <Option value="null">Tất cả</Option>
                                        <Option value="HOAT_DONG">Hoạt Động</Option>
                                        <Option value="NGUNG_HOAT_DONG">Ngưng hoạt động</Option>
                                        <Option value="CHUA_KICH_HOAT">Chưa kích hoạt</Option>
                                    </Select>

                                    <label style={{marginRight: '10px', fontWeight: '500'}}>Khoảng tuổi:</label>
                                    <Slider
                                        range
                                        min={0}
                                        max={100}
                                        value={ageRange}
                                        onChange={(value) => setAgeRange(value)}
                                        style={{width: '250px'}}
                                    />
                                </div>
                                <div style={{marginTop: '20px'}}>
                                    <Button
                                        type="primary"
                                        icon={<SearchOutlined/>}
                                        onClick={handleSearchCustomer}
                                        style={{marginRight: "10px"}}
                                    >
                                        Tìm kiếm
                                    </Button>
                                    <Button
                                        type="default"
                                        icon={<ReloadOutlined/>}
                                        onClick={handleReset}
                                        style={{marginRight: "10px"}}
                                    >
                                        Làm mới bộ lọc
                                    </Button>



                                </div>
                            </Card>
                            <Table
                                onChange={handleTableChange}
                                pagination={pagination}
                                rowSelection={rowSelection} columns={columnsCustomers}
                                dataSource={customers} rowKey="id" style={{ marginTop: 20 }} />
                        </Flex>
                    </>
                )}
            </Col>
        </Row>
    );
};

export default AddVoucher;
