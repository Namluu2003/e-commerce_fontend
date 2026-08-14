import axiosInstance from "../../../utils/axiosInstance.js";

export const updateProductBill = (billCode, payload) => {
    return axiosInstance.put(`/api/admin/bill/update-product-bill/${billCode}`, payload)
}