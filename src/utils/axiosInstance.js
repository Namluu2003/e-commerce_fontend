import axios from "axios";
import {baseUrl} from "../helpers/Helpers.js";



// Lấy token từ localStorage
const getAccessToken = () => localStorage.getItem("token");

// Tạo instance của Axios
const axiosInstance = axios.create({
    baseURL: `${baseUrl}`,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor để tự động thêm Authorization header
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return  Promise.reject(error)
    }
);

export default axiosInstance;
