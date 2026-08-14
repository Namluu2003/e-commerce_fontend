import { message } from "antd";
import axios from "axios";
import { toast } from "react-toastify";

const token = localStorage.getItem("token");

const api = axios.create({
  baseURL: "http://localhost:8080/api/admin",
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


export const fetchBrands = async (pagination) => {
  // console.log("token",token);
  
  const { current, pageSize } = pagination;

  try {
    const response = await api.get("/brand", {
      params: { page: current, size: pageSize },
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

export const searchNameBrand = async (pagination, paramName) => {
  const { current, pageSize } = pagination; // Trích xuất current và pageSize từ pagination
  const name = paramName.name?.trim() || ""; 
  try {
    const response = await api.get("/brand/search", {
      params: {
        page: current,
        size: pageSize,
        name: name,
      },
    });

    const { data, meta } = response.data; // Trích xuất data và meta từ response
    return {
      data,
      total: meta?.totalElement || 0,
    }; // Trả về dữ liệu và tổng số phần tử
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};
export const switchStatus = async (id, statusO) => {
  const { status } = statusO;

  try {
    const response = await api.get("/brand/switchstatus", {
      params: {
        id: id,
        status: status,
      },
    });
    return response.data
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};

export const createBrand = async (brandData) => {
  try {
    const response = await api.post("/brand/add", brandData);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tạo Hãng.";
    console.error(errorMessage);
    toast.error(error.response?.data?.message)
    throw error;
  }
};

export const existsByBrandName = async (brandName) => {
  try {
    const response = await api.get("brand/existsbybrandname", {
      params: {
        brandName
      },
    });
    return response.data.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tạo Hãng.";
    console.error(errorMessage);
    throw error;
  }
};

export const updateBrand = async (brandId, brandData) => {
  try {
    const response = await api.put(`/brand/update/${brandId}`, brandData);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      "Có lỗi xảy ra khi cập nhật Hãng.";
    console.error(errorMessage);
    toast.error(errorMessage)
    throw error;
  }
};

export const deleteBrand = async (brandId) => {
  try {
    await api.delete(`/brand/${brandId}`);
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi xóa Hãng.";
    console.error(errorMessage);
    throw error;
  }
};
export const getBrand = async (brandId) => {
  try {
    const response = await api.get(`/brand/${brandId}`);
    return response.data; // Assuming you want to return the fetched data
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi get Hãng.";
    console.error(errorMessage);
    throw new Error(errorMessage); // It's a good practice to throw a new error with a clear message
  }
};
