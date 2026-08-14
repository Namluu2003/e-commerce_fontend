import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Space, Table, Input, DatePicker, Select, Card, Button, Modal, Form, message, Col, Row, theme, Tag, Radio, Spin, List, Switch, Tooltip, InputNumber } from 'antd';
import axios from 'axios';
import { baseUrl, convertStatusVoucher, ConvertvoucherType, ConvertdiscountType } from '../../helpers/Helpers.js';

import "./StatusSelector.css";
import { EyeOutlined, SearchOutlined, EditOutlined, DeleteOutlined, RedoOutlined, PlusOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { FaEye, FaTrash } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { debounce } from "lodash";
import {toast} from "react-toastify"; // Thêm debounce để tránh gọi API liên tục

const { Option } = Select;

const VoucherList = () => {
    const [pagination, setPagination] = useState({
        page: 0,
        size: 5,
        total: 7
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
            title: 'Giá trị tối thiểu',
            dataIndex: 'billMinValue',
            key: 'billMinValue',
            align: 'center',

            render: (text) => text ? <span>{text.toLocaleString()} đ</span> : <span>0 đ</span>,
        },
        {
            title: 'Giá trị tối đa',

            dataIndex: 'discountMaxValue',
            key: 'discountMaxValue',
            align: 'center',

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
                            style={{ color: "#1890ff", fontSize: "1.2rem", cursor: "pointer" }}
                            onClick={() => handleDetail(record)}
                        />
                    </Tooltip>

                    <Tooltip title="Xóa">
                        <FaTrash
                            style={{ color: "#ff4d4f", fontSize: "1.2rem", cursor: "pointer" }}
                            onClick={() => handleDelete(record.id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];
    const [voucherData, setVoucherData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingVoucher, setEditingVoucher] = useState(null);
    const navigate = useNavigate();
    const [voucherType, setVoucherType] = useState(0); // Mặc định là Công khai
    const { RangePicker } = DatePicker;
    const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState(""); // Giữ giá trị nhập
    const [expand, setExpand] = useState(false); // Trạng thái mở rộng


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
    }, [pagination]);

    const getPageVoucher = async () => {
        const response = await axios.get(`${baseUrl}/api/admin/voucher/page?page=${pagination.page}&size=${pagination.size}`);
        const data = response.data.data;
        console.warn(data);

        const items = data.content.map((el) => {
            el.startDate = new Date(el.startDate);
            el.endDate = new Date(el.endDate);
            return el;
        });
        setVoucherData(items);
        console.log(items);


        const newPagination = {
            page: data.number,
            size: data.size,
            total: data.totalElements
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

    const handleAdd = () => {
        setIsDeatil(false)
        setIsEdit(false)
        setEditingVoucher(null);
        setIsModalOpen(true);
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
    const searchPromotions = async ({ voucherName, quantity, voucherType, statusVoucher, dateRange, minDiscount, maxDiscount, minBill, maxBill }) => {
        setLoading(true);
        try {
            const requests = [];

            // API tìm kiếm theo tên phiếu giảm giá
            if (voucherName) {
                requests.push(
                    axios.get(`${baseUrl}/api/admin/voucher/search/byName`, { params: { voucherName } })
                );
            }

            // API tìm kiếm theo số lượng
            if (quantity !== undefined) {
                requests.push(
                    axios.get(`${baseUrl}/api/admin/voucher/search/byQuantity`, { params: { quantity } })
                );
            }


            // API tìm kiếm theo trạng thái
            if (statusVoucher) {
                requests.push(
                    axios.get(`${baseUrl}/api/admin/voucher/search/status`, { params: { statusVoucher } })
                );
            }

            // API tìm kiếm theo ngày tạo
            if (dateRange && dateRange.length === 2) {
                requests.push(
                    axios.get(`${baseUrl}/api/admin/voucher/search/byEndDateRange`, {
                        params: {
                            startDate: dateRange[0].format("YYYY-MM-DD"),
                            endDate: dateRange[1].format("YYYY-MM-DD"),
                        },
                    })
                );
            }
            // API tìm kiếm theo khoảng giảm giá
            if (minDiscount !== undefined && maxDiscount !== undefined) {
                requests.push(
                    axios.get(`${baseUrl}/api/admin/voucher/search/byDiscountMaxRange`, {
                        params: { minDiscount, maxDiscount }
                    })
                );
            }

            // API tìm kiếm theo khoảng giá trị hóa đơn
            if (minBill !== undefined && maxBill !== undefined) {
                requests.push(
                    axios.get(`${baseUrl}/api/admin/voucher/search/byBillMinRange`, {
                        params: { minBill, maxBill }
                    })
                );
            }

            // Chạy tất cả các API song song
            const responses = await Promise.all(requests);

            // Gộp dữ liệu từ các API
            let mergedData = [];
            responses.forEach((res) => {
                if (res.data?.data) {
                    mergedData = [...mergedData, ...res.data.data];
                }
            });

            setVoucherData(mergedData); // Cập nhật danh sách voucher

        } catch (error) {
            console.error("Lỗi khi tìm kiếm phiếu giảm giá:", error);
            toast.error("Có lỗi xảy ra khi tìm kiếm.");
        } finally {
            setLoading(false);
        }
    };

    const debouncedSearch = useCallback(
        debounce((value) => {
            if (value.trim()) { // Tránh tìm kiếm chuỗi rỗng
                searchPromtion(value);
            } else {
                getPageVoucher(); // Nếu rỗng, tải lại danh sách voucher mặc định
            }
        }, 1000),
        []
    );

    useEffect(() => {
        console.log("Danh sách voucher sau khi cập nhật:", voucherData);
    }, [voucherData]);



    const AdvancedSearchForm = () => {
        return (
            <Card>
                <Form layout="vertical">
                    <Row gutter={24}>
                        <Col span={24}>
                            <Form.Item label="Tên phiếu giảm giá">
                                <Input
                                    placeholder="Nhập tên phiếu giảm giá"
                                    prefix={<SearchOutlined />}
                                    allowClear
                                    onChange={(e) => debouncedSearch(e.target.value)
                                    }
                                />
                            </Form.Item>
                        </Col>
                        {/* Phần mở rộng */}
                        {expand && (
                            <>
                                <Col span={8}>
                                    <Form.Item label="Khoảng giá trị đơn hàng">
                                        <Space>
                                            <Form.Item name="billMinValue" noStyle>
                                                <InputNumber placeholder="Từ" style={{ width: "100%" }} min={0} />
                                            </Form.Item>
                                            -
                                            <Form.Item name="billMaxValue" noStyle>
                                                <InputNumber placeholder="Đến" style={{ width: "100%" }} min={0} />
                                            </Form.Item>
                                        </Space>
                                    </Form.Item>
                                </Col>
                              
                                <Col span={8}>
                                    <Form.Item name="quantity" label="Số lượng">
                                        <InputNumber style={{ width: "100%" }} min={0} placeholder="Nhập số lượng" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="statusVoucher" label="Trạng thái">
                                        <Select placeholder="Chọn trạng thái">
                                            <Option value="">Tất cả</Option>
                                            <Option value="dang_kich_hoat">Đang kích hoạt</Option>
                                            <Option value="ngung_kich_hoat">Ngừng kích hoạt</Option>
                                            <Option value="chua_kich_hoat">Chưa kích hoạt</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="dateRange" label="Chọn khoảng thời gian">
                                        <RangePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                                    </Form.Item>
                                </Col>
                            </>
                        )}
                    </Row>

                    {/* Nút mở rộng / thu gọn */}
                    <Row>
                        <Col span={24} style={{ textAlign: "right" }}>
                            <Button type="link" onClick={() => setExpand(!expand)}>
                                {expand ? "Thu gọn" : "Mở rộng"} {expand ? <UpOutlined /> : <DownOutlined />}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card>
        );
    };

    return (
        <>
            <h4>Bộ lọc</h4>
            <AdvancedSearchForm onFilterChange={(newFilters) => {
            }} />
            <h4 style={{ paddingTop: '15px' }}>Danh sách phiếu giảm giá</h4>

            <Card>
                <Link to={"/admin/voucher/add"} >
                    <Button type="primary" icon={<PlusOutlined />}
                        onClick={handleAdd} style={{
                            marginBottom: '20px',
                            border: 'none',
                            backgroundColor: '#ff974d'
                        }}>
                        Thêm mới
                    </Button>
                </Link>
                <Table
                    columns={columns(handleEdit, handleDelete, handleDetail)}
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