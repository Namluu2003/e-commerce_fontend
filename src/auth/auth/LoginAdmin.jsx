import React, {useState} from "react";
import {motion} from "framer-motion";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import {Modal, Form, Input, message} from "antd";
import styles from "./LoginAdmin.module.css";
import {toast} from "react-toastify";

const LoginAdmin = () => {
    const [formData, setFormData] = useState({email: "", password: ""});
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetLoading, setResetLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");

        try {
            const response = await axios.post(
                "http://localhost:8080/api/authentication/login-admin",
                {
                    email: formData.email.trim(),
                    password: formData.password.trim(),
                }
            );
            if (response.status === 200) {
                const data = response.data;
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                navigate("/admin");
            } else {
                setErrorMessage("Invalid login credentials. Please try again.");
            }
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPasswordClick = () => {
        setIsModalVisible(true);
    };

    const handleResetPassword = async () => {
        if (!resetEmail.trim()) {
            message.warning("Vui lòng nhập email.");
            return;
        }

        setResetLoading(true);
        try {
            const response =
                await axios.post(`http://localhost:8080/api/authentication/forgot-admin-password/${resetEmail.trim()}`);
            toast.success("Đã gửi email đặt lại mật khẩu!");
            setIsModalVisible(false);
            setResetEmail("");
        } catch (error) {
            toast.error(error.response?.data?.message || "Gửi email thất bại.");
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <motion.div
                initial={{opacity: 0, y: -30}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.6, ease: "easeOut"}}
                className={styles.formCard}
            >
                <img src="/img/thehands.png" alt="The Hands Logo" className={styles.logo}/>
                <h2 className={styles.title}>Quản trị viên</h2>

                {errorMessage && (
                    <div className={styles.errorMessage} role="alert">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>
                            Tên đăng nhập
                        </label>
                        <input
                            id="email"
                            type="text"
                            name="email"
                            className={styles.input}
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={loading}
                            autoComplete="username"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>
                            Mật khẩu
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            className={styles.input}
                            value={formData.password}
                            onChange={handleInputChange}
                            disabled={loading}
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className={styles.spinner} role="status" aria-hidden="true"></span>
                        ) : (
                            "Đăng nhập"
                        )}
                    </button>
                </form>

                <span
                    onClick={handleForgotPasswordClick}
                    className={styles.forgotPassword}
                    style={{cursor: "pointer"}}
                >
          Quên mật khẩu?
        </span>
            </motion.div>

            <Modal
                title="Đặt lại mật khẩu"
                open={isModalVisible}
                onOk={handleResetPassword}
                confirmLoading={resetLoading}
                onCancel={() => setIsModalVisible(false)}
                okText="Gửi mail"
                cancelText="Hủy"
            >
                <Form layout="vertical">
                    <Form.Item
                        label="Email"
                        required
                        rules={[{required: true, message: "Vui lòng nhập email!"}]}
                    >
                        <Input
                            type="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            placeholder="Nhập email của bạn"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default LoginAdmin;
