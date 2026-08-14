import { message } from "antd";
import axios from "axios";

const token = localStorage.getItem("token");

const api = axios.create({
  baseURL: "http://localhost:8080/api/client",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
export const apiCreateBillClient = async (createRequest) => {
  try {
    const response = await api.post("/createbillclient", createRequest);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tạo hóa đơn.";
    console.error(errorMessage);
    message.error(error.response?.data?.message);
    throw error;
  }
};
