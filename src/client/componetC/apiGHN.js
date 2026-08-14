import axios from "axios";

const GHN_API_URL = "https://online-gateway.ghn.vn/shiip/public-api";
const SERVICE_TYPE_ID = 2; 
const TOKEN = import.meta.env.VITE_GHN_API_KEY;
const SHOP_ID = 5638683;

/**
 * Hàm tính phí vận chuyển GHN
 */

/**
 * Hàm lấy địa chỉ đầy đủ từ GHN
 */
export async function generateAddressString(
  provinceId,
  districtId,
  wardId,
  specificAddress = ""
) {
  let provinceName = "",
    districtName = "",
    wardName = "";

  try {
    if (provinceId) {
      const response = await axios.post(
        `${GHN_API_URL}/master-data/province`,
        {},
        {
          headers: { Token: TOKEN },
        }
      );
      const province = response.data.data.find(
        (p) => p.ProvinceID === parseInt(provinceId)
      );
      provinceName = province?.ProvinceName || "";
    }

    if (districtId) {
      const response = await axios.post(
        `${GHN_API_URL}/master-data/district`,
        { province_id: parseInt(provinceId) },
        { headers: { Token: TOKEN } }
      );
      const district = response.data.data.find(
        (d) => d.DistrictID === parseInt(districtId)
      );
      districtName = district?.DistrictName || "";
    }

    if (wardId) {
      const response = await axios.post(
        `${GHN_API_URL}/master-data/ward`,
        { district_id: parseInt(districtId) },
        { headers: { Token: TOKEN } }
      );
      const ward = response.data.data.find((w) => w.WardCode === wardId);
      wardName = ward?.WardName || "";
    }
  } catch (error) {
    console.error(
      "Lỗi khi lấy thông tin địa chỉ:",
      error.response?.data || error.message
    );
  }

  return `${specificAddress ? specificAddress + ", " : ""}${
    wardName ? wardName + ", " : ""
  }${districtName ? districtName + ", " : ""}${
    provinceName ? provinceName : ""
  }`.trim();
}

export const calculateShippingFee = async ({
  shopId = SHOP_ID,
  fromDistrictId,
  fromWardCode,
  toDistrictId,
  toWardCode,
  length = 10,
  width = 10,
  height = 20,
  weight = 1,
  insuranceValue = 0,
  coupon = null,
  items = [],
}) => {
  try {
    const tokenGHN = TOKEN;
    const response = await axios.post(
      GHN_API_URL + "/v2/shipping-order/fee",
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
      }
    );

    return response.data.data.total;
  } catch (error) {
    console.error(
      "Error calculating shipping fee:",
      error.response?.data || error.message
    );
    throw new Error("Failed to calculate shipping fee");
  }
};

/**
 * Hàm chuyển đổi timestamp thành chuỗi ngày giờ
 * @param {number} timestamp - Timestamp cần chuyển đổi (tính bằng giây)
 * @returns {string} Chuỗi ngày giờ định dạng dd/MM/yyyy HH:mm
 */
const formatDateTime = (timestamp) => {
  if (!timestamp) return "Không xác định";
  // Chuyển đổi timestamp từ giây sang mili giây
  const date = new Date(timestamp * 1000);
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Hàm tính thời gian dự kiến giao hàng GHN
 * @param {Object} params - Thông tin cần thiết để tính thời gian giao hàng
 * @param {number|string} params.fromDistrictId - ID quận/huyện gửi hàng
 * @param {string} params.fromWardCode - Mã phường/xã gửi hàng
 * @param {number|string} params.toDistrictId - ID quận/huyện nhận hàng
 * @param {string} params.toWardCode - Mã phường/xã nhận hàng
 * @param {number|string} params.serviceId - ID dịch vụ vận chuyển
 * @returns {Object} - Thông tin thời gian giao hàng đã được format
 */
export const tinhThoiGianGiaoHang = async ({
  fromDistrictId,
  fromWardCode,
  toDistrictId,
  toWardCode,
  serviceId,
}) => {
  try {
    const tokenGHN = TOKEN;
    const response = await axios.post(
      `${GHN_API_URL}/v2/shipping-order/leadtime`,
      {
        from_district_id: 3440,
        from_ward_code:'13008',
        to_district_id: parseInt(toDistrictId),
        to_ward_code: toWardCode,
        service_id: parseInt(serviceId),
      },
      {
        headers: {
          "Content-Type": "application/json",
          Token: tokenGHN,
          ShopId: SHOP_ID,
        },
      }
    );

    return {
      thoiGianGiaoHang: formatDateTime(response.data.data.leadtime),
      ngayTaoDon: formatDateTime(response.data.data.order_date),
    };
  } catch (error) {
    console.error(
      "Lỗi khi tính thời gian giao hàng:",
      error.response?.data || error.message
    );
    throw new Error("Không thể tính thời gian giao hàng");
  }
};
