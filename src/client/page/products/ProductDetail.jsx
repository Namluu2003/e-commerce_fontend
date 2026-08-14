import {
  Button,
  Card,
  Col,
  Flex,
  Image,
  Input,
  InputNumber,
  message,
  notification,
  Radio,
  Row,
  Space,
} from "antd";
import { Content } from "antd/es/layout/layout";
import React, { useEffect, useState } from "react";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { COLORS } from "../../../constants/constants";
import { FaCartPlus } from "react-icons/fa6";
import Title from "antd/es/skeleton/Title";
import PropProduct from "./PropProduct";
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import SizeChart from "./SizeChart";
import { FcBusinessman } from "react-icons/fc";
import { FcNext } from "react-icons/fc";
import {
  apiAddCart,
  apiGetColorsOfProduct,
  apiGetColorsOfProductAndSoleId,
  apiGetGendersOfProduct,
  apiGetMaterialsOfProductAndGenderId,
  apiGetMaterialssOfProduct,
  apigetProductDetail,
  apiGetSizesOfProduct,
  apiGetSizesOfProductAndColor,
  apiGetSolesOfProduct,
  apiGetSolesOfProductAndMaterialId,
  getAllProducthadSoldDesc,
  getAllProducthadViewsDesc,
} from "./api";
import { addToCart, clearCart, getCart } from "../cart/cart.js";
import GetProductDetail from "../../../admin/product/Product/GetProductDetail";
import { addToBill, clearBill } from "../cart/bill.js";
import { toast } from "react-toastify";
import CommentSection from "./CommentSection.jsx";
import { clearVoucher } from "../cart/voucher.js";

function ProductDetail() {
  const [searchParams] = useSearchParams(); // Lấy query parameters từ URL
  const { productId } = useParams();
  // const productId = searchParams.get("productId");
  const colorId = searchParams.get("colorId");
  const sizeId = searchParams.get("sizeId");
  const soleId = searchParams.get("soleId");
  const materialId = searchParams.get("materialId");
  const genderId = searchParams.get("genderId");
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(Number(sizeId));
  const [color, setColor] = useState(Number(colorId));
  const [material, setMaterial] = useState(Number(materialId));
  const [brand, setBrand] = useState(null);
  const [type, setType] = useState(null);
  const [sole, setSole] = useState(Number(soleId));
  const [gender, setGender] = useState(Number(genderId));

  const [quantityAddCart, setQuantityAddCart] = useState(1);

  const [sizeChartModal, setSizeChartModal] = useState(false);
  const [getProductDetail, setGetProductDetail] = useState({});
  const [sizes, setSizes] = useState([]);
  const [sizesOfColor, setSizesOfColor] = useState([]);
  const [colorOfSole, setColorOfSole] = useState([]);
  const [soleOfMaterial, setSoleOfMaterial] = useState([]);
  const [materialOfGender, setMaterialOfGender] = useState([]);

  const [colors, setColors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [brands, setBrands] = useState([]);
  const [types, setTypes] = useState([]);
  const [genders, setGenders] = useState([]);
  const [soles, setSoles] = useState([]);
  const [productHadviewsDescs, setProductHadviewsDescs] = useState();
  const [PageProductHadviewsDescs, setPageProductHadviewsDescs] = useState({
    current: 1,
    pageSize: 6,
  });
  const [ren, setRen] = useState();
  const navigate = useNavigate();


  useEffect(() => {
    window.scrollTo(0, 0);
    getAllProductHadViewsDescs();
  }, []);
  useEffect(() => {
    // console.log(id);
    console.log(
      "🛒 Đây là user hiện tại:",
      JSON.parse(localStorage.getItem(`user`)) || []
    );
    fetchAttributeProduct(productId);
    getProductDetails(productId, colorId, sizeId, genderId, materialId, soleId);

    // getColorsOfProduct(productId);
    // getSizesOfProduct(productId);
    clearBill();
    clearVoucher();
  }, [productId, colorId, sizeId]);
  useEffect(() => {
    const fetchSole = async () => {
      if (productId && sole && sole) {
        await getColorsOfProductAndSoleId(productId, sole, material, gender);
      }
    };

    fetchSole();
  }, [sole, ren]);
  useEffect(() => {
    const fetchColors = async () => {
      if (productId && material) {
        await getSolesOfProductAndMaterialId(productId, material, gender);
      }
    };

    fetchColors();
  }, [material]);
  useEffect(() => {
    const fetchColors = async () => {
      if (productId && gender) {
        await getMaterialsOfProductAndGenderId(productId, gender);
      }
    };

    fetchColors();
  }, [gender]);
  // Khi thay đổi color, cập nhật danh sách size tương ứng

  useEffect(() => {
    const fetchSizesAndProductDetails = async () => {
      if (productId && color) {
        try {
          const sizesData = await getSizesOfProductAndColors(
            productId,
            color,
            sole,
            material,
            gender
          );

          if (Array.isArray(sizesData) && sizesData.length > 0) {
            setSize(sizesData[0].id); // Cập nhật size với giá trị đầu tiên trong danh sách
            // await getProductDetails(
            //   productId,
            //   color,
            //   sizesData[0].id,
            //   gender,
            //   material,
            //   sole
            // ); // Gọi API sau khi đã có size
          } else {
            setSize(null); // Nếu không có size nào, reset size
          }
        } catch (error) {
          console.error("Error fetching sizes or product details:", error);
        }
      }
    };

    fetchSizesAndProductDetails();
  }, [color]);

  // Khi thay đổi size, cập nhật chi tiết sản phẩm
  useEffect(() => {
    if (productId && color && size) {
      getProductDetails(productId, color, size, gender, material, sole);
    }
  }, [size]);

  // Khi danh sách size của color thay đổi, chọn giá trị đầu tiên làm default
  useEffect(() => {
    if (sizesOfColor.length > 0) {
      const isCurrentSizeValid = sizesOfColor.some(item => item.id === size);
      if (!isCurrentSizeValid) {
        setSize(sizesOfColor[0]?.id);
      }
    }
  }, [sizesOfColor]);  
  useEffect(() => {
    if (colorOfSole.length > 0) {
      const isColorExist = colorOfSole.some((item) => item.id === color);
      if (!isColorExist) {
        const newColor = colorOfSole[0]?.id;
        setColor(newColor);
      } else {
        getSizesOfProductAndColors(productId, color, sole, material, gender);
      }
    }
  }, [colorOfSole]);
  
  useEffect(() => {
    if (soleOfMaterial.length > 0) {
      const isSoleExist = soleOfMaterial.some((item) => item.id === sole);
      if (!isSoleExist) {
        const newSoleId = soleOfMaterial[0]?.id;
        setSole(newSoleId);
      } else {
        getColorsOfProductAndSoleId(productId, sole, material, gender);
      }
    }
  }, [soleOfMaterial]);
  

  useEffect(() => {
    if (materialOfGender.length > 0) {
      const isMaterialExist = materialOfGender.some((item) => item.id === material);
      if (!isMaterialExist) {
        const newMaterial = materialOfGender[0]?.id;
        setMaterial(newMaterial);
      } else {
        getSolesOfProductAndMaterialId(productId, material, gender);
      }
    }
  }, [materialOfGender]);
  

  const getAllProductHadViewsDescs = async () => {
    setLoading(true);
    try {
      const response = await getAllProducthadSoldDesc(PageProductHadviewsDescs);
      console.log("Response tất cá sản phẩm lượt bán:", response); // Log response để kiểm tra dữ liệu trả về
      setProductHadviewsDescs(response.data);
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };
  const getProductDetails = async (
    productId,
    colorId,
    sizeId,
    genderId,
    materialId,
    soleId
  ) => {
    setLoading(true);
    try {
      const response = await apigetProductDetail(
        productId,
        colorId,
        sizeId,
        genderId,
        materialId,
        soleId
      );
      console.log("Response get product detail:", response); // Log response để kiểm tra dữ liệu trả về
      setGetProductDetail(response.data);
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };
  const getSizesOfProductAndColors = async (
    productId,
    colorId,
    soleId,
    materialId,
    genderId
  ) => {
    setLoading(true);
    try {
      const response = await apiGetSizesOfProductAndColor(
        productId,
        colorId,
        soleId,
        materialId,
        genderId
      );
      console.log("Response get sizes of product and color:", response); // Log response để kiểm tra dữ liệu trả về
      setSizesOfColor(response.data);
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };
  const getColorsOfProductAndSoleId = async (
    productId,
    sole,
    material,
    gender
  ) => {
    setLoading(true);
    try {
      const response = await apiGetColorsOfProductAndSoleId(
        productId,
        sole,
        material,
        gender
      );
      console.log(
        "Responseádisasdsdsdsdsdsdsdsssdudisadasdis color:",
        response
      ); // Log response để kiểm tra dữ liệu trả về
      setColorOfSole(response.data);
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };
  const getSolesOfProductAndMaterialId = async (
    productId,
    materialId,
    genderId
  ) => {
    setLoading(true);
    try {
      const response = await apiGetSolesOfProductAndMaterialId(
        productId,
        materialId,
        genderId
      );
      console.log("Response get sizes of product and color:", response); // Log response để kiểm tra dữ liệu trả về
      setSoleOfMaterial(response.data);
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };
  const getMaterialsOfProductAndGenderId = async (productId, genderId) => {
    setLoading(true);
    try {
      const response = await apiGetMaterialsOfProductAndGenderId(
        productId,
        genderId
      );
      console.log("Response get sizes of product and color:", response); // Log response để kiểm tra dữ liệu trả về
      setMaterialOfGender(response.data);
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };
  const fetchAttributeProduct = async (productId) => {
    setLoading(true);
    try {
      const [
        colorsResponse,
        materialsResponse,
        gendersResponse,
        solesResponse,
        sizesResponse,
      ] = await Promise.all([
        apiGetColorsOfProduct(productId),
        apiGetMaterialssOfProduct(productId),
        apiGetGendersOfProduct(productId),
        apiGetSolesOfProduct(productId),
        apiGetSizesOfProduct(productId),
      ]);

      setColors(colorsResponse.data);
      setMaterials(materialsResponse.data);
      setGenders(gendersResponse.data);
      setSoles(solesResponse.data);
      setSizes(sizesResponse.data);
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };
  const addProductToCart = async (productAddCart) => {
    setLoading(true);
    try {
      const response = await apiAddCart(productAddCart);
      console.log("Response add cart:", response); // Log response để kiểm tra dữ liệu trả về
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Content
        style={{
          backgroundColor: "white",
          paddingTop: "3rem",
          paddingBottom: "3rem",
        }}
      >
        <Row>
          <Col span={11}>
            <Row justify="center">
              <Col
                span={24}
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Image
                  alt="Sản phẩm"
                  src={
                    getProductDetail?.image?.length > 0
                      ? getProductDetail.image[0]?.url
                      : "https://placehold.co/500x550?text=No+Image" // Ảnh placeholder nếu không có ảnh sản phẩm
                  }
                  style={{
                    height: "550px",
                    width: "500px",
                    objectFit: "contain",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    backgroundColor:
                      getProductDetail?.image?.length > 0
                        ? "transparent"
                        : "#f5f5f5", // Nền xám nếu không có ảnh
                  }}
                />
              </Col>
              <Col
                span={24}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "10px",
                }}
              >
                <Image.PreviewGroup>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {(getProductDetail.image?.length > 0
                      ? getProductDetail.image
                      : Array(5).fill(null)
                    )
                      .slice(0, 5) // Đảm bảo chỉ lấy tối đa 5 ảnh hoặc placeholder
                      .map((item, index) => (
                        <Image
                          key={index}
                          width={80}
                          height={90}
                          src={
                            item
                              ? item.url
                              : "https://placehold.co/80x90?text=No+Image"
                          } // Nếu không có ảnh, hiển thị placeholder
                          alt={item ? `Ảnh ${index + 1}` : "Không có ảnh"}
                          style={{
                            objectFit: "cover",
                            border: "1px solid #ddd",
                            borderRadius: "5px",
                            backgroundColor: item ? "transparent" : "#f5f5f5", // Nền xám nhẹ nếu không có ảnh
                          }}
                        />
                      ))}
                  </div>
                </Image.PreviewGroup>
              </Col>
            </Row>
          </Col>
          <Col span={13} style={{ position: "relative", minHeight: "300px" }}>
            <Col span={24}>
              <h3>{getProductDetail.productName}</h3>
            </Col>
            <Col
              span={24}
              style={{
                backgroundColor: "#f3702110",
                color: `${COLORS.pending}`,
                padding: "20px",
                marginLeft: "1rem",
              }}
            >
              <h2>
                {getProductDetail.promotion?.discountValue ? (
                  <div>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                      // minimumFractionDigits: 1, // Hiển thị tối thiểu 2 chữ số sau dấu phẩy
                      // maximumFractionDigits: 1, // Giới hạn tối đa 2 chữ số sau dấu phẩy
                    }).format(
                      getProductDetail.price -
                        (getProductDetail.price *
                          getProductDetail.promotion?.discountValue) /
                          100
                    )}{" "}
                    <span
                      style={{
                        textDecoration: "line-through",
                        marginLeft: "8px",
                        fontSize: "1.5rem",
                        color: "GrayText",
                      }}
                    >
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                        // minimumFractionDigits: 1,
                        // maximumFractionDigits: 1,
                      }).format(getProductDetail.price)}
                    </span>
                    <sup style={{ fontSize: "2rem", color: "red" }}>
                      -{getProductDetail.promotion?.discountValue}%
                    </sup>
                  </div>
                ) : (
                  new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    // minimumFractionDigits: 1,
                    // maximumFractionDigits: 1,
                  }).format(getProductDetail.price)
                )}
              </h2>
            </Col>
            <Row gutter={[10, 10]}>
              <Col
                span={24}
                style={{
                  marginTop: "3rem",
                }}
              >
                <Row>
                  <Col span={6}>Vận chuyển</Col>
                  <Col span={18}>Giao hàng nhanh</Col>
                </Row>
              </Col>
              <Col span={24}>
                <Row>
                  <Col span={6}>Giới tính</Col>
                  <Col span={18}>
                    <Col span={18}>
                      <Radio.Group
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                      >
                        <Space>
                          {Array.isArray(genders) &&
                            genders.map((item) => (
                              <Radio.Button
                                key={item.id}
                                value={item.id}
                                style={{
                                  borderRadius: "10px",
                                  border: "1px solid #ccc",
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "8px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                  }}
                                >
                                  <span>{item.genderName}</span>
                                </div>
                              </Radio.Button>
                            ))}
                        </Space>
                      </Radio.Group>
                    </Col>
                  </Col>
                </Row>
              </Col>
              <Col span={24}>
                <Row>
                  <Col span={6}>Chất liệu</Col>
                  <Col span={18}>
                    <Col span={18}>
                      <Radio.Group
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                      >
                        <Space>
                          {Array.isArray(materials) &&
                            materials.map((item) => (
                              <Radio.Button
                                key={item.id}
                                value={item.id}
                                style={{
                                  borderRadius: "10px",
                                  border: "1px solid #ccc",
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "8px",
                                }}
                                disabled={
                                  !materialOfGender.some(
                                    (size) => size.id === item.id
                                  )
                                } // Đúng logic disable
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                  }}
                                >
                                  <span>{item.materialName}</span>
                                </div>
                              </Radio.Button>
                            ))}
                        </Space>
                      </Radio.Group>
                    </Col>
                  </Col>
                </Row>
              </Col>
              <Col span={24}>
                <Row>
                  <Col span={6}>Loại đế giày</Col>
                  <Col span={18}>
                    <Col span={18}>
                      <Radio.Group
                        value={sole}
                        onChange={(e) => setSole(e.target.value)}
                      >
                        <Space>
                          {Array.isArray(soles) &&
                            soles.map((item) => (
                              <Radio.Button
                                key={item.id}
                                value={item.id}
                                style={{
                                  borderRadius: "10px",
                                  border: "1px solid #ccc",
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "8px",
                                }}
                                disabled={
                                  !soleOfMaterial.some(
                                    (size) => size.id === item.id
                                  )
                                } // Đúng logic disable
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                  }}
                                >
                                  <span>{item.soleName}</span>
                                </div>
                              </Radio.Button>
                            ))}
                        </Space>
                      </Radio.Group>
                    </Col>
                  </Col>
                </Row>
              </Col>
              <Col span={24}>
                <Row>
                  <Col span={6}>Màu sắc</Col>
                  <Col span={18}>
                    <Col span={18}>
                      <Radio.Group
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                      >
                        <Space>
                          {Array.isArray(colors) &&
                            colors.map((item) => (
                              <Radio.Button
                                key={item.id}
                                value={item.id}
                                style={{
                                  borderRadius: "10px",
                                  border: "1px solid #ccc",
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "8px",
                                }}
                                disabled={
                                  !colorOfSole.some(
                                    (size) => size.id === item.id
                                  )
                                } // Đúng logic disable
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "1rem",
                                      height: "1rem",
                                      borderRadius: "50%",
                                      backgroundColor: item.code,
                                      border: "1px solid gray",
                                    }}
                                  />
                                  <span>{item.colorName}</span>
                                </div>
                              </Radio.Button>
                            ))}
                        </Space>
                      </Radio.Group>
                    </Col>
                  </Col>
                </Row>
              </Col>
              <Col span={24}>
                <Row>
                  <Col span={6}>Kích cỡ</Col>
                  <Col span={18}>
                    <Radio.Group
                      value={size}
                      onChange={(e) => {
                        setSize(e.target.value);
                      }}
                    >
                      <Space>
                        {sizes.map((item) => (
                          <Radio.Button
                            key={item.id}
                            value={item.id}
                            disabled={
                              !sizesOfColor.some((size) => size.id === item.id)
                            } // Đúng logic disable
                            style={{
                              borderRadius: "10px",
                              border: "1px solid #ccc",
                            }}
                          >
                            {item.sizeName}
                          </Radio.Button>
                        ))}
                      </Space>
                    </Radio.Group>

                    <Col
                      style={{ cursor: "pointer", paddingTop: "1rem" }}
                      onClick={() => {
                        setSizeChartModal(true);
                      }}
                    >
                      Bảng quy Đổi kích cỡ <FcNext />
                    </Col>
                  </Col>
                </Row>
              </Col>
              <Col span={24}>
                <Row>
                  <Col span={6}>Số lượng</Col>
                  <Col span={18}>
                    <InputNumber
                      defaultValue={1}
                      value={quantityAddCart}
                      min={1}
                      max={getProductDetail.quantity}
                      onChange={(value) => {
                        setQuantityAddCart(value); // Cập nhật state khi thay đổi số lượng
                      }}
                    />
                    <div>Số lượng còn: {getProductDetail.quantity}</div>
                  </Col>
                </Row>
              </Col>
              <Col span={24}>
                {/* <Row>
                  <Col span={6}>Ưu đãi, giảm giá</Col>
                  <Col span={18}>Vocher, giảm giá</Col>
                </Row> */}
              </Col>
              <Col
                style={{ position: "absolute", bottom: "0rem", width: "100%" }}
              >
                <Space>
                  {/* Nút "Thêm Vào Giỏ Hàng" */}
                  <Button
                    type="default"
                    style={{
                      color: `${COLORS.pending}`,
                      borderColor: `${COLORS.primary}`,
                      backgroundColor: `${COLORS.backgroundcolor2}`,
                      padding: "25px",
                    }}
                    onClick={async () => {
                      // clearCart()
                      const user = JSON.parse(localStorage.getItem(`user`));
                      if (quantityAddCart > getProductDetail.quantity) {
                        toast.warn(
                          "Số lượng thêm vào giỏ hàng phải nhỏ hơn số lượng sản phẩm có"
                        );
                        return;
                      }
                      if (user) {
                        await addProductToCart({
                          customerId: user.id,
                          productDetailId: getProductDetail.id,
                          quantityAddCart: quantityAddCart,
                          price: getProductDetail.promotion?.discountValue
                            ? getProductDetail.price -
                              (getProductDetail.price *
                                getProductDetail.promotion.discountValue) /
                                100
                            : getProductDetail.price,
                          productName: `${getProductDetail.productName} [${getProductDetail.colorName}-${getProductDetail.sizeName}]`,
                          image: getProductDetail.image[0]?.url || "",
                        });
                        window.dispatchEvent(new Event("cartUpdated"));
                      } else {
                        addToCart({
                          productDetailId: getProductDetail.id,
                          quantityAddCart: quantityAddCart,
                          price: getProductDetail.promotion?.discountValue
                            ? getProductDetail.price -
                              (getProductDetail.price *
                                getProductDetail.promotion.discountValue) /
                                100
                            : getProductDetail.price,
                          productName: getProductDetail.productName,
                          image: getProductDetail.image[0]?.url || "",
                          sizeName: getProductDetail.sizeName,
                          colorName: getProductDetail.colorName,
                        });
                        window.dispatchEvent(new Event("cartUpdated"));
                      }

                      // notification.success({
                      //   message: "Success",
                      //   duration: 4,
                      //   pauseOnHover: false,
                      //   showProgress: true,
                      //   description: `Thêm vào giỏ hàng thành công!`,
                      // });
                      toast.success("Thêm vào giỏ hàng thành công!");
                      console.log(getCart());
                    }}
                  >
                    <FaCartPlus size={23} />
                    Thêm Vào Giỏ Hàng
                  </Button>

                  {/* Nút "Mua Ngay" */}
                  <Button
                    type="primary"
                    style={{
                      backgroundColor: `${COLORS.primary}`,
                      borderColor: "#E44D26",
                      padding: "25px",
                    }}
                    onClick={() => {
                      if (quantityAddCart > getProductDetail.quantity) {
                        toast.warn(
                          "Số lượng thêm vào giỏ hàng phải nhỏ hơn số lượng sản phẩm có"
                        );
                        return;
                      }
                      addToBill({
                        productDetailId: getProductDetail.id,
                        quantityAddCart: quantityAddCart,
                        price: getProductDetail.promotion?.discountValue
                          ? getProductDetail.price -
                            (getProductDetail.price *
                              getProductDetail.promotion.discountValue) /
                              100
                          : getProductDetail.price,
                        productName: getProductDetail.productName,
                        image: getProductDetail.image[0]?.url || "",
                        sizeName: getProductDetail.sizeName,
                        colorName: getProductDetail.colorName,
                      });
                      navigate("/payment");
                      toast.success("Xác nhận mua hàng");
                    }}
                  >
                    Mua Ngay
                  </Button>
                </Space>
              </Col>
            </Row>
          </Col>
        </Row>
      </Content>
      <Content
        style={{ backgroundColor: "white", padding: "20px", marginTop: "1rem" }}
      >
        <Row>
          <Col
            span={24}
            style={{
              backgroundColor: `${COLORS.backgroundcolor2}`,
              padding: "15px",
              color: `${COLORS.pending}`,
            }}
          >
            CHI TIẾT SẢN PHẨM
          </Col>
          <Row span={24} style={{ marginLeft: "3rem", margin: "1rem" }}>
            <Col
              span={24}
              style={{
                marginTop: "1rem",
              }}
            >
              <Row>
                <Col span={6}>Tên giày</Col>
                <Col span={18}>{getProductDetail.brandName}</Col>
              </Row>
            </Col>
            <Col
              span={24}
              style={{
                marginTop: "1rem",
              }}
            >
              <Row>
                <Col span={6}>Loại giày</Col>
                <Col span={18}>{getProductDetail.typeName}</Col>
              </Row>
            </Col>
            <Col
              span={24}
              style={{
                marginTop: "1rem",
              }}
            >
              <Row>
                <Col span={6}>Thương hiệu</Col>
                <Col span={18}>{getProductDetail.brandName}</Col>
              </Row>
            </Col>
            <Col
              span={24}
              style={{
                marginTop: "1rem",
              }}
            >
              <Row>
                <Col span={6}>Màu sắc</Col>
                <Col span={18}>{getProductDetail.colorName}</Col>
              </Row>
            </Col>

            <Col
              span={24}
              style={{
                marginTop: "1rem",
              }}
            >
              <Row>
                <Col span={6}>Chất liệu</Col>
                <Col span={18}>{getProductDetail.materialName}</Col>
              </Row>
            </Col>
            <Col
              span={24}
              style={{
                marginTop: "1rem",
              }}
            >
              <Row>
                <Col span={6}>Đế giày</Col>
                <Col span={18}>{getProductDetail.soleName}</Col>
              </Row>
            </Col>
            <Col
              span={24}
              style={{
                marginTop: "1rem",
              }}
            >
              <Row>
                <Col span={6}>Số lượng</Col>
                <Col span={18}>{getProductDetail.quantity}</Col>
              </Row>
            </Col>
          </Row>
        </Row>
        <Row justify="center">
          <Col
            span={24}
            style={{
              backgroundColor: `${COLORS.backgroundcolor2}`,
              padding: "15px",
              color: `${COLORS.pending}`,
            }}
          >
            Mô TẢ SẢN PHẨM
          </Col>
          <Col
            style={{
              marginLeft: "1rem",
              margin: "1rem",
              justifyContent: "start",
            }}
            span={24}
          >
            {/* {getProductDetail.description} */}
            <div
              dangerouslySetInnerHTML={{
                __html: getProductDetail.description || "Không có mô tả",
              }}
            />
          </Col>
        </Row>
      </Content>

      <Content
        style={{ backgroundColor: "white", padding: "20px", marginTop: "1rem" }}
      >
        <Row justify="center">
          <Col
            span={24}
            style={{
              backgroundColor: `${COLORS.backgroundcolor2}`,
              padding: "15px",
              color: `${COLORS.pending}`,
            }}
          >
            ĐÁNH GIÁ SẢN PHẨM
          </Col>
          <Col span={24}>
            <CommentSection id={productId} />
          </Col>
        </Row>
      </Content>

      <Content
        style={{ backgroundColor: "white", padding: "20px", marginTop: "1rem" }}
      >
        <Row justify="center">
          <Col
            span={24}
            style={{
              backgroundColor: `${COLORS.backgroundcolor2}`,
              padding: "15px",
              marginBottom: "1rem",
              color: `${COLORS.pending}`,
            }}
          >
            SẢN PHẨM NỔI BẬT
          </Col>
          <Col span={24}>
            <Row gutter={[5, 5]}>
              {productHadviewsDescs?.map((product, index) => (
                <Col
                  key={index}
                  span={4}
                  onClick={() => {
                    window.location.replace(
                      `/products/product-detail/${product.productId}?colorId=${product.colorId}&sizeId=${product.sizeId}&genderId=${product.genderId}&materialId=${product.materialId}&soleId=${product.soleId}`
                    );
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <PropProduct
                    product={{
                      name:
                        product.productName?.trim() || "Sản phẩm chưa có tên",
                      price: product.price ?? 0,
                      promotionView: product.promotionView,
                      sale: product.sold ?? 0,
                      url: product.imageUrl || "https://placehold.co/50",
                      views: product.views ?? 0,
                      rate: product.rate ?? 5,
                    }}
                  />
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Content>
      <SizeChart
        onOpen={sizeChartModal}
        onCancel={() => {
          setSizeChartModal(false);
        }}
      />
    </>
  );
}

export default ProductDetail;
