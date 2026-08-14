import { baseUrl } from "../../../helpers/Helpers.js";
import { Button, Flex, Modal, Space } from "antd";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaAddressBook, FaAddressCard, FaMapMarkedAlt } from "react-icons/fa";
import { CheckCircleOutlined } from "@ant-design/icons";
import styles from "./CartPage.module.css"; // Đường dẫn đến file CSS của bạn
import { generateAddressString } from "../../componetC/apiGHN";
import {
  FcAddressBook,
  FcBookmark,
  FcNook,
  FcViewDetails,
} from "react-icons/fc";
import { COLORS } from "../../../constants/constants";

function AddressSelectDefault({
  customerId,
  formData,
  onDefaultAddressChange,
}) {
  const [address, setAddress] = useState({
    provinceId: null,
    districtId: null,
    wardId: null,
    specificAddress: null,
  });

  const [isAddressLoaded, setIsAddressLoaded] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [defaultAddressId, setDefaultAddressId] = useState(null);
  const [isAddressListModalVisible, setIsAddressListModalVisible] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [defaultAddressDisplay, setDefaultAddressDisplay] = useState(
    "Chưa có địa chỉ mặc định"
  );

  // Dummy function, bạn cần thay bằng thực tế từ API hoặc utils

  const fetchCustomerData = async (id) => {
    if (!id) {
      console.error("fetchCustomerData called with invalid id:", id);
      return;
    }

    setLoading(true);
    setIsAddressLoaded(false);

    try {
      // 🟡 Gọi API lấy thông tin khách hàng
      const response = await axios.get(
        `${baseUrl}/api/admin/customers/detail/${id}`
      );
      const customerData = response.data;
      const processedAddresses = await Promise.all(
        (customerData.addresses || []).map(async (el) => {
          const addressString = await generateAddressString(
            el.provinceId,
            el.districtId,
            el.wardId,
            el.specificAddress
          );
          return {
            id: el.id,
            address: addressString,
            isDefault: el.isAddressDefault,
            provinceId: String(el.provinceId || ""),
            districtId: String(el.districtId || ""),
            wardId: String(el.wardId || ""),
            specificAddress: el.specificAddress || "",
            createdAt: new Date(el.createdAt),
          };
        })
      );

      processedAddresses.sort((a, b) => b.isDefault - a.isDefault);
      setAddresses(processedAddresses);

      const defaultAddress = processedAddresses.find((addr) => addr.isDefault);
      setDefaultAddressId(defaultAddress?.id || null);

      if (defaultAddress) {
        setDefaultAddressDisplay(defaultAddress.address);
        setAddress({
          provinceId: defaultAddress.provinceId,
          districtId: defaultAddress.districtId,
          wardId: defaultAddress.wardId,
          specificAddress: defaultAddress.specificAddress,
        });
      } else {
        setDefaultAddressDisplay("Chưa có địa chỉ mặc định");
        setAddress({
          provinceId: null,
          districtId: null,
          wardId: null,
          specificAddress: null,
        });
      }

      setIsAddressLoaded(true);
    } catch (err) {
      console.error("Error fetching customer data:", err);
      toast.error(
        `Lỗi khi tải địa chỉ: ${
          err.response?.data?.message || "Có lỗi xảy ra!"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomerData(customerId);
    }
  }, [customerId]);

  const handleSetDefaultAddress = (addressId) => {
    if (!addressId) return;

    setLoading(true);

    axios
      .put(
        `${baseUrl}/api/admin/customers/set-default-address/${addressId}`
      )
      .then(() => {
        toast.success("Chọn địa chỉ thành công!");
        fetchCustomerData(customerId); // ✅ Reload lại danh sách địa chỉ

        // ✅ Gọi callback để thông báo cho component cha
        if (onDefaultAddressChange) {
          onDefaultAddressChange();
        }
      })
      .catch((error) => {
        console.error("Lỗi đặt địa chỉ mặc định:", error);
        toast.error(
          `Đặt làm mặc định thất bại! ${error.response?.data?.message || ""}`
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      {customerId && (
        <div className={`${styles.formGroup} ${styles.addressViewContainer}`}>
          {/* <label>Địa chỉ mặc định:</label>
        <div className={styles.addressDisplay}>
          <span style={{ marginRight: "10px", flexGrow: 1 }}>
            {defaultAddressDisplay}
          </span>
        </div> */}
          <div>
            {/* <FcViewDetails size={30} /> */}
            <Button
              type="primary"
              // icon={<FaAddressBook />}
              onClick={() => setIsAddressListModalVisible(true)}
              title="Xem và quản lý địa chỉ"
            >
              Chọn địa chỉ đã mua
            </Button>
          </div>
        </div>
      )}

      {/* --- Modal Danh sách Địa chỉ --- */}
      <Modal
        title={`Địa chỉ của ${formData?.fullName || "Khách hàng"}`}
        open={isAddressListModalVisible}
        onCancel={() => setIsAddressListModalVisible(false)}
        footer={[
          <Flex
            style={{
              display: "flex",
              justifyContent: "space-between",
              //   alignItems: "center",
            }}
          >
            <Space
              size={10}
              style={{
                fontStyle: "italic",
              }}
            >
              Địa chỉ đã chọn sẽ được dùng cho các lần mua sau.
            </Space>

            <Button
              type="primary"
              key="close"
              onClick={() => setIsAddressListModalVisible(false)}
            >
              Đóng
            </Button>
          </Flex>,
        ]}
        width={700}
      >
        <div
          style={{
            maxHeight: "400px",
            overflowY: "auto",
            marginBottom: "20px",
          }}
        >
          {addresses.length === 0 ? (
            <p>Không có địa chỉ nào.</p>
          ) : (
            addresses.map((addressObj) => (
              <div
                key={addressObj.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 10px",
                  borderRadius: "5px",
                  border: `1px solid ${
                    addressObj.isDefault ? `${COLORS.primary}` : "#d9d9d9"
                  }`,
                  marginBottom: "10px",
                  backgroundColor: addressObj.isDefault
                    ? `${COLORS.backgroundcolor2}`
                    : "#ffffff",
                }}
              >
                <span style={{ flex: 1, marginRight: "10px" }}>
                  {addressObj.address}
                  {addressObj.isDefault && (
                    <CheckCircleOutlined
                      style={{ color: "#52c41a", marginLeft: "8px",fontSize: "20px" }}
                      title="Địa chỉ mặc định"
                    />
                  )}
                </span>
                <div>
                  {!addressObj.isDefault && (
                    <Button
                      type="primary"
                      //   ghost
                      onClick={() => handleSetDefaultAddress(addressObj.id)}
                      style={{ marginLeft: "10px", borderRadius: "5px" }}
                      title="Đặt địa chỉ này làm mặc định"
                      loading={loading && defaultAddressId === addressObj.id}
                    >
                      Chọn
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </>
  );
}

export default AddressSelectDefault;
