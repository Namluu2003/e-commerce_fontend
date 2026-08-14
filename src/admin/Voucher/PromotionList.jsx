import React, { useEffect, useState } from 'react';
import { Space, Table, Input, DatePicker, Card, Button, Modal, Form, message, Row, Col, Tooltip, Switch } from 'antd';
import axios from 'axios';
import { baseUrl, convertStatusVoucher } from '../../helpers/Helpers.js';
import { Link, useNavigate } from 'react-router-dom';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { FaEye, FaTrash, FaPen } from "react-icons/fa6"; // Thay FaEdit bằng FaPen
import {toast} from "react-toastify";
import { FaEdit } from "react-icons/fa";


const PromotionList = () => {
    const navigate = useNavigate();
    const [promotionData, setPromotionData] = useState([]);
    const [pagination, setPagination] = useState({ page: 0, size: 5, total: 0 });
    const [search, setSearch] = useState('');
    const [discountValue, setDiscountValue] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [form] = Form.useForm();

    const convertToVietnamTime = (utcDate) => {
        if (!utcDate) return "Không có dữ liệu";
        return new Date(utcDate).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
    };

    const columns = [
        { title: 'STT', render: (_, __, index) => (pagination.page * pagination.size) + index + 1 },
        { title: 'Mã đợt giảm giá', dataIndex: 'promotionCode', key: 'promotionCode' },
        { title: 'Tên đợt giảm giá', dataIndex: 'promotionName', key: 'promotionName' },
        {
            title: 'Giá trị giảm',
            dataIndex: 'discountValue',
            key: 'discountValue',
            render: (text, record) => record.discountType === 'PERCENT' ? `${text}%` : text,
        },
        { title: 'Ngày bắt đầu', dataIndex: 'startDate', key: 'startDate', render: (text) => convertToVietnamTime(text) },
        { title: 'Ngày kết thúc', dataIndex: 'endDate', key: 'endDate', render: (text) => convertToVietnamTime(text) },
        {
            title: 'Trạng thái',
            dataIndex: 'statusPromotion',
            key: 'statusPromotion',
            align: 'center',
            render: (_, record) => {
                let displayStatus = convertStatusVoucher(record.statusPromotion);
                let color = record.statusPromotion === 'dang_kich_hoat' ? '#389e0d' :
                    record.statusPromotion === 'chua_kich_hoat' ? 'orange' : 'red';
                let backgroundColor = record.statusPromotion === 'dang_kich_hoat' ? '#f6ffed' :
                    record.statusPromotion === 'chua_kich_hoat' ? '#fff4e6' : '#fff1f0';
                return (
                    <div style={{
                        cursor: 'pointer',
                        color: color,
                        border: `1px solid ${color}`,
                        borderRadius: '8px',
                        textAlign: 'center',
                        padding: '5px 10px',
                        display: 'inline-block',
                        backgroundColor: backgroundColor,
                        fontSize: '10px',
                    }}>
                        {displayStatus}
                    </div>
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    {record.statusPromotion !== 'ngung_kich_hoat' && (
                        <Tooltip title="Chỉnh sửa">
                            <FaEdit
                                style={{ color: "#ff974d", fontSize: "1.2rem", cursor: "pointer" }}
                                onClick={() => navigate(`/admin/promotion/update/${record.id}`)}
                            />
                        </Tooltip>
                    )}
                    <Tooltip title="Thay đổi trạng thái">
                        <Switch
                            disabled={record.statusPromotion === "ngung_kich_hoat"}
                            checked={record.statusPromotion === "dang_kich_hoat"}
                            checkedChildren="Bật"
                            unCheckedChildren="Tắt"
                            size='small'
                            onChange={(checked) => {
                                Modal.confirm({
                                    title: "Xác nhận thay đổi trạng thái",
                                    content: `Bạn có chắc chắn muốn ${checked ? "bật" : "tắt"} promotion này không?`,
                                    okText: "Xác nhận",

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
                                            await axios.get(`${baseUrl}/api/admin/promotion/switchStatus`, {
                                                params: { id: record.id, status: newStatus },
                                                timeout: 5000
                                            });
                                            getPagePromotion();
                                            toast.success("Cập nhật trạng thái thành công");
                                        } catch (error) {
                                            toast.error("Cập nhật trạng thái thất bại: " + error.message);
                                            console.error(error);
                                        }
                                    }
                                    
                                });
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Xem chi tiết">
                        <FaEye
                            style={{ color: "#ff974d", fontSize: "1.2rem", cursor: "pointer" }}
                            onClick={() => navigate(`/admin/promotion/detail/${record.id}`)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const getPagePromotion = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/admin/promotion/index`, {
                params: {
                    size: pagination.size,
                    page: pagination.page,
                    search: search || undefined,
                    discountValue: discountValue !== '' ? parseFloat(discountValue) : undefined, // sửa ở đây
                    startDate: startDate || undefined,
                    endDate: endDate || undefined,
                }
            });
            const { data, totalElements } = response.data;
            setPromotionData(data || []);
            setPagination(prev => ({ ...prev, total: totalElements || 0 }));
        } catch (error) {
            toast.error('Lỗi khi tải danh sách promotion');
            console.error(error);
        }
    };

    useEffect(() => {
        getPagePromotion();
    }, [pagination.page, pagination.size, search, discountValue, startDate, endDate]);

    const handleTableChange = (paginationTable) => {
        setPagination({
            ...pagination,
            page: paginationTable.current - 1,
            size: paginationTable.pageSize,
        });
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPagination(prev => ({ ...prev, page: 0 }));
    };
    const handleSearchDiscountChange = (e) => {
        setDiscountValue(e.target.value);
        setPagination(prev => ({ ...prev, page: 0 }));
    };
    const resetFilters = () => {
        setSearch('');
        setDiscountValue('');
        setStartDate(null);
        setEndDate(null);
        setPagination(prev => ({ ...prev, page: 0 }));
        form.resetFields();
    };

    return (
        <>
            <h4>Bộ lọc</h4>
            <Card>
                <Form form={form} layout="vertical">
                    <Row gutter={24}>
                        <Col span={8}>
                            <Form.Item label="Tên đợt giảm giá">
                                <Input
                                    placeholder="Nhập tên đợt giảm giá"
                                    prefix={<SearchOutlined />}
                                    allowClear
                                    value={search}
                                    onChange={handleSearchChange}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Giá trị giảm">
                                <Input
                                    placeholder="Nhập giá trị giảm"
                                    prefix={<SearchOutlined />}
                                    allowClear
                                    suffix="%"

                                    value={discountValue}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d*\.?\d*$/.test(value)) { // chỉ nhận số và dấu chấm (decimal)
                                            setDiscountValue(value);
                                            setPagination(prev => ({ ...prev, page: 0 }));
                                        }
                                    }}
                                />
                            </Form.Item>

                        </Col>

                        <Col span={8}>
                            <Form.Item label="Ngày bắt đầu">
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    onChange={(date, dateString) => setStartDate(dateString)}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Ngày kết thúc">
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    onChange={(date, dateString) => setEndDate(dateString)}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Button type="primary" onClick={getPagePromotion}>Tìm kiếm</Button>
                    <Button style={{ marginLeft: '8px' }} onClick={resetFilters}>Làm mới</Button>
                </Form>
            </Card>

            <h4 style={{ paddingTop: '15px' }}>Danh sách đợt giảm giá</h4>
            <Card>
                <Link to="/admin/promotion/add">
                    <Button type="primary" icon={<PlusOutlined />}
                        style={{ marginBottom: '20px', border: 'none' }}>
                        Thêm mới
                    </Button>
                </Link>
                <Table
                    columns={columns}
                    dataSource={promotionData}
                    rowKey="id"
                    pagination={{
                        current: pagination.page + 1,
                        pageSize: pagination.size,
                        total: pagination.total,
                    }}
                    onChange={handleTableChange}
                />
            </Card>
        </>
    );
};

export default PromotionList;