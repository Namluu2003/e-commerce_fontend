import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  InputNumber,
  Typography,
  Input,
  Space,
  message,
  Col,
  Row,
  Flex,
  Popconfirm,
  notification,
  Select,
} from "antd";
import styles from "./CartPage.module.css";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { VscTag } from "react-icons/vsc";
import { COLORS } from "../../../constants/constants";
import { Content } from "antd/es/layout/layout";
import { FaRegTrashCan } from "react-icons/fa6";
import { getCart, getDeviceId, removeFromCart } from "./cart";
import { addToBill, clearBill, getBill } from "./bill";
import { useProduct } from "../../../store/ProductContext";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { set, size } from "lodash";
import axios from "axios";
import {
  apiFindVoucherValid,
  apiGetRealPrice,
  apiSetQuantityCart,
  apiVoucherBest,
} from "./apiCart";
import { addToVoucher } from "./voucher";
import { LuTicket } from "react-icons/lu";
import { apiGetFreeShip } from "./apiPayment";

const { Title, Text } = Typography;

const CartPage = () => {
  const navigate = useNavigate();
  const { updateProducts } = useProduct();
  const [selectedRitem, setSelecteditem] = useState([]);
  const [voucherValid, setVoucherValid] = useState([]);
  const [voucherBests, setVoucherBest] = useState([]);

  const [discountCode, setDiscountCode] = useState();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState(0);
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [products, setProducts] = useState(getCart());
  const [productsRealPrice, setProductsRealPrice] = useState([]);
  const [minOrderValue, setMinOrderValue] = useState(0);

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user"))
  ); // Lấy user từ localStorage
  const [pageCart, setPageCart] = useState({
    current: 1,
    pageSize: 10,
  });
  useEffect(() => {
    vouchersValid();
    voucherBest();
    // fetchCart();
  }, [selectedRowKeys, products]);
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCart();
    };

    // Đăng ký sự kiện khi localStorage thay đổi hoặc giỏ hàng cập nhật
    window.addEventListener("cartUpdated", handleCartUpdate);

    // Fetch ngay khi component mount
    fetchCart();
    apiGetFreeShip().then((res) => {
      setMinOrderValue(res);
    });
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);

      console.log("Thêm vào bill khi unmount", getBill());
      // clearBill(); // Nếu cần xóa bill khi unmount
    };
  }, [user?.id]); // Chỉ phụ thuộc vào user.id

  const fetchCart = async () => {
    if (user?.id) {
      // Đảm bảo user có id

      try {
        const response = await axios.get(
          "http://localhost:8080/api/client/getallcartforcustomerid",
          {
            params: {
              customerId: user.id,
              page: pageCart.current,
              size: pageCart.pageSize,
            },
          }
        );

        setProducts(response.data?.data || []);
        await getRealPrice(response.data?.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng:", error);
        setProducts([]);
      }
    } else {
      const localCart = getCart();
      setProducts(localCart);
      getRealPrice(localCart);
    }
  };
  const vouchersValid = async () => {
    try {
      const res = await apiFindVoucherValid({ customerId: user?.id });
      setVoucherValid(res.data);
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
    }
  };
  const voucherBest = async () => {
    try {
      const res = await apiVoucherBest({
        customerId: user?.id,
        totalBillMoney: totalSelectedPrice,
      });
      setVoucherBest(res.data);
      setDiscountCode(res.data?.voucher?.id);
      setDiscount(0);
      setAppliedDiscount("");
      console.log("vocher", res.data?.voucher?.id);
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
    }
  };
  const getRealPrice = async (listcart) => {
    try {
      const res = await apiGetRealPrice(listcart);
      setProductsRealPrice(res.data);
      console.log("real price", res.data);
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
    }
  };
  const deleteItemInCart = async (cartDetailId) => {
    try {
      const response = await axios.delete(
        `http://localhost:8080/api/client/delete/${cartDetailId}`
      );
      fetchCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Lỗi khi xóa", error);
    }
  };
  const handleRemoveFromCart = (productDetailId) => {
    // Lọc bỏ sản phẩm đã xóa khỏi giỏ hàng
    const updatedProducts = products.filter(
      (product) => product.productDetailId !== productDetailId
    );

    setProducts(updatedProducts); // Cập nhật lại danh sách sản phẩm
    localStorage.setItem(
      `cart_${getDeviceId()}`,
      JSON.stringify(updatedProducts)
    );
    window.dispatchEvent(new Event("cartUpdated"));

    // Cập nhật lại danh sách sản phẩm đã chọn
    // láy những sp ko giống với sp đã xóa và set lại
    const updatedSelectedKeys = selectedRowKeys.filter(
      (index) => products[index]?.productDetailId !== productDetailId
    );
    setSelectedRowKeys(updatedSelectedKeys);
  };

  const handleQuantityChange = async (index, value, quantity) => {
    if (value < 1) return; // Đảm bảo không có số lượng nhỏ hơn 1
    if (value > quantity) {
      toast.warn("Số lượng mua ko được quá số lượng của của hàng");
      return;
    }
    if (user) {
      try {
        try {
          const res = await apiSetQuantityCart({
            cartDetailid: products[index]?.cartDetailId,
            quantity: value,
          });
          console.log("số lượng ", res);
          fetchCart();
        } catch (error) {
          toast.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
        }
      } catch (error) {}
    } else {
      const updatedProducts = [...products];
      updatedProducts[index].quantityAddCart = value;

      setProducts(updatedProducts); // Cập nhật state
      localStorage.setItem(
        `cart_${getDeviceId()}`,
        JSON.stringify(updatedProducts)
      ); // Lưu lại vào localStorage
    }
  };

  const applyDiscount = () => {
    const selectedVoucher = voucherValid.find((v) => v.id === discountCode);
    if (!selectedVoucher) {
      setDiscount(0);
      setAppliedDiscount(null);
      toast.error("Mã giảm giá không hợp lệ!");
      return;
    }

    const {
      voucherCode,
      discountValue,
      discountType,
      discountMaxValue,
      billMinValue,
    } = selectedVoucher;
    if (totalSelectedPrice < billMinValue) {
      toast.error(
        "Giá trị đơn hàng chưa đạt mức tối thiểu để áp dụng voucher!"
      );
      return;
    }

    let discountAmount = 0;
    if (discountType === "PERCENT") {
      discountAmount = (totalSelectedPrice * discountValue) / 100;
      discountAmount = Math.min(discountAmount, discountMaxValue);
      setDiscountType("PERCENT");
    } else if (discountType === "MONEY") {
      discountAmount = Math.min(discountValue, totalSelectedPrice);
      setDiscountType("MONEY");
    }

    setDiscount(discountAmount);
    setAppliedDiscount(
      `Mã ${voucherCode} - Giảm ${discountAmount.toLocaleString()} đ`
    );
    toast.success("Mã giảm giá đã được áp dụng!");
  };

  const totalSelectedPrice = selectedRowKeys.reduce((acc, index) => {
    const record = products[index];
    if (!record || !record.productDetailId || !record.quantityAddCart) {
      return acc;
    }

    const realPriceItem = productsRealPrice.find(
      (item) => item.productDetailId === record.productDetailId
    );

    const originalPrice = Number(record.price) || 0;
    const displayPrice = realPriceItem?.price
      ? Number(realPriceItem.price)
      : originalPrice;

    // const itemTotal = displayPrice * record.quantityAddCart;
    // lấy ra số lượng thật
    const quantity = Math.min(
      record.quantityAddCart,
      realPriceItem?.quantity
    );
  // set lại số lượng 
    // handleQuantityChange(index, quantity, realPriceItem.quantity);
    const itemTotal = displayPrice * quantity;

    return acc + itemTotal;
  }, 0);

  const calculateDiscountedTotal = () => totalSelectedPrice - discount;
  const discountedTotal = calculateDiscountedTotal();

  useEffect(() => {
    if (selectedRowKeys.length === 0) return;

    const selectedItems = products.filter((_, index) =>
      selectedRowKeys.includes(index)
    );
    setSelecteditem(selectedItems);
  }, [selectedRowKeys, products]);

  const isProductDisabled = (productDetailId) => {
    const realPriceItem = productsRealPrice.find(
      (item) => item.productDetailId === productDetailId
    );
    return realPriceItem?.status === "NGUNG_HOAT_DONG";
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      const validKeys = selectedKeys.filter(
        (key) => !isProductDisabled(products[key]?.productDetailId)
      );
      setSelectedRowKeys(validKeys);
    },
    getCheckboxProps: (record) => ({
      disabled: isProductDisabled(record.productDetailId),
      name: record.productName,
    }),
  };
  const columns = [
    {
      title: "ẢNH",
      dataIndex: "",
      key: "product",
      render: (_, record) => (
            <img
                src={
                  record.image
                      ? record.image
                      : "https://placehold.co/10x10?text=No+Image"
                }
                alt={"anhsp"}
                width={70}
            />
      ),
    },
    {
      title: "THÔNG TIN SẢN PHẨM",
      dataIndex: "product_price",
      key: "product_price",
      render: (_, record) => {
        const realPriceItem = productsRealPrice.find(
            (item) => item.productDetailId === record.productDetailId
        );

        const originalPrice = Number(record.price) || 0;
        const displayPrice = realPriceItem?.price
            ? Number(realPriceItem.price)
            : originalPrice;

        const hasPriceChanged =
            realPriceItem && Number(realPriceItem.price) !== originalPrice;

        return (
            <div className="d-flex flex-column">
              {/* Hàng 1: Tên sản phẩm */}
              <>
                <Text strong>{record.productName}</Text>
                {record.colorName && (
                    <Text type="secondary">
                      [{record.colorName} - {record.sizeName}]
                    </Text>
                )}
              </>

              {/* Hàng 2: Giá & Trạng thái sản phẩm */}
              <div>
                <Text strong>{displayPrice.toLocaleString()} đ</Text>
                {hasPriceChanged && (
                    <>
                      <br />
                      <Text delete type="secondary">
                        {originalPrice.toLocaleString()} đ
                      </Text>
                      <br />
                      <Text type="success" style={{ fontSize: 12 }}>
                        Giá đã thay đổi
                      </Text>
                    </>
                )}
                {isProductDisabled(record.productDetailId) && (
                    <>
                      <br />
                      <Text type="danger">Sản phẩm đã ngừng hoạt động</Text>
                    </>
                )}
              </div>


            </div>
        );
      },
    },
    {
      title: "SỐ LƯỢNG",
      dataIndex: "quantity",
      key: "quantity",
      render: (_, record, index) => {
        const realPriceItem = productsRealPrice.find(
            (item) => item.productDetailId === record.productDetailId
        );

        const maxQuantity = realPriceItem?.quantity || 1;
        const currentQty = Math.min(record.quantityAddCart, maxQuantity);

        return (
            <div>
              <Flex>
                <Button
                    icon={<MinusOutlined />}
                    onClick={() =>
                        handleQuantityChange(index, Math.max(1, record.quantityAddCart - 1), maxQuantity)
                    }
                />
                <InputNumber
                    min={1}
                    value={currentQty}
                    onChange={(value) => handleQuantityChange(index, value, maxQuantity)}
                    style={{ width: "60px" }}
                />
                <Button
                    icon={<PlusOutlined />}
                    onClick={() =>
                        handleQuantityChange(index, record.quantityAddCart + 1, maxQuantity)
                    }
                />
              </Flex>
              <Col span={24}>Số lượng còn: {maxQuantity}</Col>
            </div>
        );
      },
    },
    {
      title: "TẠM TÍNH",
      dataIndex: "total",
      key: "total",
      render: (_, record) => {
        if (!record || !record.productDetailId || !record.quantityAddCart) {
          return <Text strong>0 đ</Text>;
        }

        const realPriceItem = productsRealPrice.find(
            (item) => item.productDetailId === record.productDetailId
        );

        const originalPrice = Number(record.price) || 0;
        const displayPrice = realPriceItem?.price
            ? Number(realPriceItem.price)
            : originalPrice;

        const validQty = Math.min(record.quantityAddCart, realPriceItem?.quantity || 0);
        const subTotal = displayPrice * validQty;

        const hasPriceChanged =
            realPriceItem && Number(realPriceItem.price) !== originalPrice;

        return (
            <div className={"d-flex flex-column"}>
              <Text strong>{subTotal.toLocaleString()} đ</Text>
              {hasPriceChanged && (
                  <>
                    <Text delete type="secondary">
                      {(originalPrice * record.quantityAddCart).toLocaleString()} đ
                    </Text>
                    <Text type="success" style={{ fontSize: 12 }}>
                      Giá đã thay đổi
                    </Text>
                  </>
              )}
            </div>
        );
      },
    },
    {
      title: "HÀNH ĐỘNG",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
          <Row gutter={[16, 16]}>
            <Col>
              <Popconfirm
                  title="Xóa Sản phẩm"
                  description="Bạn có muốn xóa sản phẩm này khỏi giỏ hàng không?"
                  okText="Xác nhận"
                  cancelText="Hủy"
                  onConfirm={() => {
                    if (user?.id) {
                      deleteItemInCart(record.cartDetailId);
                    } else {
                      handleRemoveFromCart(record.productDetailId);
                    }
                  }}
              >
                <Button icon={<FaRegTrashCan size={20} color="#FF4D4F" />}>
                  Xóa
                </Button>
              </Popconfirm>
            </Col>
          </Row>
      ),
    },
  ];


  return (
    <div>
      <Content style={{ backgroundColor: "white", minHeight: 800 }}>
        <Row gutter={[16, 16]} style={{ padding: "20px" }}>
          <Col span={16}>
            <Content>
              <Text style={{ fontWeight: "bold" }}>Giỏ hàng</Text>
              <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={products.map((product, index) => ({
                  ...product,
                  key: index,
                }))}
                pagination={false}
              />
            </Content>
          </Col>
          <Col span={8}>
            <Content style={{ padding: "1rem", borderLeft: "1px solid #ddd" }}>
              <p>
                Tạm tính:{" "}
                <strong>{totalSelectedPrice.toLocaleString()} đ</strong>
              </p>
              <p>
                Tổng sau giảm giá:{" "}
                <strong>{discountedTotal.toLocaleString()} đ</strong>
              </p>
              <p style={{ minHeight: "25px" }}>
                <Text type={appliedDiscount ? "success" : undefined}>
                  {appliedDiscount || ""}
                </Text>
              </p>
              <p style={{ minHeight: "25px" }}>
                <Text type={minOrderValue ? "success" : undefined}>
                  {minOrderValue ? "Miễn phí vận chuyển đơn hàng trên " + minOrderValue.toLocaleString() + "đ" : ""}
                </Text>
              </p>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button
                  type="primary"
                  block
                  onClick={() => {
                    // handleButtonClick("Mua ngay thành công!");
                    if (selectedRitem.length > 0 ) {
                      const updatedSelectedRitem = selectedRitem.map((item) => {
                        const realPriceItem = productsRealPrice.find(
                          (priceItem) =>
                            priceItem.productDetailId === item.productDetailId
                        );
                        const realPrice = realPriceItem?.price
                          ? Number(realPriceItem.price)
                          : Number(item.price) || 0;

                        return {
                          ...item,
                          price: realPrice, // Thêm realPrice vào object
                          // lấy min để tránh số lượng lớn hơn số lượng có trong kho
                          quantityAddCart: Math.min(
                            item.quantityAddCart,
                            realPriceItem?.quantity
                          ),
                        };
                      });

                      // Check for items with zero or invalid quantity
                      const invalidItems = updatedSelectedRitem.filter((item) => {
                        const realPriceItem = productsRealPrice.find(
                          (priceItem) => priceItem.productDetailId === item.productDetailId
                        );
                        return !realPriceItem || realPriceItem.quantity === 0 || item.quantityAddCart === 0;
                      });
                      
                      if (invalidItems.length > 0) {
                        toast.error("Có sản phẩm không còn hàng hoặc số lượng không hợp lệ");
                        return;
                      }

                      const vocher = {
                        voucherId: discountCode || null, // ID của voucher nếu có
                        totalAfterDiscount: discountedTotal, // Tổng tiền sau giảm giá
                        discountValue: discount || null,
                        note: appliedDiscount || null,
                      };

                      updateProducts(selectedRitem);
                      addToBill(updatedSelectedRitem);
                      addToVoucher(vocher);
                      navigate("/payment");
                      toast.success("Xác nhận mua hàng");
                    } else {
                      toast.warn("Chưa chọn sản phẩm nào hoặc tổng tiền bằng 0");
                    }
                  }}
                >
                  MUA HÀNG
                </Button>
                {/* <Button
                  type="dashed"
                  block
                  onClick={() => handleButtonClick("Chọn trả góp qua thẻ!")}
                >
                  TRẢ GÓP QUA THẺ
                </Button>
                <Button
                  type="default"
                  block
                  onClick={() =>
                    handleButtonClick("Mua ngay - Trả sau thành công!")
                  }
                >
                  MUA NGAY - TRẢ SAU
                </Button>
                <Button
                  type="default"
                  block
                  onClick={() => handleButtonClick("Tiến hành thanh toán!")}
                >
                  TIẾN HÀNH THANH TOÁN
                </Button> */}
              </Space>
              <Content
                title="Mã ưu đãi"
                style={{
                  marginTop: "1rem",
                }}
              >
                <Row gutter={1} justify={"space-between"}>
                  <Col>
                    {" "}
                    <LuTicket
                      size={29}
                      style={{ color: `${COLORS.primary}` }}
                    />
                  </Col>
                  <Col>
                    {" "}
                    <Select
                      showSearch
                      style={{ width: "100%", minWidth: 200 }} // Mở rộng ô chọn
                      placeholder="Chọn voucher"
                      optionLabelProp="label"
                      value={discountCode}
                      dropdownStyle={{ width: "auto", minWidth: 400 }} // Mở rộng dropdown
                      onChange={(value) => {
                        setDiscountCode(value);
                        console.log("diacadiecode", discountCode);
                      }}
                    >
                      {voucherValid?.map((item) => (
                        <Select.Option
                          key={item.id}
                          value={item.id}
                          label={item.voucherCode}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              height: "90px",
                            }}
                          >
                            {/* Ảnh thương hiệu */}
                            <div className={styles.coupon}>
                              <img
                                src={
                                  item.image ||
                                  "https://down-vn.img.susercontent.com/file/vn-11134004-7ras8-m4re2imocx9s72.webp"
                                }
                                alt={item.voucherCode}
                                style={{ width: "70px" }}
                              />
                            </div>

                            {/* Thông tin voucher */}
                            <div>
                              <strong>{item.voucherCode}</strong>
                              <span
                                style={{
                                  margin: 0,
                                  fontSize: 12,
                                  color: "#888",
                                }}
                              >
                                - Giảm{" "}
                                {item.discountType === "MONEY"
                                  ? item.discountValue.toLocaleString() + "đ"
                                  : item.discountValue + "%"}{" "}
                                {item.discountType === "MONEY"
                                  ? ""
                                  : `Tối đa ${item.discountMaxValue.toLocaleString()}đ`}
                              </span>
                              <div>
                                <Text type="success">
                                  Đơn tối thiểu{" "}
                                  {item.billMinValue.toLocaleString()} đ
                                </Text>
                              </div>
                              <span>{item.endDate}</span>
                              <div>
                                <Text type="danger">
                                  {item.voucherType=="PRIVATE"? "Số lượng 1": "Số lượng "+item.quantity}
                                </Text>
                              </div>
                            </div>
                          </div>
                        </Select.Option>
                      ))}
                    </Select>
                  </Col>

                  <Button type="primary" onClick={applyDiscount}>
                    Áp dụng
                  </Button>
                </Row>
                <div>
                  {" "}
                  <Text type="success" className="pt-10">
                    {voucherBests.note}
                  </Text>
                </div>
              </Content>
            </Content>
          </Col>
        </Row>
      </Content>
    </div>
  );
};

export default CartPage;
