import axios from "axios";
import Token from "@zxing/library/es2015/core/aztec/encoder/Token.js";

export const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
};

export const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

export function convertDate(isoString) {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
  const year = String(date.getFullYear()).slice(-2); // Lấy 2 số cuối của năm

  return `${day}-${month}-${year}`;
}

export function convertDateFullYear(isoString) {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
  const year = String(date.getFullYear()); // Lấy 2 số cuối của năm

  return `${day}-${month}-${year}`;
}

// Chuyển từ Long sang date
export const convertLongTimestampToDate = (timestamp) => {
  if (timestamp == null) {
    return null;
  }

  const date = new Date(timestamp);

  // Convert sang múi giờ Việt Nam
  const vietnamTime = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }),
  );

  const pad = (n) => n.toString().padStart(2, "0");

  const hours = pad(vietnamTime.getHours());
  const minutes = pad(vietnamTime.getMinutes());
  const day = pad(vietnamTime.getDate());
  const month = pad(vietnamTime.getMonth() + 1);
  const year = vietnamTime.getFullYear();

  return `${hours}:${minutes} ${day}/${month}/${year}`;
};

export const convertStatusVoucher = (statusVoucher) => {
  if (statusVoucher === "dang_kich_hoat") {
    return "Đang kích hoạt";
  }
  if (statusVoucher === "ngung_kich_hoat") {
    return "Ngừng kích hoạt";
  }
  if (statusVoucher === "chua_kich_hoat") {
    return "Chưa kích hoạt";
  }
};
export const ConvertvoucherType = (voucherType) => {
  if (voucherType === "PUBLIC") {
    return "Công khai";
  }
  if (voucherType === "PRIVATE") {
    return "Riêng tư";
  }
};
export const ConvertdiscountType = (discountType) => {
  if (discountType === "PERCENT") {
    return "%";
  }
  if (discountType === "MONEY") {
    return "đ";
  }
};

export const convertBillStatusToString = (status) => {
  if (status === null) {
    return null;
  }

  switch (status) {
    case "TAO_DON_HANG":
      return "Tạo đơn hàng";
    case "CHO_XAC_NHAN":
      return "Chờ xác nhận";
    case "DA_XAC_NHAN":
      return "Đã xác nhận";
    case "CHO_VAN_CHUYEN":
      return "Chờ vận chuyển";
    case "DANG_VAN_CHUYEN":
      return "Đang vận chuyển";
    case "DA_GIAO_HANG":
      return "Đã giao hàng";
    case "CHO_THANH_TOAN":
      return "Chờ thanh toán";
    case "DA_THANH_TOAN":
      return "Đã thanh toán";
    case "DA_HOAN_THANH":
      return "Đã hoàn thành";
    case "DA_HUY":
      return "Đã hủy";
    case "TRA_HANG":
      return "Trả hàng";
    case "HUY_YEU_CAU_TRA_HANG":
      return "Hủy yêu cầu trả hàng";
    case "TU_CHOI_TRA_HANG":
      return "Từ chối trả hàng";
    case "DANG_XAC_MINH":
      return "Đang xác minh";
    default:
      return "Khác";
  }
};

export const paymentTypeConvert = {
  COD: { text: "CoD", color: "blue" },
  THANH_TOAN_TRUOC: { text: "Thanh toán trước", color: "green" },
  THANH_TOAN_KHI_NHAN_HANG: {
    text: "Thanh toán khi nhận hàng",
    color: "orange",
  },
  HOAN_TIEN: { text: "Hoàn tiền", color: "red" },
};

export const paymentMethodConvert = {
  COD: "CoD",
  ZALO_PAY: "Zalo pay",
  TIEN_MAT: "Tiền mặt",
  VN_PAY: "VN Pay",
  CHUYEN_KHOAN: "Chuyển khoản",
  TIEN_MAT_AND_CHUYEN_KHOAN: "Tiền mặt và Chuyển khoản",
};
export const paymentBillStatusConvert = {
  CHUA_THANH_TOAN: { text: "Chưa thanh toán", color: "red" },
  DA_THANH_TOAN: { text: "Đã thanh toán", color: "green" },
  DA_HOAN_TIEN: { text: "Đã hoàn tiền", color: "red" },
};

export async function generateAddressString(
  provinceId,
  districtId,
  wardId,
  specificAddressDefault,
) {
  console.log(provinceId, districtId, wardId, specificAddressDefault);
  const tokenGHN = import.meta.env.VITE_GHN_API_KEY;
  const TOKEN = tokenGHN; // Thay bằng API Key của bạn

  const GHN_API_URL =
    "https://online-gateway.ghn.vn/shiip/public-api/master-data";

  if (!provinceId && !districtId && !wardId) {
    return "Địa chỉ không hợp lệ";
  }

  let provinceName = "";
  let districtName = "";
  let wardName = "";

  try {
    if (provinceId) {
      const provinceResponse = await axios.post(
        `${GHN_API_URL}/province`,
        {},
        {
          headers: { Token: TOKEN },
        },
      );
      const province = provinceResponse.data.data.find(
        (p) => p.ProvinceID === parseInt(provinceId),
      );
      provinceName = province ? province.ProvinceName : "";
    }

    if (districtId) {
      const districtResponse = await axios.post(
        `${GHN_API_URL}/district`,
        { province_id: parseInt(provinceId) },
        {
          headers: { Token: TOKEN },
        },
      );
      const district = districtResponse.data.data.find(
        (d) => d.DistrictID === parseInt(districtId),
      );
      districtName = district ? district.DistrictName : "";
    }

    if (wardId) {
      const wardResponse = await axios.post(
        `${GHN_API_URL}/ward`,
        { district_id: parseInt(districtId) },
        {
          headers: { Token: TOKEN },
        },
      );
      const ward = wardResponse.data.data.find((w) => w.WardCode === wardId);
      wardName = ward ? ward.WardName : "";
    }
  } catch (error) {
    console.error("Lỗi khi gọi API GHN:", error);
  }

  return `${specificAddressDefault ? specificAddressDefault + ", " : ""}${wardName ? wardName + ", " : ""}${districtName ? districtName + ", " : ""}${provinceName ? provinceName + ", " : ""}`.trim();
}

export function formatVND(number) {
  if (typeof number !== "number") {
    return "0 VND"; // Kiểm tra nếu không phải là số
  }

  return number.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
}

const GHN_API_URL =
  "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee";
const SERVICE_TYPE_ID = 2; // Loại dịch vụ: Giao hàng tiêu chuẩn

export const calculateShippingFee = async ({
  shopId = 5638683,
  fromDistrictId,
  fromWardCode,
  toDistrictId,
  toWardCode,
  length = 10,
  width = 10,
  height = 10,
  weight = 1,
  insuranceValue = 0,
  coupon = null,
  items = [],
}) => {
  try {
    const tokenGHN = import.meta.env.VITE_GHN_API_KEY;
    const response = await axios.post(
      GHN_API_URL,
      {
        service_type_id: SERVICE_TYPE_ID,
        from_district_id: fromDistrictId,
        from_ward_code: fromWardCode,
        to_district_id: toDistrictId,
        to_ward_code: toWardCode,
        length,
        width,
        height,
        weight,
        insurance_value: insuranceValue,
        coupon,
        items: [
          {
            name: "TEST1",
            quantity: 1,
            length: 200,
            width: 20,
            height: 20,
            weight: 1,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Token: tokenGHN,
          ShopId: shopId,
        },
      },
    );

    return response.data.data.total;
  } catch (error) {
    console.error(
      "Error calculating shipping fee:",
      error.response?.data || error.message,
    );
    throw new Error("Failed to calculate shipping fee");
  }
};

export const getRole = () => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    const user = JSON.parse(storedUser) ?? null;
    return user?.role || null;
  }
  return null;
};
