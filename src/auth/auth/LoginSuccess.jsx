import { message } from "antd";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; 
import axios from "axios";
const LoginSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); 
  

  useEffect(() => {
    const fetchUserProfile = async (token) => {
      try {
  
        const response = await axios.get("http://localhost:8080/api/v1/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });

        if (response.data) {
          
          localStorage.setItem("userInfo", JSON.stringify(response.data.data));
          message.success("Đăng nhập thành công!");
          navigate("/"); 
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        message.error("Không thể lấy thông tin người dùng!");
        navigate("/auth/login");
      }
    };

    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("accessToken", token);
      fetchUserProfile(token);
    } else {
      message.error("Không lấy được token!");
      navigate("/auth/login");
    }
  }, [navigate, searchParams]);

  return <div>Processing login...</div>;
};

export default LoginSuccess;