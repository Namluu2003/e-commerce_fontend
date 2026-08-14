import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "./Register.module.css";
import { validateEmail } from "../../helpers/Helpers.js";
import { COLORS } from "../../constants/constants.js";
import {toast} from "react-toastify";
import log from "eslint-plugin-react/lib/util/log.js";
import {GoogleLogin} from "@react-oauth/google";
import {FcGoogle} from "react-icons/fc";

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Reset scroll position when navigating to this page
        window.scrollTo(0, 0);
    }, [navigate, location]);

    const handleInputChange = (e) => {
        handClearError();
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handClearError = () => {
        setErrors({
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
        });
    };

    const handleCheckValidate = () => {
        let isValid = true;

        const newErrors = {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
        };

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Tên đăng nhập không được để trống";
            isValid = false;
        } else if (formData.fullName.trim().length < 3) {
            newErrors.fullName = "Tên đăng nhập phải có ít nhất 3 ký tự";
            isValid = false;
        } else if (formData.fullName.trim().length > 50) {
            newErrors.fullName = "Tên đăng nhập không được vượt quá 50 ký tự";
            isValid = false;
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email không được để trống";
            isValid = false;
        } else if (!validateEmail(formData.email)) {
            newErrors.email = "Email không hợp lệ";
            isValid = false;
        } else if (formData.email.trim().length > 50) {
            newErrors.email = "Email không được vượt quá 50 ký tự";
            isValid = false;
        }

        if (!formData.password.trim()) {
            newErrors.password = "Vui lòng nhập mật khẩu";
            isValid = false;
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu không khớp";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        if (!handleCheckValidate()) {
            setLoading(false);
            return;
        }
        
        try {
            const response = await axios.post(
                "http://localhost:8080/api/authentication/register",
                {
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim(),
                    password: formData.password.trim(),
                }
            );

            const data = response.data;
            toast.success("Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản!")
            navigate("/")
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRedirectToLogin = (e) => {
        e.preventDefault();
        // Add a class to trigger exit animation
        document.querySelector(`.${styles.container}`).classList.add('exit');
        
        // Wait for animation to complete before navigating
        setTimeout(() => {
            navigate("/login");
        }, 300);
    };

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
            setErrorMessage("Đăng nhập bằng Google thất bại. Vui lòng thử lại.");
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
                <h2 className={styles.title}>Đăng ký</h2>
                <p className={styles.subtitle}>tạo tài khoản của bạn</p>

                {errorMessage && (
                    <div className={styles.errorMessage}>
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Họ và tên"
                            className={errors.fullName ? `${styles.input} ${styles.inputError}` : styles.input}
                            disabled={loading}
                        />
                        {errors.fullName && <div className={styles.errorText}>{errors.fullName}</div>}
                    </div>

                    <div className={styles.inputGroup}>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email"
                            className={errors.email ? `${styles.input} ${styles.inputError}` : styles.input}
                            disabled={loading}
                        />
                        {errors.email && <div className={styles.errorText}>{errors.email}</div>}
                    </div>

                    <div className={styles.inputGroup}>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Mật khẩu"
                            className={errors.password ? `${styles.input} ${styles.inputError}` : styles.input}
                            disabled={loading}
                        />
                        {errors.password && <div className={styles.errorText}>{errors.password}</div>}
                    </div>

                    <div className={styles.inputGroup}>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Nhập lại mật khẩu"
                            className={errors.confirmPassword ? `${styles.input} ${styles.inputError}` : styles.input}
                            disabled={loading}
                        />
                        {errors.confirmPassword && <div className={styles.errorText}>{errors.confirmPassword}</div>}
                    </div>

                    <button
                        type="submit"
                        className={styles.signupButton}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className={styles.spinner}></span>
                        ) : (
                            "ĐĂNG KÝ"
                        )}
                    </button>

                    {/* Google Login Button */}
                    <div className={styles.orDivider}>hoặc</div>
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
                                    <FcGoogle size={28}/>
                                    ĐĂNG NHẬP BẰNG GOOGLE
                                </div>
                            )}
                        </button>
                    </GoogleLogin>

                </form>


                <div className={styles.loginLink}>
                    <p>Đã có tài khoản?</p>
                    <Link to="/login" className={styles.loginButtonLink} onClick={handleRedirectToLogin}>
                        Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;