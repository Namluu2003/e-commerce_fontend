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

export const fetchTypes = async (pagination) => {
  console.log("token",token);
  
  const { current, pageSize } = pagination;

  try {
    const response = await api.get("/type", {
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

export const searchNameType = async (pagination, paramName) => {
  const { current, pageSize } = pagination; // Trích xuất current và pageSize từ pagination
  const name = paramName.name?.trim() || ""; 
  try {
    const response = await api.get("/type/search", {
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

export const createType = async (typeData) => {
  try {
    const response = await api.post("/type/add", typeData);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tạo thương hiệu.";
    console.error(errorMessage);
    toast.error(error.response?.data?.message)
    throw error;
  }
};

export const existsByTypeName = async (typeName) => {
  try {
    const response = await api.get("type/existsbytypename", {
      params: {
        typeName
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

export const updateType = async (typeId, typeData) => {
  try {
    const response = await api.put(`/type/update/${typeId}`, typeData);
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

export const deleteType = async (typeId) => {
  try {
    await api.delete(`/type/${typeId}`);
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi xóa thương hiệu.";
    console.error(errorMessage);
    throw error;
  }
};
export const getType = async (typeId) => {
  try {
    const response = await api.get(`/type/${typeId}`);
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
    const response = await api.get("/type/switchstatus", {
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