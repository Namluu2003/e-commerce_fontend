import { message } from "antd";
import axios from "axios";

const token = localStorage.getItem("token");

const api = axios.create({
  baseURL: "http://localhost:8080/api/",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const apiRead = async (conversationId) => {
  try {
    const response = await api.get("/messages/read/" + conversationId );
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};
