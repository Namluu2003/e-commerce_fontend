import { baseUrl } from "../../../helpers/Helpers.js";
import { message } from "antd";
import axios from "axios";

const token = localStorage.getItem("token");

const api = axios.create({
  baseURL: `${baseUrl}/api/client`,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const apiGetAddressDefaut = async (req) => {
  const { customerId } = req;

  try {
    const response = await api.get("/getadressdefault", {
      params: { customerId: customerId },
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};
export const apiGetFreeShip = async (req) => {


  try {
    const response = await api.get("/free-ship");
    return response.data.data.minOrderValue;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};
