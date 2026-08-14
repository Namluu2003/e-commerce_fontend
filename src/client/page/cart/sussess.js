import { message } from "antd";
import axios from "axios";

const token = localStorage.getItem("token");

const api = axios.create({
  baseURL: "http://localhost:8080/api/polling",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const apiStartCheck = async () => {
  try {
    const response = await api.post("/start");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};
export const apiStopCheck = async () => {
    try {
      const response = await api.post("/stop");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
      console.error(errorMessage);
      throw error;
    }
  };