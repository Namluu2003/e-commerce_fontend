import React, { useState, useEffect } from "react";
import styles from "./PurchaseOrder.module.css";
import {
  apiBuyBack,
  apiCancelBill,
  apiGetAllBillOfCustomerId,
} from "./apiPurchaseOrder";
import { Modal, Radio, Input, Button, Space, message } from "antd";
import { useNavigate } from "react-router-dom";
import { addToCart, getCart } from "../page/cart/cart";
import { toast } from "react-toastify";
import { COLORS } from "../../constants/constants";
import { generateAddressString } from "../../helpers/Helpers";

const { TextArea } = Input;

const PurchaseOrder = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user"))
  );
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [notifications, setNotifications] = useState({
    show: false,
    message: "",
    type: "",
  });
  // Update state for cancel order modal to use antd
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [showCustomReasonInput, setShowCustomReasonInput] = useState(false);

  // Predefined cancel reasons
  const cancelReasons = [
    "Thay đổi địa chỉ giao hàng",
    "Muốn thay đổi phương thức thanh toán",
    "Tìm thấy giá tốt hơn ở nơi khác",
    "Đặt nhầm sản phẩm",
    "Thay đổi ý định mua hàng",
    "Khác (Nhập lý do)",
  ];

  // Define status mapping
  const statusMapping = {
    CHO_XAC_NHAN: {
      id: "pending_confirmation",
      label: "Chờ xác nhận",
      actions: ["cancel"],
    },
    DA_XAC_NHAN: {
      id: "Confirmed",
      label: "Đã xác nhận",
      actions: ["track"],
    },
    CHO_VAN_CHUYEN: {
      id: "waiting_delivery",
      label: "Chờ vận chuyển",
      actions: ["track"],
    },
    DANG_VAN_CHUYEN: {
      id: "Shiping",
      label: "Đang vận chuyển",
      actions: ["track"],
    },
  
    // DANG_CHUAN_BI: {
    //   id: "preparing",
    //   label: "Đang chuẩn bị hàng",
    //   actions: ["contact_seller"],
    // },
    DANG_GIAO: {
      id: "to_receive",
      label: "Đang giao hàng",
      actions: ["track"],
    },
    DA_GIAO_HANG: {
      id: "received",
      label: "Đã Giao hàng",
      actions: ["track"],
    },
    DA_HOAN_THANH: {
      id: "completed",
      label: "Đã hoàn thành",
      actions: ["rate", "buy_again", "contact_seller"],
    },
    DA_HUY: {
      id: "cancelled",
      label: "Đã hủy",
      actions: ["buy_again", "delete"],
    },
    // HOAN_TRA: {
    //   id: "return_refund",
    //   label: "Trả hàng/Hoàn tiền",
    //   actions: ["view_details"],
    // },
    DA_THANH_TOAN: {
      id: "paid",
      label: "Đã thanh toán",
      actions: ["contact_seller"],
    },
  };

  const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "pending_confirmation", label: "Chờ xác nhận" },
    // { id: "paid", label: "Đã thanh toán" },
    // { id: "preparing", label: "Chuẩn bị hàng" },
    { id: "Confirmed", label: "Đã xác nhận" },
    { id: "waiting_delivery", label: "Chờ giao hàng" },
    { id: "Shiping", label: "Đang giao hàng" },
    { id: "received", label: "Đã giao hàng" },
    { id: "paid", label: "Đã thanh toán" },
    { id: "completed", label: "Hoàn thành" },
    { id: "cancelled", label: "Đã hủy" },
    // { id: "return_refund", label: "Trả hàng/Hoàn tiền" },
  ];

  // Fetch orders from API
  useEffect(() => {
    setLoading(true);

    fetchOrders();
  }, [activeTab, searchText, dateFilter]);
  const genAddress = async (address) => {
    // console.log("address", address);
    let addressString = await generateAddressString(
      address?.provinceId, 
      address?.districtId, 
      address?.wardId,
      address?.specificAddress
    );  
    // console.log("addressString", addressString);
    return addressString;
  };
  const fetchOrders = async () => {
    try {
      const pagination = {
        current: 1,
        pageSize: 20,
      };

      const customerId = user?.id;

      // Call the API
      const response = await apiGetAllBillOfCustomerId(pagination, customerId);

      // Debug: Log response to check structure
      console.log("API Response:", response);

      // Process the data correctly according to the API response format
      if (response && response.data) {
        // Transform API response to our order format
        const transformedOrders = await Promise.all(response.data.map(async (orderData) => {
          const statusInfo = statusMapping[orderData.status] || {
            id: "unknown",
            label: "Không xác định",
            actions: ["view_details"],
          };

          // Calculate moneyAfter if null
          const moneyAfter =
            orderData.moneyAfter !== null
              ? orderData.moneyAfter
              : orderData.totalMoney +
                orderData.shipMoney -
                (orderData.discountMoney || 0);

          // Extract billDetailResponse items safely
          const items = Array.isArray(orderData.billDetailResponse)
            ? orderData.billDetailResponse.map((item) => ({
                id: item.productDetailId,
                image: item.image || "https://via.placeholder.com/100",
                name: `Sản phẩm #${item.productDetailId} ${item.productDetailname}`, // Use product ID since name is not in response
                variation: item.size ? `size ${item.size}` : "Mặc định",
                price: item.price,
                quantity: item.quantity,
                productId: item.productId,
                colorId: item.colorId,
                sizeId: item.sizeId
              }))
            : [];

          // Resolve the address
          const address = await genAddress(orderData.addressRequest);

          return {
            id: orderData.id,
            billCode: orderData.billCode,
            status: statusInfo.id,
            statusText: statusInfo.label,
            // Use createDate if available, or fallback
            date: formatDate(new Date()),
            customerName: orderData.customerName || "Khách hàng không xác định",
            email: orderData.email,
            phone: orderData.numberPhone,
            discountMoney: orderData.discountMoney || 0,
            shipMoney: orderData.shipMoney || 0,
            totalMoney: orderData.totalMoney || 0,
            moneyAfter: moneyAfter,
            voucher: orderData.voucher || null,
            items: items,
            actions: statusInfo.actions,
            address: address,
          };
        }));

        // Filter orders based on active tab
        let filteredOrders = transformedOrders;

        if (activeTab !== "all") {
          filteredOrders = transformedOrders.filter(
            (order) => order.status === activeTab
          );
        }

        // Filter by search text
        if (searchText) {
          filteredOrders = filteredOrders.filter(
            (order) =>
              order.billCode.toLowerCase().includes(searchText.toLowerCase()) ||
              order.items.some(
                (item) =>
                  item.name &&
                  item.name.toLowerCase().includes(searchText.toLowerCase())
              )
          );
        }

        // Filter by date
        if (dateFilter !== "all") {
          const today = new Date();
          const monthAgo = new Date();
          monthAgo.setMonth(today.getMonth() - 1);

          if (dateFilter === "recent") {
            filteredOrders = filteredOrders.filter((order) => {
              if (!order.date || order.date === "N/A") return false;

              // Assuming date format is dd/mm/yyyy
              const parts = order.date.split("/");
              if (parts.length !== 3) return false;

              const orderDate = new Date(parts[2], parts[1] - 1, parts[0]);
              return orderDate >= monthAgo;
            });
          }
        }

        setOrders(filteredOrders);
      } else {
        console.error("Unexpected API response format:", response);
        showNotification("Định dạng dữ liệu không đúng", "error");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showNotification("Đã xảy ra lỗi khi tải dữ liệu đơn hàng", "error");
      setLoading(false);
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";

      return `${date.getDate().toString().padStart(2, "0")}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;
    } catch (e) {
      return "N/A";
    }
  };

  // Tab change handler
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  // Search handler
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  // Date filter change handler
  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
  };

  // Notification handler
  const showNotification = (msg, type = "success") => {
    // Using Ant Design message component instead of custom notification
    if (type === "error") {
      message.error(msg);
    } else if (type === "warning") {
      message.warning(msg);
    } else {
      message.success(msg);
    }

    // Keep the original notification state for backward compatibility
    setNotifications({
      show: true,
      message: msg,
      type,
    });

    setTimeout(() => {
      setNotifications({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Action Button handler
  const getActionButton = (action, orderId, billCode,productId,colorId,sizeId) => {
    switch (action) {
      case "pay":
        return (
          <Button
            className={styles.payButton}
            onClick={() => handlePayment(orderId)}
          >
            Thanh toán
          </Button>
        );
      case "cancel":
        return (
          <Button
            className={styles.cancelButton}
            onClick={() => handleCancelOrder(orderId)}
          >
            Hủy đơn
          </Button>
        );
      case "track":
        return (
          <Button
            className={styles.trackButton}
            onClick={() => handleTrackOrder(billCode)}
          >
            Theo dõi
          </Button>
        );
      case "rate":
        return (
          <Button
            className={styles.rateButton}
            onClick={() => handleRateOrder(productId, colorId, sizeId)}
          >
            Đánh giá
          </Button>
        );
      case "buy_again":
        return (
          <Button
            className={styles.buyAgainButton}
            onClick={() => handleBuyAgain(orderId)}
          >
            Mua lại
          </Button>
        );
      case "contact_seller":
        return (
          <Button
            className={styles.contactButton}
            onClick={() => handleContactSeller(orderId)}
          >
            Liên hệ
          </Button>
        );
      case "delete":
        return (
          <Button
            className={styles.deleteButton}
            onClick={() => handleDeleteOrder(orderId)}
          >
            Xóa
          </Button>
        );
      case "view_details":
      default:
        return (
          <Button
            className={styles.viewDetailsButton}
            onClick={() => handleViewDetails(orderId)}
          >
            Chi tiết
          </Button>
        );
    }
  };

  // Placeholder action handlers (implement these as needed)
  const handlePayment = (orderId) => {
    console.log("Processing payment for order:", orderId);
    // Implement payment logic here
    showNotification("Đang chuyển đến trang thanh toán...");
  };

  // Modified Cancel Order handler to show antd modal
  const handleCancelOrder = (orderId) => {
    // window.dispatchEvent(new Event("openChat"));
    // navigate(`products/product-detail/${productId}?colorId=${colorId}&sizeId=${sizeId}`);
    
    // navigate(`/products/product-detail/${productId}?colorId=${colorId}&sizeId=${sizeId}`);

    setCancelOrderId(orderId);
    setCancelReason("");
    setCustomReason("");
    setShowCustomReasonInput(false);
    setShowCancelModal(true);
  };

  // Handle cancel reason selection
  const handleReasonChange = (e) => {
    const selectedReason = e.target.value;
    setCancelReason(selectedReason);
    setShowCustomReasonInput(selectedReason === "Khác (Nhập lý do)");
  };

  // Handle custom reason input
  const handleCustomReasonChange = (e) => {
    setCustomReason(e.target.value);
  };

  // Handle cancel confirmation
  const handleConfirmCancel = async () => {
    const finalReason = showCustomReasonInput ? customReason : cancelReason;

    if (!finalReason) {
      showNotification("Vui lòng chọn lý do hủy đơn hàng", "error");
      return;
    }

    await cancelBill(cancelOrderId, finalReason);
    setShowCancelModal(false);
    // showNotification("Đơn hàng đã được hủy thành công");
  };

  // Close cancel modal
  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
  };

  const handleTrackOrder = (orderId) => {
    console.log("Tracking order:", orderId);
    // Implement tracking logic here
    navigate("/searchbill?billcode=" + orderId);
    // showNotification("Đang theo dõi đơn hàng...");
  };

  const handleRateOrder = (productId,colorId,sizeId) => {
    // console.log("Rating order:", orderId);
    // Implement rating logic here
    navigate(`/products/product-detail/${productId}?colorId=${colorId}&sizeId=${sizeId}`);
  };

  const handleBuyAgain = async (billId) => {
    await buyBack(billId);
    toast.success("Đã thêm sản phẩm vào giỏ hàng");
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleContactSeller = (orderId) => {
    console.log("Contact seller for order:", orderId);
    // Implement contact seller logic here
    // showNotification("Đang kết nối với người bán...");
    window.dispatchEvent(new Event("openChat"));

  };

  const handleDeleteOrder = (orderId) => {
    console.log("Delete order:", orderId);
    // Implement delete logic here
    showNotification("Đơn hàng đã được xóa khỏi lịch sử");
  };

  const handleViewDetails = (orderId) => {
    console.log("View details for order:", orderId);
    // Implement view details logic here
    showNotification("Đang xem chi tiết đơn hàng...");
  };

  // Format price with VND currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(price)
      .replace("₫", "đ");
  };

  // api cancel
  const cancelBill = async (billId, description) => {
    try {
      setLoading(true);
      const res = await apiCancelBill(billId, description);
      console.log("Cancel response:", res?.data);
      fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
      showNotification("Đã xảy ra lỗi khi hủy đơn hàng", "error");
    } finally {
      setLoading(false);
    }
  };
  const buyBack = async (billId) => {
    try {
      setLoading(true);
      const res = await apiBuyBack(billId, user?.id);
      console.log("Cancel response:", res?.data);
      fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
      showNotification("Đã xảy ra lỗi khi mua lại đơn hàng", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Show notification (keeping for backward compatibility) */}
      {notifications.show && (
        <div className={`${styles.notification} ${styles[notifications.type]}`}>
          {notifications.message}
        </div>
      )}

      {/* Ant Design Cancel Order Modal */}
      <Modal
        title="Hủy đơn hàng"
        open={showCancelModal}
        onCancel={handleCloseCancelModal}
        footer={[
          <Button key="back" onClick={handleCloseCancelModal}>
            Đóng
          </Button>,
          <Button key="submit" type="primary" onClick={handleConfirmCancel}>
            Xác nhận hủy đơn
          </Button>,
        ]}
        width={500}
      >
        <p>Vui lòng chọn lý do hủy đơn hàng:</p>
        <Radio.Group
          onChange={handleReasonChange}
          value={cancelReason}
          style={{ width: "100%" }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            {cancelReasons.map((reason, index) => (
              <Radio key={index} value={reason} style={{ marginBottom: "8px" }}>
                {reason}
              </Radio>
            ))}
          </Space>
        </Radio.Group>

        {showCustomReasonInput && (
          <div style={{ marginTop: "16px" }}>
            <TextArea
              placeholder="Nhập lý do của bạn"
              value={customReason}
              onChange={handleCustomReasonChange}
              rows={3}
              style={{ width: "100%" }}
            />
          </div>
        )}
      </Modal>

      <div className={styles.header}>
        <h1 style={{ color: `${COLORS.primary}` }}>Đơn Mua</h1>
      </div>

      <div className={styles.tabContainer}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`${styles.tab} ${
              activeTab === tab.id ? styles.activeTab : ""
            }`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      <div className={styles.filterContainer}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm"
            className={styles.searchInput}
            value={searchText}
            onChange={handleSearch}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>

        <div className={styles.dateFilter}>
          <select
            className={styles.selectInput}
            value={dateFilter}
            onChange={handleDateFilterChange}
          >
            <option value="all">Tất cả ngày</option>
            <option value="recent">1 tháng gần đây</option>
          </select>
        </div>
      </div>

      <div className={styles.ordersList}>
        {loading ? (
          <div className={styles.loading}>Đang tải đơn hàng...</div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            {/* <img
              src="https://placehold.co/100"
              alt="Empty"
              className={styles.emptyImg}
            /> */}
            <p>Không tìm thấy đơn hàng nào</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className={styles.orderCard}
              style={{ borderLeft: `4px solid ${COLORS.primary}` }}
            >
              <div className={styles.orderHeader}>
                <div className={styles.shopInfo}>
                  <span className={styles.shopName}>
                    Mã đơn hàng: {order.billCode}- Ngày đặt hàng: {order.date}
                  </span>
                </div>
                <div className={styles.orderStatus}>
                  <span className={styles.orderStatusText}>
                    {order.statusText}
                  </span>
                </div>
              </div>

              <div className={styles.divider}></div>

              {order.items.map((item, index) => (
                <div key={index} className={styles.orderItem}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.itemImage}
                  />
                  <div className={styles.itemDetails}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemVariation}>
                      Phân loại: {item.variation}
                    </div>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemPrice}>
                        {formatPrice(item.price)}
                      </span>
                      <span className={styles.itemQuantity}>
                        x{item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className={styles.divider}></div>
              <div className={"px-2"}>
               <b> Địa chỉ nhận hàng:</b> {order.address}
              </div>

              <div className={styles.orderFooter}>
                <span className={styles.orderTotal}>
                  <span className={styles.totalLabel}>Tiền ship:</span>
                  <span className={styles.totalPrice}>
                    {formatPrice(order.shipMoney)}
                  </span>
                </span>
                <div className={styles.orderTotal}>
                  <span className={styles.totalLabel}>Tổng số tiền:</span>
                  <span className={styles.totalPrice}>
                    {formatPrice(order.moneyAfter)}
                  </span>
                </div>
                <div className={styles.orderActions}>
                  {order.actions.map((action, index) => (
                    <span key={index} className={styles.actionButton}>
                      {getActionButton(action, order.id, order.billCode, order.items[0].productId,order.items[0].colorId,order.items[0].sizeId)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PurchaseOrder;
