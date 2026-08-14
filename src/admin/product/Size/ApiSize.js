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


export const fetchSizes = async (pagination) => {
  const { current, pageSize } = pagination;

  try {
    const response = await api.get("/size", {
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

export const searchNameSize = async (pagination, paramName) => {
  const { current, pageSize } = pagination; // Trích xuất current và pageSize từ pagination
  const name = paramName.name?.trim() || ""; 
  try {
    const response = await api.get("/size/search", {
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

export const createSize = async (sizeData) => {
  try {
    const response = await api.post("/size/add", sizeData);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tạo thương hiệu.";
    console.error(errorMessage);
    toast.error(error.response?.data?.message)
    throw error;
  }
};

export const existsBySizeName = async (sizeName) => {
  try {
    const response = await api.get("size/existsbysizename", {
      params: {
        sizeName
      },
    });
    return response.data.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tạo thương hiệu.";
    console.error(errorMessage);
    throw error;
  }
};

export const updateSize = async (sizeId, sizeData) => {
  try {
    const response = await api.put(`/size/update/${sizeId}`, sizeData);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      "Có lỗi xảy ra khi cập nhật thương hiệu.";
    console.error(errorMessage);
    message.error(errorMessage)
    throw error;
  }
};

export const deleteSize = async (sizeId) => {
  try {
    await api.delete(`/size/${sizeId}`);
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi xóa thương hiệu.";
    console.error(errorMessage);
    throw error;
  }
};
export const getSize = async (sizeId) => {
  try {
    const response = await api.get(`/size/${sizeId}`);
    return response.data; // Assuming you want to return the fetched data
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi get thương hiệu.";
    console.error(errorMessage);
    throw new Error(errorMessage); // It's a good practice to throw a new error with a clear message
  }
};
export const switchStatus = async (id, statusO) => {
  const { status } = statusO;

  try {
    const response = await api.get("/size/switchstatus", {
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