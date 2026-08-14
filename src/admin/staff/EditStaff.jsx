import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Input, Select, DatePicker, Button, Upload, message, Row, Col, Card, Radio } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import {toast} from "react-toastify";

const { Option } = Select;
const { Password } = Input;

const EditStaff = () => {
    const [form] = Form.useForm();
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [staff, setStaff] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [cleanUpImage, setCleanUpImage] = useState([]);
    const cleanUpImageRef = useRef(cleanUpImage);

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
                message.error('Upload ảnh thất bại!');
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

    useEffect(() => {
        const staffId = location.pathname.split('/').pop();
        axios.get(`http://localhost:8080/api/admin/staff/detail/${staffId}`)
            .then((response) => {
                const staffData = response.data;
                setStaff(staffData);
                form.setFieldsValue({
                    ...staffData,
                    dateBirth: moment(staffData.dateBirth, 'YYYY-MM-DDTHH:mm:ss'),
                });

                if (staffData.avatar) {
                    setFileList([{
                        uid: staffData.avatarPublicId || '-1',
                        name: 'avatar',
                        status: 'done',
                        url: staffData.avatar,
                    }]);
                }

                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching staff details:', error);
                toast.error('Lỗi tải dữ liệu nhân viên!');
                setLoading(false);
            });
    }, [location.pathname, form]);

    const handleFinish = async (values) => {
        let avatarUrl = staff.avatar;
        let avatarPublicId = staff.avatarPublicId;

        // If new image uploaded
        if (fileList.length > 0 && fileList[0].url) {
            avatarUrl = fileList[0].url;
            avatarPublicId = fileList[0].uid;
        }

        const updatedData = {
            ...values,
            dateBirth: values.dateBirth.format('YYYY-MM-DDTHH:mm:ss'),
            avatar: avatarUrl,
            avatarPublicId: avatarPublicId
        };

        try {
            await axios.put(`http://localhost:8080/api/admin/staff/update/${staff.id}`, updatedData);
            toast.success('Cập nhật nhân viên thành công!');
            navigate('/admin/staff');
        } catch (error) {
            console.error('Error updating staff:', error);
            toast.error('Cập nhật nhân viên thất bại!');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }


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

    const validateDateOfBirth = (_, value) => {
        if (!value) {
            return Promise.reject("Vui lòng chọn ngày sinh!");
        }
        if (value.isAfter(moment())) {
            return Promise.reject("Ngày sinh không hợp lệ!");
        }
        if (value.isAfter(moment().subtract(18, "years"))) {
            return Promise.reject("Bạn chưa đủ 18 tuổi!");
        }
        return Promise.resolve();
    };
    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ marginBottom: '20px' }}>Chỉnh sửa nhân viên</h2>

            <Row gutter={16}>
                <Col span={6}>
                    <Card>
                        <Form.Item label="Ảnh đại diện" style={{ textAlign: 'center' }}>
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
                        <Form form={form} layout="vertical" onFinish={handleFinish}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    {/* <Form.Item
                                        name="fullName"
                                        label="Họ và tên"
                                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                                    >
                                        <Input />
                                    </Form.Item> */}
                                    <Form.Item
                                        name="fullName"
                                        label="Họ và tên"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập họ và tên!' },
                                            { pattern: /^[^\d!@#$%^&*()_+={}[\]:;"'<>,.?/\\|`~]+$/, message: 'Tên không được chứa số hoặc ký tự đặc biệt!' },
                                            { min: 2, message: 'Tên quá ngắn!' },
                                            { max: 50, message: 'Họ và tên không được vượt quá 50 ký tự!' },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    {/* <Form.Item
                                        name="dateBirth"
                                        label="Ngày sinh"
                                        rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
                                    >
                                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                                    </Form.Item> */}
                                    <Form.Item
                                        name="dateBirth"
                                        label="Ngày sinh"
                                        rules={[{ validator: validateDateOfBirth }]}
                                    >
                                        <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    {/* <Form.Item
                                        name="citizenId"
                                        label="CCCD"
                                        rules={[{ required: true, message: 'Vui lòng nhập CCCD!' }]}
                                    >
                                        <Input />
                                    </Form.Item> */}
                                    <Form.Item
                                        name="citizenId"
                                        label="CCCD"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập CCCD!' },
                                            { pattern: /^[0-9]{12}$/, message: 'CCCD phải có đúng 12 số!' }
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="gender"
                                        label="Giới tính"
                                        rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
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
                                    {/* <Form.Item
                                        name="email"
                                        label="Email"
                                        rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}
                                    >
                                        <Input />
                                    </Form.Item> */}
                                    <Form.Item
                                        name="email"
                                        label="Email"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập email!' },
                                            { type: 'email', message: 'Email không hợp lệ!' },
                                            { max: 100, message: 'Email không được vượt quá 100 ký tự!' },
                                            { pattern: /^\S+@\S+\.\S+$/, message: 'Email không được chứa khoảng trắng!' }
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    {/* <Form.Item
                                        name="phoneNumber"
                                        label="Số điện thoại"
                                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                                    >
                                        <Input />
                                    </Form.Item> */}
                                    <Form.Item
                                        name="phoneNumber"
                                        label="Số điện thoại"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                            { pattern: /^(0[3|5|7|8|9])+([0-9]{8})$/, message: 'Số điện thoại không hợp lệ!' }
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="status"
                                        label="Trạng thái"
                                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                                    >
                                        <Select>
                                            <Option value={0}>Hoạt động</Option>
                                            <Option value={1}>Ngừng hoạt động</Option>
                                            <Option value={2}>Chờ kích hoạt</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="roleName"
                                        label="Vai trò"
                                        rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                                    >
                                        <Select placeholder="Chọn vai trò">
                                            <Select.Option value="ROLE_MANAGER">Quản lý</Select.Option>
                                            <Select.Option value="ROLE_STAFF">Nhân viên</Select.Option>
                                            {/*<Select.Option value="ROLE_STAFF_SALE">Nhân viên bán hàng</Select.Option>*/}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" style={{ marginRight: '10px' }}>
                                    Lưu
                                </Button>
                                <Button onClick={() => navigate('/admin/staff')}>Hủy</Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default EditStaff;






