import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Card, Form, InputNumber, Typography, Spin, Descriptions } from 'antd';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import axiosInstance from "../utils/axiosInstance.js";
import {convertLongTimestampToDate} from "../helpers/Helpers.js"; // Cần cài: npm install dayjs

const { Title } = Typography;

const FreeShipSetting = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [freeshipData, setFreeshipData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axiosInstance.get('/api/admin/freeship-order');
            setFreeshipData(res.data);
            console.log(res)
            form.setFieldsValue({
                minOrderValue: res.data.minOrderValue,
            });
        } catch (error) {
            toast.error('Không thể tải dữ liệu freeship');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleFinish = async (values) => {
        setLoading(true);
        try {
            const res = await axiosInstance.post('/api/admin/freeship-order', values);
            toast.success('Cập nhật thành công!');
            setFreeshipData(prev => ({ ...prev, ...values }));
            setIsEditing(false);
        } catch (error) {
            toast.error('Cập nhật thất bại');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }}>
                <Spin />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }}>
            <Card title={<Title level={4}>Cài đặt Freeship</Title>} style={{ width: "100%" }}>

                <div className={"mb-4"}>
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Giá trị hóa đơn tối thiểu (VNĐ)">
                            {freeshipData?.minOrderValue?.toLocaleString() ?? 0} đ
                        </Descriptions.Item>
                        <Descriptions.Item label="Được tạo vào">
                            {convertLongTimestampToDate(freeshipData?.updatedAt)}
                        </Descriptions.Item>
                    </Descriptions>
                    <Button
                        type="primary"
                        style={{ marginTop: 16 }}
                        onClick={() => {
                            setIsEditing(!isEditing)
                        }}
                    >
                        Chỉnh sửa
                    </Button>
                </div>
                {!isEditing ? ( <div>

                    </div>
                ) : (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleFinish}
                    >
                        <Form.Item
                            label="Giá trị đơn hàng tối thiểu (VNĐ)"
                            name="minOrderValue"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập giá trị',
                                },
                                {
                                    type: 'number',
                                    min: 0,
                                    message: 'Giá trị phải lớn hơn hoặc bằng 0',
                                },
                            ]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                step={1000}
                                formatter={(value) =>
                                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                }
                                parser={(value) => value.replace(/,/g, '')}
                            />
                        </Form.Item>

                        <Form.Item>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                <Button onClick={() => setIsEditing(false)}>
                                    Hủy
                                </Button>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    Lưu thay đổi
                                </Button>
                            </div>
                        </Form.Item>
                    </Form>
                )}
            </Card>
        </div>
    );
};

export default FreeShipSetting;
