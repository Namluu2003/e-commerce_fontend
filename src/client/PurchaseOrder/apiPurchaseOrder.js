import { message } from "antd";
import axios from "axios";

const token = localStorage.getItem("token");

const api = axios.create({
  baseURL: "http://localhost:8080/api/client",
});

// Thêm interceptor để tự động thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Lấy token từ localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const apiGetAllBillOfCustomerId = async (pagination,customerId) => {
  console.log("token",token);
  
  const { current, pageSize } = pagination;

  try {
    const response = await api.get("/getallbillcustomerId", {
      params: { page: current, size: pageSize,customerId: customerId },
    });

    const { data, meta } = response.data;
    return { data, total: meta?.totalElement || 0 };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};
export const apiCancelBill = async (billId,description) => {
  
  try {
    const response = await api.get("/cancelbill", {
      params: { billId,description},
    });

    return response.data
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};

export const apiBuyBack = async (billId,customerId) => {
  
  try {
    const response = await api.get("/buyback", {
      params: { billId,customerId},
    });

    return response.data
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};