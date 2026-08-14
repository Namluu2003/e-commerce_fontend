import React, { useState, useEffect } from "react";
import styles from "./CustomerProfile.module.css";
import axios from "axios";
import moment from "moment";
// Import Modal và Drawer nếu chưa import ở đầu file
import {
  Upload,
  DatePicker,
  Input,
  Select,
  Radio,
  Button,
  message,
  Modal,
  Form,
  Avatar,
  Drawer,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import AddressSelectorAntd from "../utils/AddressSelectorAntd"; // Đảm bảo đúng đường dẫn
import { FaMapMarkedAlt } from "react-icons/fa"; // Import icon
import { generateAddressString } from "../../helpers/Helpers.js";
import {toast} from "react-toastify"; // Đảm bảo đúng đường dẫn
import PurchaseOrder from "../../client/PurchaseOrder/PurchaseOrder.jsx";

const { Option } = Select;

const CustomerProfile = () => {
  // --- Trạng thái hiện có ---
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    fullName: "",
    birthDate: "",
    gender: "",
    idNumber: "",
    address: "", // Trường này bây giờ sẽ chứa chuỗi địa chỉ mặc định để hiển thị
    phone: "",
    email: "",
    addresses: [], // Vẫn lưu trữ tất cả các địa chỉ đã lấy về
  });
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user"))
  );
  const [activeMenu, setActiveMenu] = useState("personal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [avatarPublicId, setAvatarPublicId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [fileList, setFileList] = useState([]);
  const [selectedGender, setSelectedGender] = useState(null);
  const [address, setAddress] = useState({
    // State cho địa chỉ MẶC ĐỊNH ở chế độ CHỈNH SỬA
    provinceId: null,
    districtId: null,
    wardId: null,
    specificAddress: null,
  });
  const [defaultAddressId, setDefaultAddressId] = useState(null);
  const [isAddressLoaded, setIsAddressLoaded] = useState(false);
  const [addresses, setAddresses] = useState([]); // State chứa danh sách đầy đủ các đối tượng địa chỉ kèm chuỗi
  const [newAddress, setNewAddress] = useState({
    // State cho form THÊM/SỬA trong Drawer
    provinceId: null,
    districtId: null,
    wardId: null,
    specificAddress: null,
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Cho Drawer chứa Form Thêm/Sửa Địa chỉ
  const [isEditing, setIsEditing] = useState(false); // Drawer có đang ở chế độ Sửa không?
  const [editingAddressId, setEditingAddressId] = useState(null); // ID của địa chỉ đang được sửa trong Drawer

  // --- Trạng thái mới ---
  const [isAddressListModalVisible, setIsAddressListModalVisible] =
    useState(false); // Cho Modal Danh sách Địa chỉ
    useEffect(() => {
      window.scrollTo(0, 0);
    },[])
  useEffect(() => {
    const id = user?.id;
    setCustomerId(id);
    if (id) {
      fetchCustomerData(id);
    } else {
      setError("Customer ID not found.");
      setLoading(false);
    }
  }, []);

  // --- fetchCustomerData (Đã sửa đổi một chút để rõ ràng hơn) ---
  const fetchCustomerData = async (id) => {
    if (!id) {
      console.error("fetchCustomerData called with invalid id:", id);
      setError("Invalid Customer ID provided.");
      return;
    }
    setLoading(true);
    setError(null);
    setIsAddressLoaded(false); // Đặt lại cờ địa chỉ đã tải

    try {
      const response = await axios.get(
        `http://localhost:8080/api/admin/customers/detail/${id}`
      );
      const customerData = response.data;

      // Xử lý tất cả các địa chỉ trước
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
            provinceId: String(el.provinceId || ""), // Đảm bảo là chuỗi cho nhất quán
            districtId: String(el.districtId || ""),
            wardId: String(el.wardId || ""),
            specificAddress: el.specificAddress || "",
          };
        })
      );
      // Sắp xếp địa chỉ để đặt địa chỉ mặc định lên đầu nếu cần, hoặc giữ nguyên thứ tự từ API
      processedAddresses.sort((a, b) => b.isDefault - a.isDefault);
      setAddresses(processedAddresses); // Cập nhật state danh sách đầy đủ

      // Tìm địa chỉ mặc định *từ danh sách đã xử lý*
      const defaultAddress = processedAddresses.find((addr) => addr.isDefault);
      let defaultAddressString = "Chưa có địa chỉ mặc định";
      setDefaultAddressId(null); // Đặt lại ID mặc định

      if (defaultAddress) {
        defaultAddressString = defaultAddress.address;
        setDefaultAddressId(defaultAddress.id);

        // Thiết lập state 'address' được sử dụng bởi AddressSelectorAntd của form CHỈNH SỬA
        setAddress({
          provinceId: defaultAddress.provinceId,
          districtId: defaultAddress.districtId,
          wardId: defaultAddress.wardId,
          specificAddress: defaultAddress.specificAddress,
        });
        setIsAddressLoaded(true); // Đánh dấu địa chỉ mặc định đã được tải cho form chỉnh sửa
      } else {
        // Nếu không có địa chỉ mặc định, xóa state địa chỉ của form chỉnh sửa
        setAddress({
          provinceId: null,
          districtId: null,
          wardId: null,
          specificAddress: null,
        });
        setIsAddressLoaded(true); // Vẫn đánh dấu là đã tải, ngay cả khi trống
      }

      // Ánh xạ phản hồi API vào state formData (sử dụng defaultAddressString)
      const formattedData = {
        fullName: customerData.fullName || "",
        birthDate: customerData.dateBirth
          ? moment(customerData.dateBirth).format("YYYY-MM-DD")
          : "",
        gender:
          customerData.gender === true
            ? "Nam"
            : customerData.gender === false
            ? "Nữ"
            : "",
        idNumber: customerData.citizenId || "",
        address: defaultAddressString, // Hiển thị chuỗi địa chỉ mặc định ở đây
        phone: customerData.phoneNumber || "",
        email: customerData.email || "",
        status: customerData.status === 0 ? "Kích hoạt" : "Ngừng hoạt động",
        // addresses: processedAddresses // Giữ tất cả địa chỉ có sẵn nếu cần ở nơi khác, nhưng formData.address là hiển thị chính
      };
      setFormData(formattedData);

      // Thiết lập dữ liệu cho form chỉnh sửa (editFormData phần lớn vẫn giữ nguyên)
      setEditFormData({
        fullName: customerData.fullName || "",
        birthDate: customerData.dateBirth
          ? moment(customerData.dateBirth)
          : null,
        gender: customerData.gender, // Giữ giá trị boolean/null gốc
        citizenId: customerData.citizenId || "",
        phoneNumber: customerData.phoneNumber || "",
        email: customerData.email || "",
        status: customerData.status,
      });
      setSelectedGender(customerData.gender); // Tiếp tục sử dụng selectedGender cho Radio

      // Xử lý avatar vẫn giữ nguyên
      if (customerData.avatar) {
        setAvatar(customerData.avatar);
        setAvatarPublicId(customerData.avatarPublicId);
        setFileList([
          {
            uid: customerData.avatarPublicId || "-1",
            name: "avatar",
            status: "done",
            url: customerData.avatar,
          },
        ]);
      } else {
        setAvatar(null);
        setAvatarPublicId(null);
        setFileList([]);
      }
    } catch (err) {
      console.error("Error fetching customer data:", err);
      // Kiểm tra xem lỗi có phải từ Axios và có phản hồi không
      if (axios.isAxiosError(err) && err.response) {
        console.error("API Response Data:", err.response.data);
        console.error("API Response Status:", err.response.status);
        console.error("API Response Headers:", err.response.headers);
        setError(
          `Lỗi ${
            err.response.status
          }: Không thể tải thông tin khách hàng. Chi tiết: ${
            err.response.data.message || err.message
          }`
        );
      } else if (err instanceof Error) {
        // Lỗi JavaScript chung
        setError(`Lỗi: Không thể tải thông tin khách hàng. ${err.message}`);
      } else {
        // Xử lý dự phòng cho các lỗi không xác định
        setError("Không thể tải thông tin khách hàng. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Hàm xử lý quản lý địa chỉ ---

  // Mở Drawer để THÊM địa chỉ mới
  const handleAddNewAddressClick = () => {
    setIsEditing(false);
    setEditingAddressId(null);
    setNewAddress({
      // Đặt lại trạng thái form
      provinceId: null,
      districtId: null,
      wardId: null,
      specificAddress: "",
    });
    setIsDrawerOpen(true); // Mở drawer cho form
    // Giữ modal danh sách địa chỉ mở nếu nó đang mở
  };

  // Mở Drawer để SỬA địa chỉ hiện có
  const handleEditAddressClick = (addressToEdit) => {
    setIsEditing(true);
    setEditingAddressId(addressToEdit.id);
    setNewAddress({
      // Điền trước trạng thái form
      provinceId: addressToEdit.provinceId
        ? parseInt(addressToEdit.provinceId)
        : null,
      districtId: addressToEdit.districtId
        ? parseInt(addressToEdit.districtId)
        : null,
      wardId: addressToEdit.wardId ? parseInt(addressToEdit.wardId) : null,
      specificAddress: addressToEdit.specificAddress || "",
    });
    setIsDrawerOpen(true); // Mở drawer cho form
    // Giữ modal danh sách địa chỉ mở nếu nó đang mở
  };

  // Xử lý LƯU từ form Drawer Thêm/Sửa
  const handleSaveAddressFromDrawer = () => {
    if (isEditing) {
      handleUpdateAddress(); // Gọi logic cập nhật
    } else {
      handleAddAddress(); // Gọi logic thêm
    }
  };

  // Gọi API: Thêm Địa chỉ
  const handleAddAddress = async () => {
    if (!customerId) {
      message.error("Lỗi: Không tìm thấy ID khách hàng.");
      return;
    }
    // Xác thực cơ bản
    if (
      !newAddress.provinceId ||
      !newAddress.districtId ||
      !newAddress.wardId ||
      !newAddress.specificAddress?.trim()
    ) {
      message.error("Vui lòng điền đầy đủ thông tin địa chỉ.");
      return;
    }

    setLoading(true); // Chỉ báo trạng thái đang tải nếu muốn
    try {
      const addressPayload = {
        ...newAddress,
        // Đảm bảo ID là số nếu backend yêu cầu
        provinceId: Number(newAddress.provinceId),
        districtId: Number(newAddress.districtId),
        wardId: Number(newAddress.wardId),
      };
      await axios.post(
        `http://localhost:8080/api/admin/customers/add-address/${customerId}`,
        addressPayload
      );
      message.success("Thêm địa chỉ thành công!");
      setIsDrawerOpen(false); // Đóng drawer Thêm/Sửa
      fetchCustomerData(customerId); // Tải lại TẤT CẢ dữ liệu khách hàng để cập nhật danh sách
    } catch (error) {
      console.error(
        "Error adding address:",
        error.response?.data || error.message
      );
      message.error(
        `Thêm địa chỉ thất bại! ${error.response?.data?.message || ""}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Gọi API: Cập nhật Địa chỉ
  const handleUpdateAddress = async () => {
    if (!editingAddressId) {
      message.error("Lỗi: Không tìm thấy ID địa chỉ cần cập nhật.");
      return;
    }
    // Xác thực cơ bản
    if (
      !newAddress.provinceId ||
      !newAddress.districtId ||
      !newAddress.wardId ||
      !newAddress.specificAddress?.trim()
    ) {
      message.error("Vui lòng điền đầy đủ thông tin địa chỉ.");
      return;
    }
    setLoading(true);
    try {
      const addressPayload = {
        ...newAddress,
        // Đảm bảo ID là số nếu backend yêu cầu
        provinceId: Number(newAddress.provinceId),
        districtId: Number(newAddress.districtId),
        wardId: Number(newAddress.wardId),
      };
      await axios.put(
        `http://localhost:8080/api/admin/customers/update-address/${editingAddressId}`,
        addressPayload
      );
      message.success("Cập nhật địa chỉ thành công!");
      setIsDrawerOpen(false); // Đóng drawer Thêm/Sửa
      setEditingAddressId(null); // Đặt lại ID đang sửa
      fetchCustomerData(customerId); // Tải lại TẤT CẢ dữ liệu khách hàng
    } catch (error) {
      console.error(
        "Error updating address:",
        error.response?.data || error.message
      );
      message.error(
        `Cập nhật địa chỉ thất bại! ${error.response?.data?.message || ""}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Gọi API: Đặt Địa chỉ Mặc định
  const handleSetDefaultAddress = (addressId) => {
    if (!addressId) return;
    setLoading(true);
    axios
      .put(
        `http://localhost:8080/api/admin/customers/set-default-address/${addressId}`
      )
      .then(() => {
        toast.success("Đặt làm mặc định thành công!");
        // Không cần cập nhật state thủ công ở đây, fetchCustomerData sẽ xử lý
        fetchCustomerData(customerId); // Tải lại TẤT CẢ dữ liệu
      })
      .catch((error) => {
        console.error(
          "Error setting default address:",
          error.response?.data || error.message
        );
        toast.error(
          `Đặt làm mặc định thất bại! ${error.response?.data?.message || ""}`
        );
        setLoading(false); // Đảm bảo dừng tải khi có lỗi
      });
    // setLoading(false) sẽ được gọi trong khối finally của fetchCustomerData
  };

  // Xử lý thay đổi từ component AddressSelectorAntd (trong Drawer VÀ Form Chỉnh sửa)
  const handleAddressChange = (province, district, ward, specific) => {
    if (editMode) {
      // Nếu đang ở chế độ chỉnh sửa hồ sơ chính, cập nhật state 'address'
      setAddress((prev) => ({
        ...prev,
        provinceId: province ? String(province) : null,
        districtId: district ? String(district) : null,
        wardId: ward ? String(ward) : null,
        specificAddress: specific,
      }));
    } else if (isDrawerOpen) {
      // Nếu Drawer Thêm/Sửa đang mở, cập nhật state 'newAddress'
      setNewAddress((prev) => ({
        ...prev,
        provinceId: province ? String(province) : null, // Lưu trữ dưới dạng chuỗi ban đầu
        districtId: district ? String(district) : null,
        wardId: ward ? String(ward) : null,
        specificAddress: specific,
      }));
    }
  };

  // --- Các hàm hiện có khác (handleMenuClick, getStatusBadge, toggleEditMode, handleFormChange, handleAvatarChange, cloudinaryUpload, customRequest, handleRemove, beforeUpload, saveCustomerData, cancelEdit, renderContent, renderPersonalSection, renderEditForm) ---
  // Những hàm này phần lớn nên giữ nguyên, nhưng đảm bảo `saveCustomerData` xử lý đúng state `address` cho việc cập nhật/thêm địa chỉ mặc định.

  // Hàm trợ giúp để lấy lớp badge trạng thái
  const getStatusBadge = () => {
    // Kiểm tra formData.status được lấy từ customerData.status trong fetchCustomerData
    return formData.status === "Kích hoạt"
      ? styles.statusBadgeActive
      : styles.statusBadgeInactive;
  };

  // Chuyển đổi chế độ chỉnh sửa chính
  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (!editMode) {
      // Vào chế độ chỉnh sửa, đảm bảo state địa chỉ được đồng bộ với địa chỉ mặc định
      const defaultAddr = addresses.find((a) => a.isDefault);
      if (defaultAddr) {
        setAddress({
          provinceId: defaultAddr.provinceId,
          districtId: defaultAddr.districtId,
          wardId: defaultAddr.wardId,
          specificAddress: defaultAddr.specificAddress,
        });
        setIsAddressLoaded(true);
      } else {
        setAddress({
          provinceId: null,
          districtId: null,
          wardId: null,
          specificAddress: null,
        });
        setIsAddressLoaded(true); // Vẫn tải xong, chỉ là trống
      }
    } else {
      // Thoát chế độ chỉnh sửa (hủy), có thể cần tải lại nếu đã thay đổi state địa chỉ
      // fetchCustomerData(customerId); // Tùy chọn tải lại khi hủy
    }
  };

  // Xử lý thay đổi form chính
  const handleFormChange = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Hàm xử lý thay đổi avatar
  const handleAvatarChange = async ({ fileList: newFileList }) => {
    setFileList(newFileList); // Cập nhật danh sách tệp ngay lập tức để phản hồi giao diện người dùng

    // Nếu xóa tệp (danh sách trống)
    if (newFileList.length === 0) {
      // Tùy chọn xử lý xóa ngay lập tức khỏi Cloudinary ở đây nếu cần,
      // nhưng thường được thực hiện trong lúc lưu hoặc qua prop onRemove
      console.log("Avatar cleared, will be removed on save.");
    }
    // Việc tải lên được xử lý tự động bởi customRequest khi một tệp mới được thêm vào
  };

  // Hàm tải lên Cloudinary
  const cloudinaryUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "uploaddatn"); // Thay bằng upload preset của bạn

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dieyhvcou/image/upload", // Thay bằng cloud name của bạn
        formData
      );
      return {
        url: res.data.secure_url,
        public_id: res.data.public_id,
      };
    } catch (error) {
      console.error("Upload failed:", error.response?.data || error.message);
      throw error; // Ném lại lỗi để component Upload bắt được
    }
  };

  // Yêu cầu Tùy chỉnh của Antd Upload
  const customRequest = async ({ file, onSuccess, onError }) => {
    try {
      message.loading({ content: "Đang tải ảnh lên...", key: "uploading" });
      const result = await cloudinaryUpload(file);
      // Thiết lập cấu trúc phản hồi mà object file của component Antd Upload mong đợi
      onSuccess(result, file); // Truyền kết quả (chứa url, public_id)
      message.success({ content: "Tải ảnh lên thành công!", key: "uploading" });
      // Cập nhật fileList với phản hồi từ Cloudinary để xem trước ngay lập tức
      setFileList([
        {
          uid: result.public_id, // Sử dụng public_id làm uid
          name: file.name,
          status: "done",
          url: result.url, // Sử dụng URL Cloudinary
          response: result, // Lưu trữ phản hồi đầy đủ nếu cần
        },
      ]);
    } catch (error) {
      console.error("Custom request error:", error);
      message.error({ content: "Tải ảnh lên thất bại!", key: "uploading" });
      onError(error); // Truyền lỗi lại cho Antd Upload
    }
  };

  // Xử lý Xóa Avatar khỏi Cloudinary (được gọi bởi onRemove)
  const handleRemove = async (file) => {
    // Kiểm tra xem đối tượng file có thông tin cần thiết (public_id/uid) không
    const publicId = file.uid || file.response?.public_id;

    if (!publicId || publicId === "-1") {
      console.log("No public_id found for deletion or it's a placeholder.");
      setFileList([]); // Xóa khỏi danh sách nếu xóa mục giữ chỗ/không hợp lệ
      return true; // Cho phép xóa khỏi danh sách
    }

    // Cập nhật giao diện người dùng lạc quan: xóa khỏi fileList ngay lập tức
    setFileList([]);

    try {
      // Chỉ thử xóa nếu có public_id hợp lệ
      if (publicId && publicId !== "-1") {
        console.log("Attempting to delete image with public_id:", publicId);
        // Gửi yêu cầu đến backend của bạn để xóa khỏi Cloudinary
        await axios.post("http://localhost:8080/cloudinary/delete", {
          public_id: publicId, // Đảm bảo backend của bạn mong đợi 'public_id'
        });
        message.success("Xóa ảnh đại diện thành công!");
        setAvatar(null); // Xóa trạng thái avatar
        setAvatarPublicId(null);
      }
      return true; // Xác nhận xóa
    } catch (error) {
      console.error(
        "Lỗi xóa ảnh từ Cloudinary:",
        error.response?.data || error.message
      );
      message.error("Lỗi xóa ảnh đại diện từ Cloudinary.");
      // Thêm lại tệp vào danh sách nếu xóa thất bại? Có lẽ không, tùy thuộc vào UX mong muốn.
      // setFileList([file]); // Tùy chọn: hoàn tác thay đổi giao diện người dùng khi thất bại
      return false; // Ngăn xóa khỏi danh sách nếu gọi API thất bại? Hay vẫn cho phép? Quyết định UX. Hãy cho phép xóa khỏi danh sách nhưng hiển thị lỗi.
    }
  };

  // Xác thực ảnh trước khi tải lên
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Bạn chỉ có thể tải lên file JPG/PNG!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Ảnh phải nhỏ hơn 2MB!");
    }
    return isJpgOrPng && isLt2M;
  };

  // Lưu Dữ liệu Khách hàng Đã cập nhật (Form Chỉnh sửa Chính)
  const saveCustomerData = async () => {
    try {
      await form.validateFields(); // Validate the form fields
      if (!customerId) {
        message.error("Không tìm thấy ID khách hàng để cập nhật.");
        return;
      }
      setLoading(true);

      // 1. Chuẩn bị Dữ liệu Avatar
      let finalAvatarUrl = avatar; // Bắt đầu với URL avatar hiện có
      let finalAvatarPublicId = avatarPublicId; // Bắt đầu với public ID hiện có

      // Kiểm tra xem avatar mới đã được tải lên (và xử lý thành công bởi customRequest) chưa
      if (
        fileList.length > 0 &&
        fileList[0].status === "done" &&
        fileList[0].response
      ) {
        finalAvatarUrl = fileList[0].response.url;
        finalAvatarPublicId = fileList[0].response.public_id;

        // Nếu avatar mới khác với avatar cũ, và có avatar cũ tồn tại,
        // chúng ta có thể cần xóa avatar cũ khỏi Cloudinary.
        // Điều này giả định hàm `handleRemove` chưa xóa nó.
        if (avatarPublicId && finalAvatarPublicId !== avatarPublicId) {
          console.log(
            `New avatar uploaded (${finalAvatarPublicId}), previous one (${avatarPublicId}) might need deletion if not handled by onRemove.`
          );
          // Cân nhắc thêm logic xóa ở đây nếu `handleRemove` không đảm bảo
          try {
            await axios.post("http://localhost:8080/cloudinary/delete", {
              public_id: avatarPublicId,
            });
            console.log("Old avatar deleted during save.");
          } catch (delError) {
            console.error("Failed to delete old avatar during save:", delError);
            // Quyết định xem điều này có nên chặn việc lưu hay chỉ ghi lại lỗi
          }
        }
      } else if (fileList.length === 0 && avatarPublicId) {
        // Avatar đã bị xóa (fileList trống), và có một avatar hiện có
        console.log(
          `Avatar removed (${avatarPublicId}), should have been deleted by handleRemove. Setting avatar to null.`
        );
        finalAvatarUrl = null;
        finalAvatarPublicId = null;
        // Việc xóa lý tưởng nên xảy ra trong handleRemove, nhưng kiểm tra lại ở đây nếu cần
      }

      // 2. Chuẩn bị Thông tin Cơ bản của Khách hàng
      const customerUpdateData = {
        fullName: editFormData.fullName,
        citizenId: editFormData.citizenId,
        phoneNumber: editFormData.phoneNumber,
        email: editFormData.email,
        gender: selectedGender, // Sử dụng state riêng cho nhóm Radio giới tính
        dateBirth: editFormData.birthDate
          ? editFormData.birthDate.toISOString()
          : null, // Sử dụng định dạng ISO cho backend
        status: editFormData.status,
        avatar: finalAvatarUrl,
        avatarPublicId: finalAvatarPublicId,
      };

      // 3. Cập nhật Thông tin Cơ bản của Khách hàng qua API
      await axios.put(
        `http://localhost:8080/api/admin/customers/update/${customerId}`,
        customerUpdateData
      );
      console.log("Customer basic info updated.");

      // 4. Xử lý Cập nhật/Thêm Địa chỉ Mặc định từ Form Chỉnh sửa
      const hasAddressInput =
        address.provinceId &&
        address.districtId &&
        address.wardId &&
        address.specificAddress?.trim();

      if (defaultAddressId) {
        // CÓ một địa chỉ mặc định hiện có. Chỉ cập nhật nó NẾU các trường đã được thay đổi/điền.
        if (hasAddressInput) {
          const addressPayload = {
            ...address, // Chứa dữ liệu mới nhất từ AddressSelectorAntd qua handleAddressChange
            provinceId: Number(address.provinceId),
            districtId: Number(address.districtId),
            wardId: Number(address.wardId),
            isAddressDefault: true, // Đảm bảo nó vẫn là mặc định
          };
          await axios.put(
            `http://localhost:8080/api/admin/customers/update-address/${defaultAddressId}`,
            addressPayload
          );
          console.log("Existing default address updated.");
        } else {
          console.log(
            "Default address exists, but input fields are empty/incomplete in edit form. No address update performed."
          );
          // Tùy chọn: Xóa địa chỉ mặc định nếu người dùng cố tình xóa các trường?
          // await axios.delete(`http://localhost:8080/api/admin/customers/delete-address/${defaultAddressId}`);
          // message.info("Đã xóa địa chỉ mặc định vì các trường đã bị xóa.");
        }
      } else if (hasAddressInput) {
        // KHÔNG có địa chỉ mặc định hiện có, nhưng người dùng đã điền vào các trường địa chỉ. Thêm nó làm mặc định mới.
        const addressPayload = {
          ...address,
          provinceId: Number(address.provinceId),
          districtId: Number(address.districtId),
          wardId: Number(address.wardId),
          isAddressDefault: true, // Đặt địa chỉ này làm mặc định
        };
        await axios.post(
          `http://localhost:8080/api/admin/customers/add-address/${customerId}`,
          addressPayload
        );
        console.log("New default address added.");
      } else {
        // Không có địa chỉ mặc định tồn tại, và không có thông tin địa chỉ mới nào được cung cấp trong form chỉnh sửa. Không làm gì liên quan đến địa chỉ.
        console.log(
          "No existing default address and no address provided in edit form."
        );
      }

      message.success("Cập nhật thông tin thành công!");
      setEditMode(false);
      fetchCustomerData(customerId); // Tải lại tất cả dữ liệu để đảm bảo tính nhất quán của giao diện người dùng
    } catch (error) {
      console.error(
        "Error updating customer:",
        error.response?.data || error.message
      );
      message.error(
        `Cập nhật thông tin thất bại! ${error.response?.data?.message || ""}`
      );
    } finally {
      setLoading(false); // Đảm bảo dừng tải
    }
  };

  // Hủy Chế độ Chỉnh sửa
  const cancelEdit = () => {
    setEditMode(false);
    // Đặt lại editFormData và các state liên quan để khớp với dữ liệu xem hiện tại
    // Điều này ngăn chặn dữ liệu cũ nếu người dùng chỉnh sửa, hủy, rồi lại chỉnh sửa
    // Tải lại dữ liệu đảm bảo form được đặt lại chính xác
    fetchCustomerData(customerId);
  };

  // --- Hàm Render ---

  const renderContent = () => {
    switch (activeMenu) {
      case "personal":
        return renderPersonalSection();
      // Giữ nguyên các trường hợp khác
      case "financial":
        return (
          <>
            <div className={styles.sectionHeader}>
              <h2>Thông tin tài chính</h2>
            </div>
            <div className={styles.infoCard}>
              <p>Nội dung thông tin tài chính...</p>
            </div>
          </>
        );
      case "history":
        return (
          <>
            <div className={styles.sectionHeader}>
              <h2>Lịch sử mua hàng</h2>
            </div>
            <div className={styles.infoCard}>
             <PurchaseOrder/>
            </div>
          </>
        );
      // Thêm placeholder cho các mục menu khác nếu cần
      case "feedback":
        return (
          <>
            <div className={styles.sectionHeader}>
              <h2>Đánh giá & Phản hồi</h2>
            </div>
            <div className={styles.infoCard}>
              <p>Nội dung đánh giá & phản hồi...</p>
            </div>
          </>
        );
      case "marketing":
        return (
          <>
            <div className={styles.sectionHeader}>
              <h2>Thông tin tiếp thị</h2>
            </div>
            <div className={styles.infoCard}>
              <p>Nội dung thông tin tiếp thị...</p>
            </div>
          </>
        );
      case "preferences":
        return (
          <>
            <div className={styles.sectionHeader}>
              <h2>Sở thích & Nhu cầu</h2>
            </div>
            <div className={styles.infoCard}>
              <p>Nội dung sở thích & nhu cầu...</p>
            </div>
          </>
        );
      case "category":
        return (
          <>
            <div className={styles.sectionHeader}>
              <h2>Phân loại khách hàng</h2>
            </div>
            <div className={styles.infoCard}>
              <p>Nội dung phân loại khách hàng...</p>
            </div>
          </>
        );
      default:
        return (
          <>
            <div className={styles.sectionHeader}>
              <h2>Thông tin cá nhân</h2>
            </div>
            <div className={styles.infoCard}>
              <p>Vui lòng chọn một mục để xem chi tiết.</p>
            </div>
          </>
        );
    }
  };

  const renderPersonalSection = () => {
    // Hàm này phần lớn vẫn giữ nguyên, quyết định giữa renderViewForm và renderEditForm
    return (
      <>
        <div className={styles.sectionHeader}>
          <h2>Thông tin cá nhân</h2>
          {!editMode && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={toggleEditMode}
              // className={styles.editButton}
            >
              Chỉnh sửa
            </Button>
          )}
        </div>

        {loading && !editMode ? ( // Chỉ hiển thị chỉ báo tải khi không ở chế độ chỉnh sửa (chế độ chỉnh sửa có nút tải riêng)
          <div className={styles.loadingIndicator}>Đang tải thông tin...</div>
        ) : error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : (
          <div className={styles.infoCard}>
            {/* Render có điều kiện dựa trên editMode */}
            {editMode ? renderEditForm() : renderViewForm()}
          </div>
        )}
      </>
    );
  };

  // --- renderViewForm (ĐÃ SỬA ĐỔI) ---
  const renderViewForm = () => {
    // formData.address bây giờ chứa chuỗi địa chỉ mặc định từ fetchCustomerData
    const defaultAddressDisplay =
      formData.address || "Chưa có địa chỉ mặc định";

    return (
      <div className={styles.formGrid}>
        {/* Các trường khác giữ nguyên */}
        <div className={styles.formGroup}>
          <label>Họ và tên:</label>
          <div className={styles.formValue}>{formData.fullName || "N/A"}</div>
        </div>
        <div className={styles.formGroup}>
          <label>Ngày sinh:</label>
          <div className={styles.formValue}>{formData.birthDate || "N/A"}</div>
        </div>
        <div className={styles.formGroup}>
          <label>Giới tính:</label>
          <div className={styles.formValue}>{formData.gender || "N/A"}</div>
        </div>
        <div className={styles.formGroup}>
          <label>Số CMND/CCCD:</label>
          <div className={styles.formValue}>{formData.idNumber || "N/A"}</div>
        </div>
        {/* <div className={styles.formGroup}>
          <label>Trạng thái:</label>
          <div className={styles.formValue}>
            <span className={getStatusBadge()}>{formData.status}</span>
          </div>
        </div> */}
        <div className={styles.formGroup}>
          <label>Số điện thoại:</label>
          <div className={styles.formValue}>{formData.phone || "N/A"}</div>
        </div>
        <div className={styles.formGroup}>
          <label>Email:</label>
          <div className={styles.formValue}>{formData.email || "N/A"}</div>
        </div>

        {/* --- Hiển thị Địa chỉ Đã sửa đổi --- */}
        <div className={`${styles.formGroup} ${styles.addressViewContainer}`}>
          <label>Địa chỉ mặc định:</label>
          <div className={styles.addressDisplay}>
            <span
              // className={styles.formValue}
              style={{ marginRight: "10px", flexGrow: 1 }}
            >
              {defaultAddressDisplay}
            </span>
          </div>
          <div>
            <Button
              type="primary"
              icon={<FaMapMarkedAlt />}
              onClick={() => setIsAddressListModalVisible(true)} // Mở modal
              title="Xem và quản lý địa chỉ"
              
            >Xem địa chỉ</Button>
          </div>
        </div>
      </div>
    );
  };

  // --- renderEditForm (Phần Địa chỉ ĐÃ SỬA ĐỔI) ---
  const renderEditForm = () => {
    return (
      <Form
        form={form}
        layout="vertical"
        className={styles.editFormContainer}
        initialValues={{
          fullName: editFormData.fullName,
          birthDate: editFormData.birthDate,
          gender: selectedGender,
          citizenId: editFormData.citizenId,
          phoneNumber: editFormData.phoneNumber,
          email: editFormData.email,
          status: editFormData.status,
        }}
      >
        {/* Phần Chỉnh sửa Avatar - Giữ nguyên */}
        <div className={styles.avatarEditSection}>
          <Upload
            name="avatar" // Quan trọng cho việc gửi form nếu không sử dụng customRequest
            listType="picture-card" // Thay đổi để trực quan hơn
            className="avatar-uploader"
            showUploadList={false} // Ẩn danh sách mặc định, quản lý xem trước thủ công
            customRequest={customRequest} // Xử lý việc tải lên
            beforeUpload={beforeUpload} // Xác thực
            onChange={handleAvatarChange} // Cập nhật state fileList
            onRemove={handleRemove} // Xử lý việc xóa (quan trọng!)
            fileList={fileList} // Kiểm soát component bằng state fileList
          >
            {fileList.length > 0 && fileList[0].url ? (
              <img
                src={fileList[0].url}
                alt="avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : avatar ? ( // Hiển thị avatar hiện có nếu chưa có tệp mới nào được chọn
              <img
                src={avatar}
                alt="avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              // Nội dung nút tải lên
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </div>

        <div className={styles.formGrid}>
          {/* Các trường nhập khác giữ nguyên */}
          <Form.Item
            label="Họ và tên:"
            name="fullName"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
          >
            <Input
              onChange={(e) => handleFormChange("fullName", e.target.value)}
            />
          </Form.Item>
          <Form.Item
            label="Ngày sinh:"
            name="birthDate"
          >
            <DatePicker
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              placeholder="Chọn ngày sinh"
              onChange={(date) => handleFormChange("birthDate", date)}
            />
          </Form.Item>
          <Form.Item
            label="Giới tính:"
            name="gender"
          >
            <Radio.Group
              onChange={(e) => setSelectedGender(e.target.value)}
            >
              <Radio value={true}>Nam</Radio>
              <Radio value={false}>Nữ</Radio>
              <Radio value={null}>Khác</Radio> {/* Tùy chọn */}
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="Số CMND/CCCD:"
            name="citizenId"
            rules={[
              {
                pattern: /^[0-9]{9}$|^[0-9]{12}$/,
                message: "Vui lòng nhập số CMND/CCCD hợp lệ (9 hoặc 12 số)!",
              },
            ]}
          >
            <Input
              onChange={(e) => handleFormChange("citizenId", e.target.value)}
            />
          </Form.Item>
          {/* <div className={styles.formGroup}>
            <label>Trạng thái:</label>
            <Select
              value={editFormData.status} // Gắn với editFormData.status
              onChange={(value) => handleFormChange("status", value)}
              style={{ width: "100%" }}
            >
              <Option value={1}>Kích hoạt</Option>
              <Option value={0}>Khóa</Option>
            </Select>
          </div> */}
          <Form.Item
            label="Số điện thoại:"
            name="phoneNumber"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập số điện thoại!",
              },
              {
                pattern: /^(0[3|5|7|8|9])+([0-9]{8})\b$/,
                message: "Vui lòng nhập số điện thoại hợp lệ!",
              },
            ]}
          >
            <Input
              onChange={(e) => handleFormChange("phoneNumber", e.target.value)}
            />
          </Form.Item>
          <Form.Item
            label="Email:"
            name="email"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập địa chỉ email!",
              },
              {
                type: "email",
                message: "Vui lòng nhập địa chỉ email hợp lệ!",
              },
            ]}
          >
            <Input
              onChange={(e) => handleFormChange("email", e.target.value)}
            />
          </Form.Item>

          {/* Phần Địa chỉ trong Chế độ Chỉnh sửa - Cho Địa chỉ MẶC ĐỊNH */}
          <div
            className={styles.formGroup}
            style={{ gridColumn: "1 / span 2" }}
          >
            <label>Địa chỉ (Mặc định):</label>
            {/* Sử dụng state 'address' chứa chi tiết địa chỉ mặc định */}
            {/* AddressSelectorAntd nên cập nhật state 'address' qua handleAddressChange */}
            {isAddressLoaded ? (
              <AddressSelectorAntd
                // Key được thêm để buộc render lại khi state địa chỉ thay đổi từ bên ngoài (như khi hủy/tải lại)
                key={`${address.provinceId}-${address.districtId}-${address.wardId}`}
                provinceId={
                  address.provinceId ? parseInt(address.provinceId) : undefined
                }
                districtId={
                  address.districtId ? parseInt(address.districtId) : undefined
                }
                wardId={address.wardId ? parseInt(address.wardId) : undefined}
                specificAddressDefault={address.specificAddress || ""}
                onAddressChange={handleAddressChange} // Hàm này cập nhật state 'address'
              />
            ) : (
              <div>Đang tải bộ chọn địa chỉ...</div> // Hoặc một spinner
            )}
           
          </div>
        </div>

        <div className={styles.formActions}>
          <Button type="primary" onClick={saveCustomerData} loading={loading}>
            Lưu thay đổi
          </Button>
          <Button
            onClick={cancelEdit}
            style={{ marginLeft: "10px" }}
            disabled={loading}
          >
            Hủy
          </Button>
        </div>
      </Form>
    );
  };

  // --- JSX Return ---
  return (
    <div className={styles.container} >
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Hồ Sơ Khách Hàng</h1>
      </div>

      <div className={styles.content}>
        {/* Sidebar giữ nguyên */}
        <div className={styles.sidebar} >
          <div className={styles.profileCard}>
            <div className={styles.avatarSection}>
              {/* Hiển thị Avatar */}
              <Avatar
                size={100} // Điều chỉnh kích thước nếu cần
                src={avatar || undefined} // Sử dụng URL avatar từ state
                icon={!avatar && <UserOutlined />} // Icon giữ chỗ
                style={{ marginBottom: "10px" }} // Ví dụ về kiểu dáng
              >
                {/* Dự phòng nếu không có icon và không có src */}
                {!avatar && formData.fullName
                  ? formData.fullName.charAt(0).toUpperCase()
                  : null}
              </Avatar>
              {/*<div className={`${styles.statusBadge} ${getStatusBadge()}`}>*/}
              {/*  {formData.status || "N/A"}*/}
              {/*</div>*/}
            </div>

            <div className={styles.customerInfo}>
              <h3>{formData.fullName || "Khách hàng"}</h3>
              <p>{formData.phone || "Chưa có số điện thoại"}</p>
            </div>

            {/* Mục Menu - cấu trúc đơn giản hóa */}
            <div className={styles.menuItems} style={{minHeight: "30rem"}}>
              {[
                "personal",
                // "financial",
                "history",
                // "feedback",
                // "marketing",
                // "preferences",
                // "category",
              ].map((item) => {
                // Bạn có thể muốn có icon và nhãn phù hợp ở đây
                const labels = {
                  personal: "Thông tin cá nhân",
                  // financial: "Thông tin tài chính",
                  history: "Lịch sử mua hàng",
                  // feedback: "Đánh giá & Phản hồi",
                  // marketing: "Thông tin tiếp thị",
                  // preferences: "Sở thích & Nhu cầu",
                  // category: "Phân loại khách hàng",
                };
                // Thêm icon tương tự nếu cần
                return (
                  <div
                    key={item}
                    className={`${styles.menuItem} ${
                      activeMenu === item ? styles.active : ""
                    }`}
                    onClick={() => setActiveMenu(item)} // Sửa: gọi setActiveMenu trực tiếp
                  >
                    {/* Thêm icon vào đây nếu bạn có */}
                    {labels[item]}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.mainContent}>{renderContent()}</div>
      </div>

      {/* --- Modal Danh sách Địa chỉ --- */}
      <Modal
        title={`Sổ địa chỉ của ${formData.fullName || "Khách hàng"}`}
        open={isAddressListModalVisible}
        onCancel={() => setIsAddressListModalVisible(false)}
        footer={[
          // Footer tùy chỉnh
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddNewAddressClick}
          >
            Thêm địa chỉ mới
          </Button>,
          <Button
            key="close"
            onClick={() => setIsAddressListModalVisible(false)}
          >
            Đóng
          </Button>,
        ]}
        width={700} // Điều chỉnh chiều rộng nếu cần
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
                  padding: "12px 10px", // Increased padding
                  borderRadius: "5px",
                  border: `1px solid ${
                    addressObj.isDefault ? "#1890ff" : "#d9d9d9"
                  }`, // Đánh dấu địa chỉ mặc định
                  marginBottom: "10px",
                  backgroundColor: addressObj.isDefault ? "#e6f7ff" : "#f9f9f9", // Nền tinh tế cho địa chỉ mặc định
                }}
              >
                <span style={{ flex: 1, marginRight: "10px" }}>
                  {addressObj.address}
                  {addressObj.isDefault && (
                    <CheckCircleOutlined
                      style={{ color: "#52c41a", marginLeft: "8px" }}
                      title="Địa chỉ mặc định"
                    />
                  )}
                </span>
                <div>
                  {/* Nút Sửa */}
                  <Button
                    type="default"
                    icon={<EditOutlined />}
                    onClick={() => handleEditAddressClick(addressObj)}
                    style={{ marginLeft: "10px", borderRadius: "5px" }}
                    title="Chỉnh sửa địa chỉ này"
                  />
                  {/* Nút Đặt làm Mặc định - Chỉ hiển thị nếu CHƯA phải là mặc định */}
                  {!addressObj.isDefault && (
                    <Button
                      type="primary" // Hoặc "default" nếu thích
                      ghost // Làm cho nó ít nổi bật hơn nút Thêm Mới
                      onClick={() => handleSetDefaultAddress(addressObj.id)}
                      style={{ marginLeft: "10px", borderRadius: "5px" }}
                      title="Đặt địa chỉ này làm mặc định"
                      loading={loading && editingAddressId === addressObj.id} // Hiển thị tải riêng cho hành động này
                    >
                      Đặt làm mặc định
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* --- Drawer Thêm/Sửa Địa chỉ --- */}
      <Drawer
        title={isEditing ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
        width={380} // Rộng hơn một chút?
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen} // Sử dụng 'open' thay vì 'visible' cho các phiên bản Antd mới hơn
        bodyStyle={{ paddingBottom: 80 }}
        destroyOnClose // Hủy trạng thái form khi đóng để ngăn dữ liệu cũ
        footer={
          // Thêm footer cho các nút
          <div style={{ textAlign: "right" }}>
            <Button
              onClick={() => setIsDrawerOpen(false)}
              style={{ marginRight: 8 }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveAddressFromDrawer}
              type="primary"
              loading={loading}
            >
              {isEditing ? "Lưu thay đổi" : "Thêm địa chỉ"}
            </Button>
          </div>
        }
      >
        {/* Bọc AddressSelectorAntd trong một Form để có thể xác thực trong tương lai */}
        <Form layout="vertical" key={editingAddressId || "new"}>
          {" "}
          {/* Thêm key để buộc mount lại */}
          <Form.Item
            label="Chi tiết địa chỉ"
            name="addressDetail" // Đặt tên cho nó nếu sử dụng Form instance sau này
            // Thêm quy tắc ở đây nếu cần
          >
            {/* Truyền props chính xác dựa trên việc thêm hay sửa */}
            <AddressSelectorAntd
              // Key buộc khởi tạo lại khi mở drawer cho các địa chỉ khác nhau hoặc địa chỉ mới
              key={isEditing ? `edit-${editingAddressId}` : "add"}
              provinceId={
                newAddress.provinceId
                  ? parseInt(newAddress.provinceId)
                  : undefined
              }
              districtId={
                newAddress.districtId
                  ? parseInt(newAddress.districtId)
                  : undefined
              }
              wardId={
                newAddress.wardId ? parseInt(newAddress.wardId) : undefined
              }
              specificAddressDefault={newAddress.specificAddress || ""}
              onAddressChange={handleAddressChange} // Cập nhật state newAddress
            />
          </Form.Item>
          {/* Thêm các trường khác vào form drawer nếu cần */}
        </Form>
        {/* Các nút đã bị xóa khỏi đây, chuyển vào footer của Drawer */}
      </Drawer>
    </div>
  );
};

export default CustomerProfile;
