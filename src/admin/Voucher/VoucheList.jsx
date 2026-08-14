import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Space, Table, Input, DatePicker, Select, Card, Button, Modal, Form, message, Col, Row, theme, Tag, Radio, Spin, List, Switch, Tooltip, InputNumber } from 'antd';
import axios from 'axios';
import { baseUrl, convertStatusVoucher, ConvertvoucherType, ConvertdiscountType } from '../../helpers/Helpers.js';

import "./StatusSelector.css";
import { EyeOutlined, SearchOutlined, EditOutlined, DeleteOutlined, RedoOutlined, PlusOutlined, DownOutlined } from '@ant-design/icons';
import { FaEye, FaTrash } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { debounce } from "lodash"; // Thêm debounce để tránh gọi API liên tục
import {toast} from "react-toastify";

const { Option } = Select;

const VoucherList = () => {
    const [pagination, setPagination] = useState({
        page: 0,
        size: 5,
        total: 0
    });

    const convertToVietnamTime = (utcDate) => {
        if (!utcDate) return ""; // Kiểm tra nếu không có giá trị tránh lỗi
        return new Date(utcDate).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
    };


    const columns = (handleEdit, handleDelete, handleDetail) => [
        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            align: 'center',

            render: (text, record, index) => index + 1,
        },
        {
            title: 'Mã phiếu giảm giá',
            dataIndex: 'voucherCode',
            key: 'voucherCode',
            align: 'center',

        },
        {
            title: 'Tên phiếu giảm giá',
            dataIndex: 'voucherName',
            key: 'voucherName',
            align: 'center',

        },
        {
            title: 'Loại phiếu giảm giá',
            dataIndex: 'voucherType',
            key: 'voucherType',
            align: 'center',

            render: (text, record) => {
                let displayStatus = ConvertvoucherType(record.voucherType);
                let color = '';

                if (record.voucherType === 'PUBLIC') {
                    color = 'blue'; // Công khai (Màu xanh)
                } else if (record.voucherType === 'PRIVATE') {
                    color = 'purple'; // Riêng tư (Màu tím)
                }
                return (
                    <Tag color={color} style={{ padding: '5px 10px', borderRadius: '10px', fontWeight: 'bold' }}>
                        {displayStatus}
                    </Tag>
                );
            },
        },
        {
            title: 'Số lượng phiếu giảm giá',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',

        },
        {
            title: 'Giá trị giảm',
            dataIndex: 'discountValue',
            key: 'discountValue',
            align: 'center',

            render: (text, record) => {
                console.log("record.discountType:", record.discountType); // Debug
                console.log("text:", text); // Debug

                return (
                    <span>
                        {record.discountType === 'PERCENT'
                            ? `${record.discountValue} %`
                            : `${record.discountValue} đ`}
                    </span>
                );
            },
        }
        ,

        {
            title: ' Giá trị đơn hàng tối thiểu để áp dụng phiếu giảm giá',
            dataIndex: 'billMinValue',
            key: 'billMinValue',
            align: 'center',

            render: (text) => text ? <span>{text.toLocaleString()} đ</span> : <span>0 đ</span>,
        },
        {
            title: 'Giá trị giảm tối đa cho đơn hàng',

            dataIndex: 'discountMaxValue',
            key: 'discountMaxValue',
            align: 'center',
            className: 'column-border-right',

            render: (text) => text ? <span>{text.toLocaleString()} đ</span> : <span>0 đ</span>,
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'startDate',
            key: 'startDate',
            align: 'center',
            render: (text) => (text ? convertToVietnamTime(text) : "Không có dữ liệu"),
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'endDate',
            key: 'endDate',
            align: 'center',
            render: (text) => (text ? convertToVietnamTime(text) : "Không có dữ liệu"),
        },

        {
            title: 'Trạng thái',
            dataIndex: 'statusVoucher',
            key: 'statusVoucher',
            align: 'center',

            render: (_, record) => {
                let displayStatus = convertStatusVoucher(record.statusVoucher);
                let color =
                    record.statusVoucher === 'dang_kich_hoat' ? '#389e0d' :
                        record.statusVoucher === 'chua_kich_hoat' ? 'orange' :
                            'red';

                let backgroundColor =
                    record.statusVoucher === 'dang_kich_hoat' ? '#f6ffed' :
                        record.statusVoucher === 'chua_kich_hoat' ? '#fff4e6' :
                            '#fff1f0';

                return (
                    <div
                        style={{
                            cursor: 'pointer',
                            color: color,
                            border: `1px solid ${color}`,
                            borderRadius: '8px',
                            textAlign: 'center',
                            padding: '5px 10px',
                            display: 'inline-block',
                            backgroundColor: backgroundColor,
                            fontSize: '10px',
                        }}
                    >
                        {displayStatus}
                    </div>
                );
            },
        },


        ,
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    {record.statusVoucher !== 'ngung_kich_hoat' && (
                        <Tooltip title="Chỉnh sửa">
                            <FaEdit
                                style={{ color: "#ff974d", fontSize: "1.2rem", cursor: "pointer" }}
                                onClick={() => handleEdit(record)}
                            />
                        </Tooltip>
                    )}

                    {/* Nút bật/tắt trạng thái */}

                    <Tooltip title="Thay đổi trạng thái">
                        <Switch
                            disabled={record.statusVoucher === "ngung_kich_hoat"}
                            checked={record.statusVoucher === "dang_kich_hoat"}
                            checkedChildren="Bật"
                            unCheckedChildren="Tắt"
                            size='small'
                            onChange={(checked) => {
                                Modal.confirm({
                                    title: "Xác nhận thay đổi trạng thái",
                                    content: `Bạn có chắc chắn muốn ${checked ? "bật" : "tắt"} voucher này không?`,
                                    okText: "Xác nhận",
                                    cancelText: "Hủy",
                                     okButtonProps: {
                                                    style: {
                                                        backgroundColor: '#ff974d', // Nền cam
                                                        borderColor: '#ff974d', // Viền cam
                                                        color: '#fff', // Chữ trắng để dễ nhìn
                                                    },
                                                },
                                    onOk: async () => {
                                        try {
                                            const newStatus = checked ? "dang_kich_hoat" : "ngung_kich_hoat";
                                            console.log("Trạng thái mới:", newStatus);

                                            await switchVoucherStatus(record.id, { status: newStatus });
                                            getPageVoucher();
                                            toast.success("Cập nhật trạng thái thành công");
                                        } catch (error) {
                                            toast.error("Cập nhật trạng thái không thành công");
                                        }
                                    }
                                });
                            }}
                        />
                    </Tooltip>



                    <Tooltip title="Xem chi tiết">
                        <FaEye
                            style={{ color: "#ff974d", fontSize: "1.2rem", cursor: "pointer" }}
                            onClick={() => handleDetail(record)}
                        />
                    </Tooltip>

                    {/* <Tooltip title="Xóa">
                        <FaTrash
                            style={{ color: "#ff4d4f", fontSize: "1.2rem", cursor: "pointer" }}
                            onClick={() => handleDelete(record.id)}
                        />
                    </Tooltip> */}
                </Space>
            ),
        },
    ];
    const [voucherData, setVoucherData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingVoucher, setEditingVoucher] = useState(null);
    const navigate = useNavigate();
    const [voucherType, setVoucherType] = useState(null); // State for voucher type
    const { RangePicker } = DatePicker;
    const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState(""); // Giữ giá trị nhập
    const [statusVoucher, setStatusVoucher] = useState(null);
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [discountType, setDiscountType] = useState(null); // State for discount type

    // Hàm switch
    const switchVoucherStatus = async (id, statusO) => {
        const { status } = statusO
        console.log("toi ham nay");

        try {
            const response = await axios.get("http://localhost:8080/api/admin/voucher/switchStatus", {
                params: { id, status }
            });
            console.log(response);

        } catch (error) {
            console.log(error);

            throw error;
        }
    };


    const style = {
        display: "flex",
        flexDirection: "column",
        gap: 8,
    };


    // Fetching voucher data (you may want to keep this if it's not commented out)
    useEffect(() => {
        getPageVoucher();
    }, [pagination, statusVoucher, search, startDate, endDate, voucherType, discountType]);

    const getPageVoucher = async () => {
        const response = await axios.get(`${baseUrl}/api/admin/voucher/index`, {
            params: {
                size: pagination.size,
                page: pagination.page,
                statusVoucher,
                search,
                startDate,
                endDate,
                voucherType,
                discountType
            }
        });
        
        const data = response.data; // Get the entire response
        const items = data.data; // Access the vouchers array

        // Update the voucher data
        setVoucherData(items);

        // Update pagination state
        const newPagination = {
            page: data.currentPage, // Update to currentPage from response
            size: pagination.size,
            total: data.totalElements // Update total from response
        };

        // Update pagination only if there's a change
        if (
            pagination.page !== newPagination.page ||
            pagination.size !== newPagination.size ||
            pagination.total !== newPagination.total
        ) {
            setPagination(newPagination);
        }
    };

    const handleEdit = (record) => {
        navigate(`/admin/voucher/update/${record.id}`);
    };
    const handleDetail = (record) => {
        navigate(`/admin/voucher/detail/${record.id}`);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${baseUrl}/api/admin/voucher/delete/${id}`);
            toast.success('Xóa phiếu giảm giá thành công!');
            getPageVoucher();  // Fetch updated list
        } catch (error) {
            toast.error('Lỗi khi xóa phiếu giảm giá!');
        }
    };
    const [isDetail, setIsDeatil] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const handleOnChangeTable = (paginationTable) => {
        setPagination({
            ...pagination,
            page: paginationTable.current - 1, // Update current page
            size: paginationTable.pageSize, // Update page size
        });
    };
    const [searchParams, setSearchParams] = useState({
        voucherName: '',
        quantity: '',
        startDate: null,
        endDate: null
    });
    const handleSearchChange = (field, value) => {
        setSearchParams((prev) => ({
            ...prev,
            [field]: value
        }));
        if (field === 'voucherName') {
            setSearch(value); // Update search term
        }
    };

    useEffect(() => {
        console.log("Danh sách voucher sau khi cập nhật:", voucherData);
    }, [voucherData]);





    return (
        <>
            <h4>Bộ lọc</h4>
            <Card>
                <Form layout="vertical">
                    <Row gutter={24}>
                        <Col span={8}>
                            <Form.Item label="Tên phiếu giảm giá">
                                <Input
                                    name='voucherName'
                                    placeholder="Nhập tên phiếu giảm giá"
                                    prefix={<SearchOutlined />}
                                    allowClear
                                    onChange={(e) => handleSearchChange('voucherName', e.target.value)}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Loại phiếu giảm giá">
                                <Select
                                    placeholder="Chọn loại phiếu giảm giá"
                                    onChange={(value) => setVoucherType(value)}
                                    allowClear
                                >
                                    <Option value="PUBLIC">Công khai</Option>
                                    <Option value="PRIVATE">Riêng tư</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Loại giảm giá">
                                <Select
                                    placeholder="Chọn loại giảm giá"
                                    onChange={(value) => setDiscountType(value)}
                                    allowClear
                                >
                                    <Option value="PERCENT">Phần trăm</Option>
                                    <Option value="MONEY">Số tiền</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Ngày bắt đầu">
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    onChange={(date, dateString) => setStartDate(dateString)}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Ngày kết thúc">
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    onChange={(date, dateString) => setEndDate(dateString)}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Button type="primary" onClick={getPageVoucher}>Tìm kiếm</Button>
                    <Button style={{ marginLeft: '8px' }} onClick={() => {
                        setSearch("");
                        setStartDate(null);
                        setEndDate(null);
                        setVoucherType(null);
                        setDiscountType(null);
                        getPageVoucher(); // Reset filters
                    }}>Làm mới</Button>
                </Form>
            </Card>
            <h4 style={{ paddingTop: '15px' }}>Danh sách phiếu giảm giá</h4>

            <Card>
                <Link to={"/admin/voucher/add"} >
                    <Button type="primary" icon={<PlusOutlined />}
                         style={{
                            marginBottom: '20px',
                            border: 'none'
                        }}>
                        Thêm mới
                    </Button>
                </Link>
                <Table
                    columns={columns(handleEdit, handleDelete, handleDetail) }
                    dataSource={voucherData}
                    rowKey="id"
                    pagination={{
                        current: pagination.page + 1,
                        pageSize: pagination.size,
                        total: pagination.total
                    }}
                    
                    onChange={handleOnChangeTable}
                />
            </Card>
        </>
    );
};

export default VoucherList;