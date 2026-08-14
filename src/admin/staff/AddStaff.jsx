import React, { useState, useEffect, useRef } from 'react';
import {Form, Input, Button, Radio, DatePicker, Upload, message, Row, Col, Card, Spin, Modal, Select} from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { BrowserMultiFormatReader } from '@zxing/library';
import {toast} from "react-toastify";

const AddStaff = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState(null);
    const [phoneError, setPhoneError] = useState(null);
    const [cleanUpImage, setCleanUpImage] = useState([]);
    const cleanUpImageRef = useRef(cleanUpImage);
    // State cho modal quét mã QR
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const videoRef = useRef(null);
    const codeReader = new BrowserMultiFormatReader();

    useEffect(() => {
        cleanUpImageRef.current = cleanUpImage;

        if (qrModalVisible && videoRef.current) {
            codeReader.getVideoInputDevices()
                .then(videoInputDevices => {
                    if (videoInputDevices.length > 0) {
                        codeReader.decodeFromInputVideoDevice(videoInputDevices[0].deviceId, videoRef.current)
                            .then(result => {
                                handleScanSuccess(result);
                            })
                            .catch(err => {
                                console.error('QR Scan Error:', err);
                                toast.error('Quét mã QR thất bại!');
                            });
                    } else {
                        toast.error('Không tìm thấy thiết bị quét mã QR!');
                    }
                })
                .catch(err => {
                    console.error('QR Scan Error:', err);
                    toast.error('Quét mã QR thất bại!');
                });
        }

        return () => {
            codeReader.reset();
        };
    }, [cleanUpImage, qrModalVisible]);


    const cloudinaryUpload = async (file) => {
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "uploaddatn"); // Sử dụng preset của bạn

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/dieyhvcou/image/upload`,
                { method: "POST", body: formData }
            );

            if (!res.ok) {
                throw new Error(`Cloudinary upload failed with status: ${res.status}`);
            }

            const data = await res.json();
            setCleanUpImage((prev) => [...prev, data.public_id]);

            return {
                url: data.secure_url,
                public_id: data.public_id,
            };
        } catch (error) {
            console.error("Error uploading to Cloudinary:", error);
            toast.error("Lỗi khi tải ảnh lên Cloudinary!");
            throw error;
        }
    };


    //Hàm Xóa Ảnh Từ Cloudinary
    const deleteImages = async (publicIds) => {
        if (!publicIds || publicIds.length === 0) return;

        try {
            const deleteRequests = publicIds.map((id) =>
                fetch("http://localhost:8080/cloudinary/delete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ public_id: id }),
                })
            );
            await Promise.all(deleteRequests);
        } catch (error) {
            console.error("Lỗi khi xóa ảnh hàng loạt:", error);
        }
    };

    // Xóa ảnh khi component unmount
    useEffect(() => {
        return () => {
            deleteImages(cleanUpImageRef.current);
        };
    }, []);

    // Hàm xử lý kết quả khi quét thành công
    const handleScanSuccess = (result) => {
        if (result?.text) {
            // Giả sử dữ liệu quét trả về là CCCD gồm 12 chữ số
            const numericValue = result.text.replace(/\D/g, '').slice(0, 12);
            if (numericValue.length === 12) {
                form.setFieldsValue({ citizenId: numericValue });
                toast.success(`Quét thành công: ${numericValue}`);
            } else {
                toast.error('Dữ liệu quét không hợp lệ! Chỉ nhận số CCCD hợp lệ gồm 12 chữ số.');
            }
            setQrModalVisible(false);
        } else {
            toast.error('Không tìm thấy dữ liệu CCCD từ mã QR!');
        }
    };

    //Custom Request và Xử Lý Upload
    const handleAvatarChange = ({ fileList }) => {
        setFileList(fileList);
    };

    const customRequest = async ({ file, onSuccess, onError }) => {
        try {
            const result = await cloudinaryUpload(file);
            onSuccess(result, file);
        } catch (error) {
            console.error("Custom request error:", error);
            onError(error);
        }
    };

    const handleRemove = async (file) => {
        if (file.response?.public_id) {
            try {
                await fetch("http://localhost:8080/cloudinary/delete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ public_id: file.response.public_id }),
                });
                setCleanUpImage((prev) =>
                    prev.filter(id => id !== file.response.public_id)
                );
            } catch (error) {
                console.error("Lỗi khi xóa ảnh:", error);
            }
        }
    };

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            toast.error('Chỉ được tải lên file JPG/PNG!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            toast.error('Ảnh phải nhỏ hơn 2MB!');
        }
        return isJpgOrPng && isLt2M;
    };

    const checkPhoneNumberAvailability = async (phoneNumber) => {
        if (!phoneNumber || !phoneNumber.trim()) {
            form.setFields([{ name: 'phoneNumber', errors: ['Vui lòng nhập số điện thoại!'] }]);
            return Promise.reject();
        }

        const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
        if (!phoneRegex.test(phoneNumber)) {
            form.setFields([{ name: 'phoneNumber', errors: ['Số điện thoại không hợp lệ!'] }]);
            return Promise.reject();
        }
    };


    // Hàm validate CCCD
    const validateCitizenId = (_, value) => {
        const citizenIdRegex = /^([0-9]{12})$/;

        if (!citizenIdRegex.test(value)) {
            return Promise.reject('CCCD không hợp lệ! Phải có 12 chữ số.');
        }
        return Promise.resolve();
    };

    // Hàm disable chọn ngày dưới 18 tuổi
    const disableUnder18 = (current) => {
        return current && current > moment().subtract(18, "years").endOf("day");
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
    const generateRandomPassword = () => {
        const length = 8;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let password = "";
        for (let i = 0, n = charset.length; i < length; ++i) {
            password += charset.charAt(Math.floor(Math.random() * n));
        }
        return password;
    };

    const checkEmailAvailability = async (email) => {
        if (!email || !email.trim()) {
            form.setFields([{ name: 'email', errors: ['Vui lòng nhập email!'] }]);
            return Promise.reject();
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            form.setFields([{ name: 'email', errors: ['Email không hợp lệ!'] }]);
            return Promise.reject();
        }

    };

    const handleFinish = async (values) => {
        setLoading(true);

        try {
            // Lấy avatarUrl từ Cloudinary (đã được upload trước đó)
            let avatarUrl = '';

            if (fileList.length > 0 && fileList[0].response && fileList[0].response.url) {
                // Lấy URL từ response của Cloudinary
                avatarUrl = fileList[0].response.url;
            }

            const newPassword = generateRandomPassword();

            const newData = {
                ...values,
                gender: values.gender ? true : false, // Đảm bảo boolean
                dateBirth: values.dateBirth.format('YYYY-MM-DDTHH:mm:ss'),
                status: 0, // Mặc định là kích hoạt khi thêm mới
                avatar: avatarUrl,
                password: newPassword,
            };

            await axios.post('http://localhost:8080/api/admin/staff/add', newData);
            toast.success("Thêm nhân viên thành công! Mật khẩu tạm thời đã được gửi đến email của nhân viên.");
            form.resetFields();
            setFileList([]);
            setTimeout(() => {
                setLoading(false);
                navigate("/admin/staff");
            }, 2000);
        } catch (error) {
            setLoading(false);
            console.error('Lỗi thêm nhân viên:', error);

            if (error.response && error.response.status === 409) {
                setEmailError('Email này đã được sử dụng.');
                form.setFields([{ name: 'email', errors: ['Email này đã được sử dụng.'] }]);
            } else {
                toast.error('Thêm nhân viên thất bại! ' + (error.response?.data?.message || error.message));
            }
        }
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

    return (
        <Spin spinning={loading} tip="Đang xử lý...">
            <div style={{ padding: '20px' }}>
                <h2 style={{ marginBottom: '20px' }}>Thêm mới nhân viên</h2>
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
                                        <Form.Item
                                            name="fullName"
                                            label="Họ và tên"
                                            rules={[
                                                { required: true, message: 'Vui lòng nhập họ và tên!' },
                                                { min: 3, message: 'Họ và tên phải có ít nhất 3 ký tự!' },
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
                                            rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
                                        >
                                            <DatePicker
                                                format="DD/MM/YYYY"
                                                style={{ width: "100%" }}
                                                disabledDate={disableUnder18}
                                            />
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
                                        <Form.Item
                                            name="citizenId"
                                            label="CCCD"
                                            rules={[
                                                { required: true, message: 'Vui lòng nhập căn cước công dân!' },
                                                { validator: validateCitizenId }
                                            ]}
                                        >
                                            <Input placeholder="Nhập hoặc quét mã QR" />
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
                                        <Form.Item
                                            name="email"
                                            label="Email"
                                            rules={[
                                                { required: true, message: 'Vui lòng nhập email!' },
                                                { max: 100, message: 'Email không được vượt quá 100 ký tự!' },
                                                { type: 'email', message: 'Email không hợp lệ!' },
                                                () => ({
                                                    validator(_, value) {
                                                        return checkEmailAvailability(value);
                                                    },
                                                }),
                                            ]}
                                        >
                                            <Input
                                                onBlur={(e) => checkEmailAvailability(e.target.value)}
                                                onChange={() => emailError && setEmailError(null)} // Reset error when user types
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="phoneNumber"
                                            label="Số điện thoại"
                                            rules={[
                                                { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                                () => ({
                                                    validator(_, value) {
                                                        return checkPhoneNumberAvailability(value);
                                                    },
                                                }),
                                            ]}

                                        >
                                            <Input
                                                onBlur={(e) => checkPhoneNumberAvailability(e.target.value)}
                                                onChange={() => phoneError && setPhoneError(null)} // Reset error when user types
                                            />
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
                                    <Button type="primary" htmlType="submit" style={{ marginRight: '10px' }} disabled={!!emailError || !!phoneError}>
                                        Thêm mới
                                    </Button>
                                    <Button onClick={() => navigate('/admin/staff')}>Hủy</Button>
                                    <Button type="dashed" onClick={() => setQrModalVisible(true)}>
                                        Quét QR
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </Col>
                </Row>
                <Modal
                    title="Quét mã QR CCCD"
                    open={qrModalVisible} // Changed from 'visible' to 'open' for newer Antd versions
                    onCancel={() => setQrModalVisible(false)}
                    footer={null}
                >
                    <div>
                        <video
                            ref={videoRef}
                            id="video"
                            width="100%"
                            style={{ display: 'block', margin: '0 auto' }}
                        ></video>
                    </div>
                </Modal>
            </div>
        </Spin>
    );
};

export default AddStaff;










