import React, { useEffect, useState } from 'react';
import {useNavigate, useParams} from "react-router-dom";
import axios from 'axios';
import { Spin, Button, Alert, Result } from 'antd'; // Import Ant Design components
import 'bootstrap/dist/css/bootstrap.min.css';
import { baseUrl } from "../../helpers/Helpers.js"; // Ensure Bootstrap is loaded

const ActiveAccount = () => {
    const { token } = useParams();
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const navigate =useNavigate();
    useEffect(() => {
        const activateAccount = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${baseUrl}/api/authentication/active?token=${token}`);
                setMessage(response.data);  // Thành công
                setError(false);
                setLoading(false);
            } catch (err) {
                setMessage('Token không hợp lệ hoặc đã hết hạn.');  // Thất bại
                setError(true);
                setLoading(false);
            }
        };

        if (token) {
            activateAccount();
        }
    }, [token]);

    const goToLogin = () => {
        navigate('/login');  // Điều hướng người dùng đến trang đăng nhập
    };

    return (
        <div className="container" style={{ maxWidth: '800px', marginTop: '50px' }}>
            <div className="card shadow-lg">
                <div className="card-body">
                    <h2 className="text-center mb-4">Kích hoạt tài khoản</h2>
                    {loading ? (
                        <div className="text-center">
                            <Spin size="large" tip="Đang kích hoạt tài khoản..." />
                        </div>
                    ) : (
                        <div>
                            {error ? (
                                <Alert
                                    message="Lỗi"
                                    description={message}
                                    type="error"
                                    showIcon
                                    className="mb-4"
                                />
                            ) : (
                                <Alert
                                    message="Thành công"
                                    description={message}
                                    type="success"
                                    showIcon
                                    className="mb-4"
                                />
                            )}
                            <div className="text-center">
                                <Button type="primary" onClick={goToLogin}>
                                    {error ? 'Đi đến trang đăng nhập' : 'Tiến hành đăng nhập'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActiveAccount;
