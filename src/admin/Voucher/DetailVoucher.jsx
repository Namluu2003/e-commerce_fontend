import React, { useState, useEffect } from 'react';
import { Table, Input, DatePicker, Select, Card, Form, Spin, Alert, Col, Row, Radio, Button, Flex, Modal, message,InputNumber } from 'antd';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { baseUrl } from '../../helpers/Helpers.js';





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
    {
        title: 'CCCD',
        dataIndex: 'citizenId',
        key: 'citizenId',
    },
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
    },

];

const DetailVoucher = () => {
    const [form] = Form.useForm();
    const [value, setValue] = useState("PUBLIC");
    const [customers, setCustomers] = useState([]);
    const [voucher, setVoucher] = useState([]);
    const [error, setError] = useState(null);
    const [showTable, setShowTable] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const navigate = useNavigate(); // Khởi tạo navigate

    const { id } = useParams();


    useEffect(() => {
        const fetchVoucherDetail = async () => {
            if (!id) return;
            try {
                const response = await axios.get(`${baseUrl}/api/admin/voucher/detail/${id}`);
                const data = response.data.data;
    
                setValue(data.voucherType); // Cập nhật loại voucher
                setVoucher(data);
                form.setFieldsValue({
                    ...data,
                    startDate: data.startDate ? moment(data.startDate) : null,
                    endDate: data.endDate ? moment(data.endDate) : null,
                });
    
                if (data.voucherType === "PRIVATE") {
                    await fetchCustomers(); // Gọi API lấy danh sách khách hàng
                    setShowTable(true);
                    setSelectedRowKeys(data.customerIds || []); // Chọn khách hàng đã lưu trước đó
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu voucher:", error);
            }
        };
    
        fetchVoucherDetail();
    }, [id, form]);
    
    

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
            onOk: () => handleOk(),
            // Gọi hàm handleOk khi nhấn xác nhận

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
            form.setFieldsValue({ quantity: selectedRowKeys.length }); 
        }
    }, [selectedRowKeys, value, form]);
    

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
        getCheckboxProps: (record) => ({
            disabled: true, // Vô hiệu hóa checkbox trên tất cả các hàng
        }),
    };

    const hasSelected = selectedRowKeys.length > 0;

    // Gọi API lấy danh sách khách hàng
    const fetchCustomers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get("http://localhost:8080/api/admin/customers/");
            const customerData = response.data.map(c => ({ ...c, key: c.id }));

            setCustomers(customerData);

            // Giữ nguyên danh sách khách hàng đã chọn khi cập nhật dữ liệu
            setSelectedRowKeys(prevKeys => prevKeys.filter(id => customerData.some(c => c.id === id)));
        } catch (err) {
            setError("Lỗi khi tải danh sách khách hàng!");
        }
        setLoading(false);
    };


    // Xử lý khi chọn loại phiếu giảm giá
    const onChange = (e) => {
        const selectedValue = e.target.value;
        setValue(selectedValue);

        if (selectedValue === "PRIVATE") {
            setShowTable(true); // Hiển thị bảng khi chọn "Riêng tư"
            fetchCustomers(); // Gọi API để lấy danh sách khách hàng
        } else {
            setShowTable(false); // Ẩn bảng nếu chọn "Công khai"
            setSelectedRowKeys([]); // Reset danh sách đã chọn khi chuyển sang công khai
            form.setFieldsValue({ quantity: '' });// Xóa số lượng khi chuyển sang công khai
        }
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
                quantity: value === "PRIVATE" ? selectedCustomers.length : values.quantity, 
                voucherType: value, // Truyền loại voucher (1: công khai, 2: riêng tư)
                gmailkh: selectedEmails, // Gửi danh sách email thay vì ID khách hàng
            };

            console.log("Dữ liệu gửi lên API:", requestData);
            await axios.put(`${baseUrl}/api/admin/voucher/update/${id}`, requestData);
            message.success("Thêm mới phiếu giảm giá thành công!");

            form.resetFields();
            setSelectedRowKeys([]);
            setSelectedCustomers([]);
            navigate("/admin/vouchelist"); // Thay đổi đường dẫn theo cấu trúc của bạn

        } catch (error) {
            message.error("Lỗi khi lưu dữ liệu!");
        }
    };


    const [nameLength, setNameLength] = useState(0);


    return (
        <Row gutter={20}>
            <Col span={8}>
                <Card>
                    {/* <Modal title="Thêm mới phiếu giảm giá" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} okText="Xác nhận" cancelText="Hủy"> */}
                    <Form form={form} layout="vertical" disabled>
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
                        <Form.Item name="quantity" label="Số lượng" disabled rules={[
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
                            <Input type="number" placeholder="Nhập số lượng" min={1} disabled />
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

                                                if (!value) return Promise.reject(new Error('Không được bỏ trống'));

                                                if (type === "PERCENT" && (!Number.isInteger(num) || num < 1 || num > 100)) {
                                                    return Promise.reject(new Error('Giá trị giảm (%) phải từ 1 đến 100'));
                                                }

                                                if (num < 1) {
                                                    return Promise.reject(new Error('Giá trị giảm phải lớn hơn 0'));
                                                }

                                                return Promise.resolve();
                                            },
                                        }),
                                    ]}
                                >
                                    
                                    <InputNumber placeholder="Nhập giá trị giảm" style={{ width: '70%' }}
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/\D/g, '')} // Chỉ cho nhập số
                                    />
                                </Form.Item>

                                <Form.Item name="discountType" initialValue="PERCENT" noStyle rules={[{ required: true, message: 'Không được bỏ trống' }]}>
                                    <Select placeholder="Chọn loại giảm" style={{ width: '30%' }}>
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
                                                return Promise.reject(new Error('Giá trị phiếu giảm giá tối đa phải bằng giá trị giảm khi giảm giá bằng tiền'));
                                            }
                                        } else if (discountType === "PERCENT") {
                                            if (value === undefined || value < 0 || !Number.isInteger(Number(value))) {
                                                return Promise.reject(new Error('Giá trị phải là số nguyên dương'));
                                            }
                                            if (minValue !== undefined && minValue !== null && Number(value) > Number(minValue)) {
                                                return Promise.reject(new Error('Giá trị phiếu giảm giá tối đa không được lớn hơn giá trị đơn hàng tối thiểu'));
                                            }
                                        }
                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                        >
                            <InputNumber
                                placeholder="Nhập giá trị phiếu giảm giá tối đa"
                                style={{ width: '100%' }}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                suffix="đ"
                                disabled
                            />
                        </Form.Item>


                        <Form.Item
                            name="startDate"
                            label="Ngày bắt đầu"
                            rules={[
                                { required: true, message: 'Không được bỏ trống' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || !getFieldValue('endDate') || value.isBefore(getFieldValue('endDate'))) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Ngày bắt đầu không được vượt quá ngày kết thúc!'));
                                    },
                                }),
                            ]}
                        >
                            <DatePicker
                                showTime={{ format: 'HH:mm:ss' }}
                                format="DD/MM/YYYY HH:mm:ss"
                                style={{ width: '100%' }}
                                getValueProps={(value) => ({ value: value ? dayjs(value).utcOffset(7) : null })}
                            />                        </Form.Item>

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
                            />                        </Form.Item>
                        <Form.Item name="voucherType" label="Loại phiếu giảm giá" rules={[{ required: true, message: 'Không được bỏ trống' }]}>
                            <Radio.Group onChange={onChange} value={value} disabled>
                                <Radio checked={true} value={"PUBLIC"}>Công khai</Radio>
                                <Radio value={"PRIVATE"}>Riêng tư</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Form>

                </Card>
            </Col>
            <Col span={16}>
                {/* Bảng khách hàng hiển thị khi chọn "Riêng tư" */}
                {showTable  && (
                    <>

                        <Flex gap="middle" vertical >
                            {loading && <Spin style={{ marginTop: 10 }} />}
                            {error && <Alert message={error} type="error" showIcon style={{ marginTop: 10 }} />}
                            <Flex align="center" gap="middle">
                               
                            </Flex>
                            <Table rowSelection={rowSelection} columns={columnsCustomers}
                                dataSource={customers} rowKey="id" style={{ marginTop: 20 }} />
                        </Flex>
                    </>
                )}
            </Col>
        </Row>
    );
};

export default DetailVoucher;
