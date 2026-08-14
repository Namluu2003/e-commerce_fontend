import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "./Login.module.css";
import { COLORS } from "../../constants/constants.js";
import { toast } from "react-toastify";
import { Button } from "antd";
import { FcGoogle } from "react-icons/fc";
import { GoogleLogin } from '@react-oauth/google'; // Import GoogleLogin from react-oauth/google

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        if (token && user) {
            toast.success("Bạn đã đăng nhập thành công");
            navigate("/");
        }

        // Reset scroll position when navigating to this page
        window.scrollTo(0, 0);
    }, [navigate, location]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");

        try {
            const response = await axios.post(
                "http://localhost:8080/api/authentication/login",
                {
                    email: formData.email.trim(),
                    password: formData.password.trim(),
                }
            );
            if (response.status === 200) {
                const data = response.data;
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.customer));
                window.dispatchEvent(new Event("cartUpdated"));
                navigate("/");
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

    const handleRedirectToRegister = (e) => {
        e.preventDefault();
        // Add a class to trigger exit animation
        document.querySelector(`.${styles.container}`).classList.add('exit');

        // Wait for animation to complete before navigating
        setTimeout(() => {
            navigate("/register");
        }, 300);
    };

    // Google login success handler
    const handleGoogleLogin = async (response) => {
        console.log("response", response)
        try {
            const { credential } = response;
            const googleToken = credential;

            // Send Google token to backend for validation
            const res = await axios.post(`http://localhost:8080/api/authentication/google-login/${googleToken}`)

            if (res.status === 200) {
                // Save user data to localStorage or handle further logic here
                const data = res.data;
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.customer));
                window.dispatchEvent(new Event("cartUpdated"));
                navigate("/");
                toast.success("Đăng nhập thành công!");
            }
        } catch (error) {
            setErrorMessage("Đăng nhập bằng Google thất bại. Vui lòng thử lại!");
            console.error("Google login error: ", error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.singleColumnContainer}>
                <img
                    src="/img/thehands.png"
                    alt="Logo"
                    className={styles.logo}
                />
                <h2 className={styles.title}>Đăng nhập</h2>
                <p className={styles.subtitle}>vào tài khoản của bạn</p>

                {errorMessage && (
                    <div className={styles.errorMessage}>
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <input
                            type="text"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Tên đăng nhập"
                            className={styles.input}
                            disabled={loading}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Mật khẩu"
                            className={styles.input}
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.loginButton}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className={styles.spinner}> </span>
                        ) : (
                            <div>
                                ĐĂNG NHẬP
                            </div>
                        )}
                    </button>
                    <hr />

                    {/* Google Login Button */}
                    <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={(error) => console.error("Login Failed:", error)}
                        useOneTap
                    >
                        <button
                            type="button"
                            className={styles.loginGoogleeButton}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className={styles.spinner}> </span>
                            ) : (
                                <div className={"d-flex gap-3 align-items-center justify-content-center"}>
                                    <FcGoogle size={28} />
                                    ĐĂNG NHẬP BẰNG GOOGLE
                                </div>
                            )}
                        </button>
                    </GoogleLogin>

                    <div className={styles.forgotPassword}>
                        <Link to="/forgot-password">
                            Quên mật khẩu?
                        </Link>
                    </div>
                </form>

                <div className={styles.orDivider}>hoặc</div>

                <div className={styles.signupLink}>
                    <p>Chưa có tài khoản?</p>
                    <Link to="/register" className={styles.signupButton} onClick={handleRedirectToRegister}>
                        Đăng ký
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
