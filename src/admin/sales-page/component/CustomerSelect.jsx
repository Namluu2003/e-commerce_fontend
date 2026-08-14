import React, {useCallback, useEffect, useState} from 'react';
import {Button, Card, Select, Row, Col, Descriptions, Avatar, Tag, Modal} from "antd";
import { UserAddOutlined, PhoneOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import {toast} from "react-toastify";
import axiosInstance from "../../../utils/axiosInstance.js";
import {debounce} from "lodash";
import {convertDate, convertDateFullYear} from "../../../helpers/Helpers.js";
import AddCustomer from "../../../customer/AddCustomer.jsx";
import {genStringAccountStatus} from "../../../customer/accountService.js";

const CustomerSelect = ({ customer, onCustomerSelect, setBillVouchers }) => {

    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isShowAddCustomer, setIsShowAddCustomer] = useState(false)

    // Sử dụng useCallback để không tạo lại hàm debounce mỗi lần component render
    const handleSearch = useCallback(
        debounce(async (value) => {
            if (!value) return;

            setLoading(true);
            try {
                const response = await axiosInstance.get(`/api/admin/customers/search?query=${value}`);
                setSearchResults(response.data);
            } catch (error) {
                console.error("Lỗi khi tìm kiếm khách hàng:", error);
            }
            setLoading(false);
        }, 500), // Chờ 500ms sau khi user ngừng nhập mới gọi API
        []
    );

    const [options, setOptions] = useState([]);

    useEffect(() => {
        setOptions(searchResults.map(c => ({
            key: c.id,
            value: c.id,
            label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar src={c.avatar} size="small">{c.fullName?.charAt(0)}</Avatar>
                    <div>
                        <div>{c.fullName}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{c.phoneNumber} </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{c.email} </div>
                        <div>Trạng thái : {genStringAccountStatus(c.status)}</div>
                    </div>
                </div>
            ),
        })));
    }, [searchResults]);

    const OnAddCustomerOk = () => {
        setIsShowAddCustomer(false);
    }

    return (
        <Card>
            <div className={"d-flex justify-content-between align-items-center mb-4"}>
                <div className={"d-flex gap-3 align-items-center justify-content-between"}>
                    <h3>Thông tin khách hàng</h3>

                </div>
                <div className={"d-flex gap-3"}>
                    <Select
                        showSearch
                        allowClear
                        style={{ width: 300 }}
                        placeholder="Tìm kiếm theo tên, email, số điện thoại"
                        optionFilterProp="label"
                        filterOption={false}
                        notFoundContent={null}
                        onSearch={handleSearch} // Gọi API với debounce
                        loading={loading}
                        options={options} // Dùng options từ state
                        onSelect={(value) => {
                            const selectedCustomer = searchResults.find(c => c.id === value);
                            if (selectedCustomer?.status !== 0) {
                                toast.warning("Tài khoản khách hàng đã ngừng hoạt động!");
                                return;
                            }
                            onCustomerSelect(selectedCustomer);
                        }}
                    />


                    <Button type="primary"
                            onClick={() => setIsShowAddCustomer(true)}
                            icon={<UserAddOutlined />}>
                        Thêm mới khách hàng
                    </Button>
                </div>
            </div>

            <div className="customer-info-container" style={{ padding: '20px 0' }}>
                {customer ? (
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <div className={"d-flex  justify-content-between"}  >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                                  <Avatar
                                      src={customer.avatar}
                                      size={64}
                                      style={{ backgroundColor: '#1890ff' }}
                                  >
                                      {customer.fullName?.charAt(0)}
                                  </Avatar>
                                  <div>
                                      <h2 style={{ margin: 0 }}>{customer.fullName}</h2>
                                      <Tag color={customer.status === 0 ? 'green' : 'red'}>
                                          {genStringAccountStatus(customer.status)}
                                      </Tag>
                                  </div>
                              </div>

                                <Button
                                    onClick={() => {
                                        onCustomerSelect(null)
                                    }}
                                    type={"primary"}
                                >Bỏ chọn khách hàn
                                </Button>
                            </div>
                        </Col>
                        <Col span={24}>
                            <Descriptions bordered size="small">
                                <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>} span={1}>
                                    {customer.phoneNumber}
                                </Descriptions.Item>
                                <Descriptions.Item label={<><MailOutlined /> Email</>} span={2}>
                                    {customer.email}
                                </Descriptions.Item>
                                <Descriptions.Item label={<><IdcardOutlined /> CCCD/CMT</>} span={1}>
                                    {customer.CitizenId}
                                </Descriptions.Item>
                                <Descriptions.Item label="Giới tính" span={1}>
                                    {customer.gender === 1 ? 'Nam' : 'Nữ'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày sinh" span={1}>
                                    {convertDateFullYear(customer.dateBirth)}
                                </Descriptions.Item>
                            </Descriptions>
                        </Col>


                    </Row>
                ) : (
                    <div className="text-center py-5">
                        <Avatar size={64} icon={<UserAddOutlined />} />
                        <h4 style={{ marginTop: '16px' }}>Khách lẻ</h4>
                        <p style={{ color: '#666' }}>Chọn khách hàng hoặc thêm mới khách hàng</p>
                    </div>
                )}
            </div>

            <Modal
                visible={isShowAddCustomer}
                footer={null}
                closable={true}
                maskClosable={false}
                onCancel={() => setIsShowAddCustomer(false)}
                width={"75%"}
            >
                <AddCustomer
                    isSalePage={true}
                    OnAddCustomerOk={OnAddCustomerOk}
                />
            </Modal>
        </Card>
    );
};

export default CustomerSelect;
