import { message } from "antd";
import axios from "axios";
import {toast} from "react-toastify";

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


export const fetchProducts = async (pagination) => {
  const { current, pageSize } = pagination;

  try {
    const response = await api.get("/productdetail", {
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
export const getAllProductDetailExportData = async () => {
  try {
    const response = await api.get("/productdetail/exportdata");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};
export const filterData = async (pagination, requestFilter) => {
  const { current, pageSize } = pagination;

  try {
    const response = await api.post(
      "/productdetail/filter",
      requestFilter, // Đây là request body
      {
        params: { page: current, size: pageSize }, // Đây là params
      }
    );

    const { data, meta } = response.data;
    return { data, total: meta?.totalElement || 0 };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};

export const fetchDataSelectBrand = async () => {
  try {
    const response = await api.get("/brand/getallselect", {});

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    toast.error(error.response?.data?.message);
    throw error;
  }
};
export const fetchDataSelectBrandHD = async () => {
  try {
    const response = await api.get("/brand/getallselecthd", {});

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    toast.error(error.response?.data?.message);
    throw error;
  }
};

export const fetchDataSelectColor = async () => {
  try {
    const response = await api.get("/color/getallselect", {});

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    toast.error(error.response?.data?.message);
    throw error;
  }
};
export const fetchDataSelectColorHD = async () => {
  try {
    const response = await api.get("/color/getallselecthd", {});

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    toast.error(error.response?.data?.message);
    throw error;
  }
};
export const fetchDataSelectGender = async () => {
  try {
    const response = await api.get("/gender/getallselect", {});

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    toast.error(error.response?.data?.message);
    throw error;
  }
};
export const fetchDataSelectGenderHD = async () => {
  try {
    const response = await api.get("/gender/getallselecthd", {});

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    toast.error(error.response?.data?.message);
    throw error;
  }
};
export const fetchDataSelectMaterial = async () => {
  try {
    const response = await api.get("/material/getallselect", {});

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    toast.error(error.response?.data?.message);
    throw error;
  }
};
export const fetchDataSelectMaterialhd = async () => {
  try {
    const response = await api.get("/material/getallselecthd", {});

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    toast.error(error.response?.data?.message);
    throw error;
  }
};
export const fetchDataSelectProduct = async () => {
  try {
    const response = await api.get("/product/getallselect", {});

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    toast.error(error.response?.data?.message);
    throw error;
  }
};
export const fetchDataSelectProducthd = async () => {
  try {
    const response = await api.get("/product/getallselecthd", {});

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    toast.error(error.response?.data?.message);
    throw error;
  }
};
export const fetchDataSelectSize = async () => {
  try {
    const response = await api.get("/size/getallselect", {});

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    toast.error(error.response?.data?.message);
    throw error;
  }
};
export const fetchDataSelectSizehd = async () => {
  try {
    const response = await api.get("/size/getallselecthd", {});

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    toast.error(error.response?.data?.message);
    throw error;
  }
};
export const fetchDataSelectSole = async () => {
  try {
    const response = await api.get("/sole/getallselect", {});

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    toast.error(error.response?.data?.message);
    throw error;
  }
};
export const fetchDataSelectSolehd = async () => {
  try {
    const response = await api.get("/sole/getallselecthd", {});

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    toast.error(error.response?.data?.message);
    throw error;
  }
};
export const fetchDataSelectType = async () => {
  try {
    const response = await api.get("/type/getallselect", {});

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    toast.error(error.response?.data?.message);
    throw error;
  }
};
export const fetchDataSelectTypehd = async () => {
  try {
    const response = await api.get("/type/getallselecthd", {});

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    toast.error(error.response?.data?.message);
    throw error;
  }
};
export const searchNameProduct = async (pagination, paramName) => {
  const { current, pageSize } = pagination; // Trích xuất current và pageSize từ pagination
  const name = paramName.name?.trim() || ""; 
  try {
    const response = await api.get("/productdetail/search", {
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

export const createProductDetail = async (request) => {
  try {
    const response = await api.post("/productdetail/add", request);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tạo thương hiệu.";
    console.error(errorMessage);
    toast.error(error.response?.data?.message);
    throw error;
  }
};
export const createProductDetailList = async (request) => {
  try {
    const response = await api.post("/productdetail/create", request);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tạo thương hiệu.";
    console.error(errorMessage);
    // toast.error(error.response?.data?.message);
    throw error;
  }
};
export const existsByProductName = async (productName) => {
  try {
    const response = await api.get("product/existsbyproductname", {
      params: {
        productName,
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

export const updateProduct = async (productId, productData) => {
  console.log(productId);
  console.log(productData);

  try {
    const response = await api.put(
      `/productdetail/update/${productId}`,
      productData
    );
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      "Có lỗi xảy ra khi cập nhật thương hiệu.";
    console.error(errorMessage);
    // message.error(errorMessage);
    throw error;
  }
};
export const exitsProductDetail = async ( productData) => {
  console.log(productData);

  try {
    const response = await api.post(
      `/productdetail/existsproductdetail`,
      productData
    );
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      "lỗi";
    console.error(errorMessage);
    message.error(errorMessage);
    throw error;
  }
};

export const deleteProductDetail = async (productId) => {
  try {
    await api.delete(`/productdetail/${productId}`);
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi xóa thương hiệu.";
    console.error(errorMessage);
    throw error;
  }
};
export const getProduct = async (productId) => {
  try {
    const response = await api.get(`/productdetail/${productId}`);
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
    const response = await api.get("/productdetail/switchstatus", {
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


export const fetchProductsWithPromotion = async (pagination) => {
  const { current, pageSize } = pagination;

  try {
    const response = await api.get("/productdetail", {
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


export const filterDataWithPromotion = async (pagination, requestFilter) => {
  const { current, pageSize } = pagination;

  try {
    const response = await api.post(
        "/productdetail/filter-with-promotion",
        requestFilter, // Đây là request body
        {
          params: { page: current, size: pageSize }, // Đây là params
        }
    );

    const { data, meta } = response.data;
    return { data, total: meta?.totalElement || 0 };
  } catch (error) {
    const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};
export const apiGetAttributeOfproductExists = async (productId) => {

  try {
    const response = await api.get("/product/get-attribute-of-product", {
      params: {productId},
    });

    return response.data;
  } catch (error) {
    const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};