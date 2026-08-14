

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Form, Input, Select, DatePicker, Button, Upload, message, Row, Col, Card, Radio } from 'antd';
import { UploadOutlined, UserOutlined  } from '@ant-design/icons';
import moment from 'moment';
import { useParams, useNavigate } from 'react-router-dom';
import AddressSelectorAntd from "../admin/utils/AddressSelectorAntd.jsx";
import {toast} from "react-toastify";

const { Option } = Select;
const { Password } = Input;

const UpdateCustomer = () => {
    const [form] = Form.useForm();
    const { id } = useParams();
    const navigate = useNavigate();
    const [fileList, setFileList] = useState([]);
    const [cleanUpImage, setCleanUpImage] = useState([]);
    const cleanUpImageRef = useRef(cleanUpImage);
    const [address, setAddress] = useState({
        provinceId: null,
        districtId: null,
        wardId: null,
        specificAddress: null,
    });
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isAddressLoaded, setIsAddressLoaded] = useState(false);
    const [loading, setLoading] = useState(false);

    // Update ref when cleanUpImage changes
    useEffect(() => {
        cleanUpImageRef.current = cleanUpImage;
    }, [cleanUpImage]);

    // Delete images when component unmounts
    useEffect(() => {
        return () => {
            deleteImages(cleanUpImageRef.current);
        };
    }, []);

    useEffect(() => {
        fetchCustomer(id);
    }, [id]);

    // Function to delete images from Cloudinary
    const deleteImages = async (imageIds) => {
        if (!imageIds || imageIds.length === 0) return;

        try {
            await Promise.all(
                imageIds.map(id =>
                    axios.post('http://localhost:8080/cloudinary/delete', { public_id: id })
                )
            );
        } catch (error) {
            console.error('Lỗi xóa ảnh:', error);
        }
    };

    // Upload image to Cloudinary
    const cloudinaryUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'uploaddatn');

        try {
            const res = await axios.post(
                'https://api.cloudinary.com/v1_1/dieyhvcou/image/upload',
                formData
            );
            setCleanUpImage(prev => [...prev, res.data.public_id]);
            return {
                url: res.data.secure_url,
                public_id: res.data.public_id
            };
        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
        }
    };

    // Handle avatar change
    const handleAvatarChange = async ({ fileList: newFileList }) => {
        if (newFileList.length > 0 && newFileList[0].originFileObj) {
            try {
                const { url, public_id } = await cloudinaryUpload(newFileList[0].originFileObj);
                setFileList([{
                    uid: public_id,
                    name: public_id,
                    status: 'done',
                    url: url,
                }]);
            } catch (error) {
                toast.error('Upload ảnh thất bại!');
            }
        } else {
            setFileList(newFileList);
        }
    };

    // Handle image removal
    const handleRemove = async (file) => {
        try {
            await axios.post('http://localhost:8080/cloudinary/delete', {
                public_id: file.uid
            });
            setCleanUpImage(prev => prev.filter(id => id !== file.uid));
        } catch (error) {
            console.error('Lỗi xóa ảnh:', error);
        }
    };

    // Image validation before upload
    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            toast.error('You can only upload JPG/PNG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            toast.error('Image must smaller than 2MB!');
        }
        return isJpgOrPng && isLt2M;
    };
    
    const fetchCustomer = async (id) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/admin/customers/detail/${id}`);
            const customer = response.data;
            setSelectedRecord(customer);

            // Find default address
            const defaultAddress = customer.addresses?.find(addr => addr.isAddressDefault);
            
            if (defaultAddress) {
                // Convert IDs to strings if they're numbers
                const addressData = {
                    provinceId: String(defaultAddress.provinceId),
                    districtId: String(defaultAddress.districtId),
                    wardId: String(defaultAddress.wardId),
                    specificAddress: defaultAddress.specificAddress || ''
                };
                
                setAddress(addressData);
                setIsAddressLoaded(true);
            }

            // Set other form values
            form.setFieldsValue({
                fullName: customer.fullName,
                CitizenId: customer.citizenId,
                phoneNumber: customer.phoneNumber,
                email: customer.email,
                gender: customer.gender,
                dateBirth: customer.dateBirth ? moment(customer.dateBirth) : null,
                status: customer.status,
                password: customer.password,
            });

            // Handle avatar
            if (customer.avatar) {
                setFileList([{
                    uid: customer.avatarPublicId || '-1',
                    name: 'avatar',
                    status: 'done',
                    url: customer.avatar,
                }]);
            }
        } catch (error) {
            console.error('Error fetching customer:', error);
            toast.error('Không thể tải thông tin khách hàng');
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            
            // Removed address validation check as requested

            // Handle avatar using Cloudinary
            let avatarUrl = selectedRecord?.avatar || '';
            let avatarPublicId = selectedRecord?.avatarPublicId || '';

            // If new image uploaded
            if (fileList.length > 0 && fileList[0].url) {
                avatarUrl = fileList[0].url;
                avatarPublicId = fileList[0].uid;
            }

            // Prepare customer data
            const customerData = {
                fullName: values.fullName,
                citizenId: values.CitizenId,
                phoneNumber: values.phoneNumber,
                email: values.email,
                gender: values.gender,
                dateBirth: values.dateBirth && typeof values.dateBirth.format === 'function'
                    ? values.dateBirth.format('YYYY-MM-DDTHH:mm:ss')
                    : null,
                status: values.status,
                avatar: avatarUrl,
                avatarPublicId: avatarPublicId,
                password: values.password,
            };

            // Update customer info
            await axios.put(`http://localhost:8080/api/admin/customers/update/${id}`, customerData);

            // Handle address update - still updating address but without validation check
            const defaultAddress = selectedRecord.addresses?.find(addr => addr.isAddressDefault);
            const addressData = {
                provinceId: address.provinceId,
                districtId: address.districtId,
                wardId: address.wardId,
                specificAddress: address.specificAddress,
                isAddressDefault: true
            };

            if (defaultAddress) {
                await axios.put(`http://localhost:8080/api/admin/customers/update-address/${defaultAddress.id}`, addressData);
            } else {
                await axios.post(`http://localhost:8080/api/admin/customers/add-address/${id}`, addressData);
            }

            toast.success('Cập nhật khách hàng thành công!');
            navigate("/admin/customer");
        } catch (error) {
            console.error('Error updating customer:', error);
            toast.error('Cập nhật khách hàng thất bại!');
        }
    };

    const handleAddressChange = (provinceId, districtId, wardId, specificAddress) => {
        setAddress({
            provinceId: provinceId,
            districtId: districtId,
            wardId: wardId,
            specificAddress: specificAddress
        });
    };

    // Function to disable future dates in DatePicker
    const disableFutureDates = (current) => {
        return current && current > moment().endOf('day');
    };

    const uploadButton = (
        <div className="ant-upload-btn">
            <div style={{
                width: '190px',
                height: '190px',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#fafafa',
                border: '1px dashed #d9d9d9'
            }}>
                {fileList.length === 0 ? (
                    <div style={{ textAlign: 'center' }}>
                        <UserOutlined style={{ fontSize: '32px', color: '#bfbfbf' }} />
                        <div style={{ marginTop: '8px', color: '#8c8c8c' }}>+ Upload</div>
                    </div>
                ) : null}
            </div>
        </div>
    );

    const customRequest = async ({ file, onSuccess, onError }) => {
        try {
            const result = await cloudinaryUpload(file);
            onSuccess(result, file);
        } catch (error) {
            console.error("Custom request error:", error);
            onError(error);
        }
    };

    // Validation patterns
    const phonePattern = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    const citizenIdPattern = /^[0-9]{9}$|^[0-9]{12}$/;

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ color: '#1890ff', marginBottom: '20px' }}>Chỉnh sửa khách hàng</h2>

            <Row gutter={16}>
                <Col span={6}>
                    <Card>
                        <Form.Item style={{ textAlign: 'center' }}>
                            <Upload
                                customRequest={customRequest}
                                fileList={fileList}
                                onChange={handleAvatarChange}
                                onRemove={handleRemove}
                                beforeUpload={beforeUpload}
                                maxCount={1}
                                showUploadList={false}
                                style={{ display: 'flex', justifyContent: 'center' }}
                            >
                                {fileList.length > 0 ? (
                                    <div style={{
                                        width: '190px',
                                        height: '190px',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        margin: '0 auto',
                                        cursor: 'pointer',
                                        border: '1px solid #d9d9d9'
                                    }}>
                                        <img
                                            src={fileList[0]?.response?.url || fileList[0]?.url}
                                            alt="Avatar"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </div>
                                ) : uploadButton}
                            </Upload>
                        </Form.Item>
                    </Card>
                </Col>

                <Col span={18}>
                    <Card>
                        <Form form={form} layout="vertical">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="fullName"
                                        label="Tên khách hàng"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập tên khách hàng!' },
                                            { min: 2, message: 'Tên phải có ít nhất 2 ký tự!' },
                                            { max: 50, message: 'Tên không được vượt quá 50 ký tự!' },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="dateBirth"
                                        label="Ngày sinh"
                                        rules={[
                                            () => ({
                                                validator(_, value) {
                                                    if (!value || value <= moment()) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('Ngày sinh không thể là ngày trong tương lai!'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <DatePicker 
                                            format="DD/MM/YYYY" 
                                            style={{ width: '100%' }} 
                                            disabledDate={disableFutureDates}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="CitizenId"
                                        label="Căn cước công dân"
                                        rules={[
                                            { pattern: citizenIdPattern, message: 'CCCD phải có 9 hoặc 12 số!' }
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="gender"
                                        label="Giới tính"
                                    >
                                        <Radio.Group>
                                            <Radio value={true}>Nam</Radio>
                                            <Radio value={false}>Nữ</Radio>
                                        </Radio.Group>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="email"
                                        label="Email"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập email!' }, 
                                            { type: 'email', message: 'Email không hợp lệ!' },
                                            { max: 100, message: 'Email không được vượt quá 100 ký tự!' }
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="phoneNumber"
                                        label="Số điện thoại"
                                        rules={[
                                            { pattern: phonePattern, message: 'Số điện thoại không hợp lệ! (Phải bắt đầu bằng 0 hoặc +84, tiếp theo là 3,5,7,8,9 và 8 số tiếp theo)' }
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                            </Row>

                            {isAddressLoaded && (
                                <Form.Item 
                                    label="Địa chỉ"
                                >
                                    <AddressSelectorAntd
                                        provinceId={parseInt(address.provinceId)}
                                        districtId={parseInt(address.districtId)}
                                        wardId={parseInt(address.wardId)}
                                        specificAddressDefault={address.specificAddress}
                                        onAddressChange={handleAddressChange}
                                    />
                                </Form.Item>
                            )}

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="status"
                                        label="Trạng thái"
                                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                                    >
                                        <Select>
                                            <Option value={0}>Hoạt Động</Option>
                                            <Option value={1}>Ngưng hoạt động</Option>
                                            <Option value={2}>Chưa kích hoạt</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item>
                                <Button type="primary" onClick={handleOk} style={{ marginRight: '10px' }}>
                                    Lưu
                                </Button>
                                <Button onClick={() => navigate('/admin/customer')}>Hủy</Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default UpdateCustomer;