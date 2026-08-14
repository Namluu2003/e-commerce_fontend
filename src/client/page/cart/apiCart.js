import { message } from "antd";
import axios from "axios";

const token = localStorage.getItem("token");

const api = axios.create({
  baseURL: "http://localhost:8080/api/client",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const apiVoucherBest = async (req) => {
  const { customerId, totalBillMoney } = req;

  try {
    const response = await api.get("/voucherbest", {
      params: { customerId: customerId, billValue: totalBillMoney },
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};
export const apiFindVoucherValid = async (req) => {
  const { customerId } = req;
  try {
    const response = await api.get("/findvalidvouchers", {
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
export const apiPlus = async (req) => {
  const { customerId } = req;
  try {
    const response = await api.get("/plus", {
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
export const apiSubtract = async (req) => {
  const { customerId } = req;
  try {
    const response = await api.get("/subtract", {
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
export const apiSetQuantityCart = async (req) => {
  const { cartDetailid,quantity } = req;
  try {
    const response = await api.get("/setquantitycart", {
      params: { customerId: cartDetailid ,quantity: quantity},
    });

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};
export const apiGetRealPrice = async (addCartList) => {
  try {
    const response = await api.post("/getrealprice", addCartList);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi lấy giá thực.";
    console.error(errorMessage);
    throw error;
  }
};