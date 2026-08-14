import React, {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import {Form, Input, Select, DatePicker, Button, Upload, message, Row, Col, Card, Radio, Modal, Spin} from 'antd';
import {UploadOutlined, UserOutlined} from '@ant-design/icons';
import moment from 'moment';
import AddressSelectorAntd from "../admin/utils/AddressSelectorAntd.jsx";
import {useNavigate} from "react-router";
import {BrowserMultiFormatReader} from "@zxing/library";
import {toast} from "react-toastify";

const {Option} = Select;

const AddCustomer = ({
                         isSalePage = false,
                         OnAddCustomerOk
                     }) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const navigate = useNavigate();
    const [address, setAddress] = useState({
        provinceId: null,
        districtId: null,
        wardId: null,
        specificAddress: null,
    });
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState(null);
    const [phoneError, setPhoneError] = useState(null);
    const [cleanUpImage, setCleanUpImage] = useState([]);
    const cleanUpImageRef = useRef(cleanUpImage);
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
    useEffect(() => {
        return () => {
            deleteImages(cleanUpImageRef.current);
        };
    }, []);
    const cloudinaryUpload = async (file) => {
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "uploaddatn"); // Use your preset

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/dieyhvcou/image/upload`,
                {method: "POST", body: formData}
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

    // Delete Images from Cloudinary
    const deleteImages = async (publicIds) => {
        if (!publicIds || publicIds.length === 0) return;

        try {
            const deleteRequests = publicIds.map((id) =>
                fetch("http://localhost:8080/cloudinary/delete", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({public_id: id}),
                })
            );
            await Promise.all(deleteRequests);
        } catch (error) {
            console.error("Lỗi khi xóa ảnh hàng loạt:", error);
        }
    };

    // Custom Request and Upload Handling
    const handleAvatarChange = ({fileList}) => {
        setFileList(fileList);
    };

    const customRequest = async ({file, onSuccess, onError}) => {
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
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({public_id: file.response.public_id}),
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

    const disableFutureDates = (current) => {
        return current && current > moment().endOf("day");
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

    const handleScanSuccess = (result) => {
        if (result?.text) {
            const numericValue = result.text.replace(/\D/g, '').slice(0, 12);

            if (numericValue.length === 12) {
                form.setFieldsValue({CitizenId: numericValue});
                toast.success(`Quét thành công: ${numericValue}`);
            } else {
                toast.error('Dữ liệu quét không hợp lệ! Chỉ nhận số CCCD hợp lệ gồm 12 chữ số.');
            }

            setQrModalVisible(false);
        } else {
            toast.error('Không tìm thấy dữ liệu CCCD từ mã QR!');
        }
    };

    const checkEmail = async (rule, value) => {
        if (!value || !value.trim()) {
            setEmailError(null);
            return false;
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            toast.error('Email không hợp lệ!');
            return false;
        }

        try {
            const response = await axios.get(`http://localhost:8080/api/admin/customers/check-email?email=${encodeURIComponent(value)}`);
            if (response.data && response.data.exists) {
                toast.error('Email này đã được sử dụng!');
                return false;
            } else {
                return true;
            }
        } catch (error) {
            console.log(error)
        }
    };

    const checkPhoneNumberAvailability = async (phoneNumber) => {

        // Basic phone format validation before API call
        const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
        if (!phoneRegex.test(phoneNumber)) {
            toast.error('Số điện thoại không hợp lệ!');
            return false;
        }

        try {
            const response = await axios.get(`http://localhost:8080/api/admin/customers/check-phone?phoneNumber=${encodeURIComponent(phoneNumber)}`);
            if (response.data && response.data.exists) {
                toast.error('Số điện thoại này đã được sử dụng.');
                return false;
            } else {
                setPhoneError(null);
                return true
            }
        } catch (error) {
            return false
        }
    };

    const handleFinish = async (values) => {
        setLoading(true);

        try {
            // Get avatarUrl from Cloudinary
            let avatarUrl = '';

            if (fileList.length > 0 && fileList[0].response && fileList[0].response.url) {
                // Get URL from Cloudinary response
                avatarUrl = fileList[0].response.url;
            }

            const newPassword = generateRandomPassword();

            const newData = {
                fullName: values.fullName,
                citizenId: values.CitizenId,
                phoneNumber: values.phoneNumber,
                email: values.email,
                gender: values.gender === "true" ? true : false, // Ensure boolean
                dateBirth: values.dateBirth ? values.dateBirth.format('YYYY-MM-DDTHH:mm:ss') : null,
                status: 1, // Default to active when adding
                avatar: avatarUrl,
                password: newPassword,
                provinceId: address.provinceId,
                districtId: address.districtId,
                wardId: address.wardId,
                specificAddress: address.specificAddress,
            };

            await axios.post('http://localhost:8080/api/admin/customers/add', newData);
            toast.success("Thêm khách hàng thành công! Mật khẩu tạm thời đã được gửi đến email của khách hàng.");
            form.resetFields();
            setFileList([]);

            if (isSalePage) {
                OnAddCustomerOk()
            } else {
                setTimeout(() => {
                    setLoading(false);
                    navigate("/admin/customer");
                }, 1000);
            }
        } catch (error) {
            setLoading(false);
            console.error('Lỗi thêm khách hàng:', error);

            if (error.response && error.response.status === 409) {
                form.setFields([{name: 'email', errors: ['Email này đã được sử dụng.']}]);
            } else {
                toast.error('Thêm khách hàng thất bại! ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleAddressChange = (provinceId, districtId, wardId, specificAddress) => {
        setAddress({
            ...address,
            districtId: districtId,
            provinceId: provinceId,
            wardId: wardId,
            specificAddress: specificAddress
        });
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
                    <div style={{textAlign: 'center'}}>
                        <UserOutlined style={{fontSize: '32px', color: '#bfbfbf'}}/>
                        <div style={{marginTop: '8px', color: '#8c8c8c'}}>+ Upload</div>
                    </div>
                ) : null}
            </div>
        </div>
    );

    return (
        <Spin spinning={loading} tip="Đang xử lý...">
            <div style={{padding: '20px'}}>
                <h2 style={{marginBottom: '20px'}}>Thêm mới khách hàng</h2>
                <Row gutter={16}>
                    <Col span={6}>
                        <Card>
                            <Form.Item label="Ảnh đại diện" style={{textAlign: 'center'}}>
                                <Upload
                                    customRequest={customRequest}
                                    fileList={fileList}
                                    onChange={handleAvatarChange}
                                    onRemove={handleRemove}
                                    beforeUpload={beforeUpload}
                                    maxCount={1}
                                    showUploadList={false}
                                    style={{display: 'flex', justifyContent: 'center'}}
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
                                            label="Tên khách hàng"
                                            rules={[{required: true, message: 'Vui lòng nhập tên khách hàng!'},
                                                { min: 3, message: 'Họ và tên phải có ít nhất 3 ký tự!' },
                                                { max: 50, message: 'Họ và tên không được vượt quá 50 ký tự!' }
                                            ]}

                                        >
                                            <Input/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="dateBirth"
                                            label="Ngày sinh"
                                            rules={[

                                                {
                                                    validator: (_, value) => {
                                                        if (value && value > moment().endOf("day")) {
                                                            return Promise.reject("Ngày sinh không thể là ngày trong tương lai!");
                                                        }
                                                        return Promise.resolve();
                                                    }
                                                }
                                            ]}
                                        >
                                            <DatePicker
                                                format="DD/MM/YYYY"
                                                style={{width: "100%"}}
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
                                        >
                                            <Input placeholder="Nhập hoặc quét mã QR"/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="gender"
                                            label="Giới tính"
                                        >
                                            <Radio.Group>
                                                <Radio value="true">Nam</Radio>
                                                <Radio value="false">Nữ</Radio>
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
                                                {required: true, message: 'Vui lòng nhập email!'},
                                                {type: 'email', message: 'Email không hợp lệ!'},
                                                { max: 100, message: 'Email không được vượt quá 100 ký tự!' },
                                            ]}

                                        >
                                            <Input
                                                onBlur={(e) => checkEmail(null, e.target.value)}
                                                onChange={() => emailError && setEmailError(null)} // Reset error when user types
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="phoneNumber"
                                            label="Số điện thoại"
                                            rules={[
                                                {
                                                    pattern: /^0\d{9}$/,
                                                    message: 'Số điện thoại không hợp lệ! (Phải bắt đầu bằng 0 và đủ 10 số)',
                                                },
                                            ]}
                                        >
                                            <Input
                                                onChange={() => phoneError && setPhoneError(null)} // Reset error when user types
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item label="Địa chỉ">
                                    <AddressSelectorAntd
                                        provinceId={address.provinceId}
                                        districtId={address.districtId}
                                        wardId={address.wardId}
                                        specificAddressDefault={address.specificAddress}
                                        onAddressChange={handleAddressChange}
                                    />
                                </Form.Item>

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        style={{marginRight: '10px'}}
                                        disabled={!!emailError || !!phoneError}
                                    >
                                        Thêm mới
                                    </Button>
                                    {
                                        !isSalePage && <Button
                                            onClick={() => navigate('/admin/customer')}
                                            style={{marginRight: '10px'}}
                                        >
                                            Hủy
                                        </Button>
                                    }
                                    <Button
                                        type="dashed"
                                        onClick={() => setQrModalVisible(true)}
                                    >
                                        Quét QR
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </Col>
                </Row>

                {/* Modal Quét mã QR */}
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
                            style={{display: 'block', margin: '0 auto'}}
                        ></video>
                    </div>
                </Modal>
            </div>
        </Spin>
    );
};

export default AddCustomer;








