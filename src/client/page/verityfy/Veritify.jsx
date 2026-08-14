import React, { useEffect, useState } from "react";
import styles from "./Veritify.module.css";
import {
  FaSearch,
  FaShoppingBag,
  FaTruck,
  FaRegCreditCard,
  FaRegCalendarAlt,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaUser,
  FaCheck,
  FaInfoCircle,
  FaTimesCircle,
  FaBoxOpen,
  FaMoneyBillWave,
  FaExchangeAlt,
} from "react-icons/fa";
import { apiSearchBill, apiVeritify } from "./veritify";
import { message } from "antd"; // Make sure this is properly imported
import { generateAddressString } from "../../componetC/apiGHN";
import { COLORS } from "../../../constants/constants";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const veritify = () => {
  const [searchParams] = useSearchParams(); // Lấy query parameters từ URL
  const billCode = searchParams.get("billcode");
  const paymentMethod = searchParams.get("paymentmethod");

  const [billId, setBillId] = useState(billCode);
  const [billData, setBillData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [address, setFullAddress] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    searchBill(billId);
  }, [billCode]);
  const searchBill = async (billCode) => {
    try {
      setIsLoading(true);
      const res = await apiSearchBill({ billCode: billCode });
      setBillData(res.data);
      setSearchPerformed(true);
      generateAddressString(
        res.data.addressRequest.provinceId,
        res.data.addressRequest.districtId,
        res.data.addressRequest.wardId,
        res.data.addressRequest.specificAddress
      ).then((address) => {
        setFullAddress(address);
      });
      console.log("real price", res.data);
    } catch (error) {
      // message.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
      setBillData(null);
      setSearchPerformed(true);
    } finally {
      setIsLoading(false);
    }
  };
  const veritify = async (billCode) => {
    try {
      setIsLoading(true);
      const res = await apiVeritify({ billCode: billCode });
      console.log("veritify", res.data);
      toast.success("xác minh danh tính thành công")
      if (paymentMethod === "ZALO_PAY") {
        window.location.href = res.data; // Chuyển hướng người dùng ngay lập tức
      }else if(paymentMethod === "COD"){
        navigate(
          `/success?status=1&amount=${billData.moneyAfter.toLocaleString()}&apptransid=ShipCod&billcode=${billCode}`
        );
      }
    } catch (error) {
      // message.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
      setSearchPerformed(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    veritify(billId);
  };

  // Updated function to handle new status codes
  const getStatusText = (statusCode) => {
    switch (statusCode) {
      case "CHO_XAC_NHAN":
        return "Chờ xác nhận";
      case "DA_XAC_NHAN":
        return "Đã xác nhận";
      case "CHO_VAN_CHUYEN":
        return "Chờ vận chuyển";
      case "DANG_VAN_CHUYEN":
        return "Đang vận chuyển";
      case "DA_THANH_TOAN":
        return "Đã thanh toán";
      case "DA_HOAN_THANH":
        return "Đã hoàn thành";
      case "DA_HUY":
        return "Đã hủy";
      case "TRA_HANG":
        return "Trả hàng";
      default:
        return statusCode;
    }
  };

  // Updated function to determine status class for styling
  const getStatusClass = (status) => {
    switch (status) {
      case "CHO_XAC_NHAN":
        return styles.statusPending;
      case "DA_XAC_NHAN":
        return styles.statusConfirmed;
      case "CHO_VAN_CHUYEN":
        return styles.statusAwaitingShipment;
      case "DANG_VAN_CHUYEN":
        return styles.statusShipping;
      case "DA_THANH_TOAN":
        return styles.statusPaid;
      case "DA_HOAN_THANH":
        return styles.statusCompleted;
      case "DA_HUY":
        return styles.statusCancelled;
      case "TRA_HANG":
        return styles.statusReturned;
      default:
        return "";
    }
  };

  // Updated function to determine status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "CHO_XAC_NHAN":
        return <FaInfoCircle />;
      case "DA_XAC_NHAN":
        return <FaCheck />;
      case "CHO_VAN_CHUYEN":
        return <FaBoxOpen />;
      case "DANG_VAN_CHUYEN":
        return <FaTruck />;
      case "DA_THANH_TOAN":
        return <FaMoneyBillWave />;
      case "DA_HOAN_THANH":
        return <FaCheck />;
      case "DA_HUY":
        return <FaTimesCircle />;
      case "TRA_HANG":
        return <FaExchangeAlt />;
      default:
        return <FaInfoCircle />;
    }
  };

  // Calculate product item total price
  const calculateItemTotal = (price, quantity) => {
    return price * quantity;
  };

  // Updated function to render the progress bar based on new status codes
  const renderProgressBar = (status) => {
    const steps = [
      { key: "order", label: "Đặt hàng", icon: <FaShoppingBag /> },
      { key: "confirm", label: "Xác nhận", icon: <FaCheck /> },
      { key: "ship", label: "Vận chuyển", icon: <FaTruck /> },
      { key: "complete", label: "Hoàn thành", icon: <FaCheck /> },
    ];

    let activeStep = -1;
    if (status === "DA_HUY" || status === "TRA_HANG") {
      // For cancelled or returned orders, only the first step is active
      activeStep = 0;
    } else if (status === "CHO_XAC_NHAN") {
      activeStep = 0;
    } else if (status === "DA_XAC_NHAN" || status === "CHO_VAN_CHUYEN") {
      activeStep = 1;
    } else if (status === "DANG_VAN_CHUYEN") {
      activeStep = 2;
    } else if (status === "DA_THANH_TOAN" || status === "DA_HOAN_THANH") {
      activeStep = 3;
    }

    return (
      <div className={styles.billProgress}>
        {steps.map((step, index) => (
          <React.Fragment key={step.key}>
            <div
              className={`${styles.progressStep} ${
                index <= activeStep ? styles.progressActive : ""
              }`}
            >
              <div className={styles.progressIcon}>{step.icon}</div>
              <div className={styles.progressText}>{step.label}</div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`${styles.progressLine} ${
                  index < activeStep ? styles.progressActive : ""
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.searchBillContainer} style={{ minHeight: "600px" }}>
      <div className={styles.pageHeader}>
        <h1
          className={styles.pageTitle}
          style={{
            color: `${COLORS.primary}`,
          }}
        >
          Tra cứu đơn hàng
        </h1>
        <p className={styles.pageSubtitle}>
          Kiểm tra thông tin và trạng thái đơn hàng của bạn
        </p>
      </div>

      <div className={styles.searchForm}>
        <form onSubmit={handleSearch}>
          <div className={styles.inputGroup}>
            {/* <div className={styles.inputWrapper}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Nhập mã hóa đơn của bạn (ví dụ: HD-71D2F28A)"
                value={billId}
                onChange={(e) => setBillId(e.target.value)}
                className={styles.searchInput}
              />
            </div> */}
            {billData?.status==="DANG_XAC_MINH"&&(
              <button
              type="submit"
              className={styles.searchButton}
              style={{ backgroundColor: `${COLORS.primary}` }}
            >
              Xác Minh đơn Hàng
            </button>

            )}
            
          </div>
        </form>
        {/* <div className={styles.searchTips}>
          <p>
            Gợi ý: Nhập mã hóa đơn HD-71D2F28A, HD-82E3G39B được gửi về mail khi
            đặt hàng
          </p>
        </div> */}
      </div>

      {isLoading && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Đang tìm kiếm hóa đơn...</p>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      {searchPerformed && !billData && !isLoading && (
        <div className={styles.noResultsContainer}>
          <FaInfoCircle className={styles.noResultsIcon} />
          <p className={styles.noResultsText}>
            Không tìm thấy hóa đơn với mã {billId}. Vui lòng kiểm tra lại mã hóa
            đơn của bạn.
          </p>
        </div>
      )}

      {billData && (
        <div className={styles.billContainer}>
          <div className={styles.billHeader}>
            <div className={styles.billHeaderLeft}>
              <h2
                style={{
                  color: `${COLORS.primary}`,
                }}
              >
                Hóa đơn #{billData.billCode}
              </h2>
              <div className={styles.billMeta}>
                <div className={styles.metaItem}>
                  <FaRegCalendarAlt className={styles.metaIcon} />
                  <span>Ngày đặt: {billData.orderDate}</span>
                </div>
                <div className={styles.metaItem}>
                  <FaTruck className={styles.metaIcon} />
                  <span>Giao hàng: {billData.deliveryDate}</span>
                </div>
              </div>
            </div>
            <div className={styles.billHeaderRight}>
              <span
                className={`${styles.statusBadge} ${getStatusClass(
                  billData.status
                )}`}
              >
                {getStatusIcon(billData.status)}{" "}
                {getStatusText(billData.status)}
              </span>
            </div>
          </div>

          <div className={styles.billProgressContainer}>
            {renderProgressBar(billData.status)}
          </div>

          <div className={styles.billDetails}>
            <div className={styles.detailSection}>
              <h3
                style={{
                  color: `${COLORS.primary}`,
                }}
              >
                <FaUser
                  className={styles.sectionIcon}
                  style={{
                    color: `${COLORS.primary}`,
                  }}
                />
                Thông tin khách hàng
              </h3>
              <div className={styles.detailContent}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Người nhận:</span>
                  <span className={styles.detailValue}>
                    {billData.customerName}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>
                    <FaEnvelope className={styles.inlineIcon} /> Email:
                  </span>
                  <span className={styles.detailValue}>{billData.email}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>
                    <FaPhoneAlt className={styles.inlineIcon} /> Số điện thoại:
                  </span>
                  <span className={styles.detailValue}>
                    {billData.numberPhone}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>
                    <FaMapMarkerAlt className={styles.inlineIcon} /> Địa chỉ ID:
                  </span>
                  <span className={styles.detailValue}> {address}</span>
                </div>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h3
                style={{
                  color: `${COLORS.primary}`,
                }}
              >
                <FaRegCreditCard
                  className={styles.sectionIcon}
                  style={{
                    color: `${COLORS.primary}`,
                  }}
                />
                Thông tin thanh toán
              </h3>
              <div className={styles.detailContent}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Phương thức:</span>
                  <span className={styles.detailValue}>
                    {billData.payment || "Chưa thanh toán"}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Loại đơn:</span>
                  <span className={styles.detailValue}>
                    {billData.typeBill}
                  </span>
                </div>
                {billData.voucher && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Voucher:</span>
                    <span className={styles.detailValue}>
                      <span className={styles.voucherCode}>
                        {billData.voucher}
                      </span>
                      <span className={styles.voucherDiscount}>
                        -{billData.discountMoney.toLocaleString()}đ
                      </span>
                    </span>
                  </div>
                )}
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Ghi chú:</span>
                  <span className={styles.detailValue}>
                    {billData.notes || "Không có"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.productSection}>
            <h3
              style={{
                color: `${COLORS.primary}`,
              }}
            >
              <FaShoppingBag
                className={styles.sectionIcon}
                style={{
                  color: `${COLORS.primary}`,
                }}
              />
              Sản phẩm đã mua
            </h3>
            <div className={styles.productList}>
              {billData.billDetailResponse.map((product) => (
                <div
                  key={product.productDetailId}
                  className={styles.productItem}
                >
                  <div className={styles.productImage}>
                    <img
                      src={product.image}
                      alt={`Sản phẩm ${product.productDetailId}`}
                    />
                  </div>
                  <div className={styles.productInfo}>
                    <h4>Sản phẩm ID: {product.productDetailId}</h4>
                    <div className={styles.productPriceInfo}>
                      <span className={styles.productPrice}>
                        {product.price.toLocaleString()}đ
                      </span>
                      <span className={styles.productQuantity}>
                        x{product.quantity}
                      </span>
                    </div>
                  </div>
                  <div className={styles.productTotal}>
                    {calculateItemTotal(
                      product.price,
                      product.quantity
                    ).toLocaleString()}
                    đ
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.billSummary}>
            {billData.discountMoney > 0 && (
              <div className={styles.summaryRow}>
                <span>Giảm giá:</span>
                <span className={styles.discountAmount}>
                  -{billData.discountMoney.toLocaleString()}đ
                </span>
              </div>
            )}
            <div className={styles.summaryRow}>
              <span>Tổng tiền hàng:</span>
              <span>{billData.totalMoney.toLocaleString()}đ</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Phí vận chuyển:</span>
              <span>{billData.shipMoney.toLocaleString()}đ</span>
            </div>

            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span
                style={{
                  color: `${COLORS.primary}`,
                }}
              >
                Tổng thanh toán:
              </span>
              <span
                style={{
                  color: `${COLORS.primary}`,
                }}
              >
                {billData.moneyAfter.toLocaleString()}đ
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default veritify;
