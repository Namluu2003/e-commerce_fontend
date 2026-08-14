import { message } from "antd";
import axios from "axios";

const token = localStorage.getItem("token");

const api = axios.create({
  baseURL: "http://localhost:8080/api/client",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getAllProductHadCreatedAtDesc = async (pagination) => {
  const { current, pageSize } = pagination;
  try {
    const response = await api.get("/getallproducthadviewsdesc", {
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

export const getAllProducthadSoldDesc = async (pagination) => {
  const { current, pageSize } = pagination;
  try {
    const response = await api.get("/getallproducthadsoledesc", {
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
export const getAllProducthadPromotion = async (pagination) => {
  const { current, pageSize } = pagination;
  try {
    const response = await api.get("/getallproducthadpromotion", {
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

export const getAllProducthadViewsDesc = async (pagination) => {
  const { current, pageSize } = pagination;
  try {
    const response = await api.get("/getallproducthadviewsdesc", {
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

export const apigetProductDetail = async (
  productId,
  colorId,
  sizeId,
  genderId,
  materialId,
  soleId
) => {
  try {
    const response = await api.get("/getproductdetail", {
      params: {
        productId: productId,
        colorId: colorId,
        sizeId: sizeId,
        genderId: genderId,
        materialId: materialId,
        soleId: soleId,
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    // message.error(errorMessage);
    throw error;
  }
};

export const apiGetSizesOfProduct = async (productId) => {
  try {
    const response = await api.get("/findsizebyproductid", {
      params: { productId: productId },
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};
export const apiGetSizesOfProductAndColor = async (
  productId,
  colorId,
  soleId,
  materialId,
  genderId
) => {
  try {
    const response = await api.get("/findsizebyproductidandcolorid", {
      params: {
        productId: productId,
        colorId: colorId,
        soleId: soleId,
        materialId: materialId,
        genderId: genderId,
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};
export const apiGetColorsOfProductAndSoleId = async (
  productId,
  soleId,
  materialId,
  genderId
) => {
  try {
    const response = await api.get("/find-color-byproductid-and-soleId", {
      params: {
        productId: productId,
        soleId: soleId,
        materialId: materialId,
        genderId: genderId,
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};
export const apiGetSolesOfProductAndMaterialId = async (
  productId,
  materialId,
  genderId
) => {
  try {
    const response = await api.get("/find-sole-byproductid-and-materialId", {
      params: {
        productId: productId,
        materialId: materialId,
        genderId: genderId,
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};
export const apiGetMaterialsOfProductAndGenderId = async (
  productId,
  genderId
) => {
  try {
    const response = await api.get("/find-material-byproductid-and-genderid", {
      params: { productId: productId, genderId: genderId },
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};

export const apiGetColorsOfProduct = async (productId) => {
  try {
    const response = await api.get("/findcolorbyproductid", {
      params: { productId: productId },
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};
export const apiGetMaterialssOfProduct = async (productId) => {
  try {
    const response = await api.get("/findmaterialsbyproductid", {
      params: { productId: productId },
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};
export const apiGetGendersOfProduct = async (productId) => {
  try {
    const response = await api.get("/findgendersbyproductid", {
      params: { productId: productId },
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};
export const apiGetSolesOfProduct = async (productId) => {
  try {
    const response = await api.get("/findsolesbyproductid", {
      params: { productId: productId },
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};
export const apiAddViewProduct = async (productId) => {
  try {
    const response = await api.get("/addviewproduct", {
      params: { productId: productId },
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};

export const apiAddCart = async (productAddCart) => {
  try {
    const response = await api.post("/addcart", productAddCart);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};
export const apiHasBought = async (customerId, productId) => {
  try {
    const response = await api.get("/has-bought", {
      params: { customerId: customerId, productId: productId },
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};

export const apiFilter = async (requestFilter) => {
  try {
    const response = await api.get("/filter", {
      params: {
        productId: requestFilter.productId || null,
        brandId: requestFilter.brandId || null,
        genderId: requestFilter.genderId || null,
        typeId: requestFilter.typeId || null,
        colorId: requestFilter.colorId || null,
        materialId: requestFilter.materialId || null,
        minPrice: requestFilter.minPrice || null,
        maxPrice: requestFilter.maxPrice || null,
        page: requestFilter.page || 1,
        size: requestFilter.size,
      },
    });
    console.log("dếosodasdoaodkasod", response.data);

    return response.data; // Trả về toàn bộ response.data (bao gồm data và meta)
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.";
    console.error(errorMessage);
    throw error;
  }
};

/**
 * Lấy danh sách sản phẩm
 * @returns {Promise<Array>} Danh sách sản phẩm
 */
export const getProducts = async () => {
  try {
    const response = await api.get("/product-full");
    return response.data.data || []; // Trả về mảng sản phẩm
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};
