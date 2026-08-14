import { baseUrl } from "../../../helpers/Helpers.js";
import {
  Modal,
  Row,
  Col,
  Input,
  Select,
  InputNumber,
  Radio,
  Button,
  QRCode,
  Upload,
} from "antd";
import { FaEdit } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { BiDownload } from "react-icons/bi";
// import { QRCode } from "react-qrcode-logo";
import clsx from "clsx";
import styles from "./ProductDetail.module.css";
import { COLORS } from "../../../constants/constants.js";
import { PlusOutlined } from "@ant-design/icons";
import { forEach } from "lodash";
import { exitsProductDetail } from "./ApiProductDetail.js";

const ModalEditSanPham = ({
  isOpen,
  handleClose,
  title,
  handleSubmit,
  getProductDetail,
  dataType,
  dataBrand,
  dataMaterial,
  dataSole,
  dataProduct,
  dataSize,
  dataColor,
  dataGender,
}) => {
  // ảnh

  const [cleanUpImage, setCleanUpImage] = useState([]);
  const [deleted, setDeleted] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cấu hình Cloudinary
  // Hàm upload ảnh lên Cloudinary và nhận URL và public_id

  const cleanUpImageRef = useRef(cleanUpImage);
  const deletedRef = useRef(deleted);

  useEffect(() => {
    // Cập nhật giá trị mới của cleanUpImage vào ref khi nó thay đổi
    cleanUpImageRef.current = cleanUpImage;
    deletedRef.current = deleted;
    console.log("ddayad la du lieu lay ra", getProductDetail);
    console.log("đây là cleanupimage", cleanUpImage);

    console.log("day la image", getValues("image"));
  }, [cleanUpImage, deleted]);
  useEffect(() => {
    console.warn("đây là deleted", deleted);
  });

  // Hàm xóa ảnh
  const deleteImages = async (imageIds) => {
    if (!imageIds || imageIds.length === 0) return;

    try {
      const deleteRequests = imageIds.map((id) =>
        fetch(`${baseUrl}/cloudinary/delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_id: id }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.result === "ok") {
              console.log(` Đã xóa ảnh ${id} khỏi Cloudinary`);
            } else {
              console.error("Lỗi xóa ảnh:", data);
            }
          })
          .catch((error) => console.error("Lỗi khi xóa ảnh:", error))
      );

      await Promise.all(deleteRequests); // Đợi tất cả các ảnh được xóa
    } catch (error) {
      console.error("Lỗi khi xóa ảnh hàng loạt:", error);
    } finally {
      cleanUpImageRef.current = null;
    }
  };
  const deleteImagesAndUpdate = async (imageIds) => {
    if (!imageIds || imageIds.length === 0) return;

    try {
      const deleteRequests = imageIds.map((id) =>
        fetch(`${baseUrl}/cloudinary/deleteandupdatedb`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicId: id.publicId,
            productId: id.productId,
            colorId: id.colorId,
          }),
        })
          .then((res) => res.text())
          .then((data) => {
            console.log(data);
          })
          .catch((error) => console.error("Lỗi khi xóa ảnh:", error))
      );

      await Promise.all(deleteRequests); // Đợi tất cả các ảnh được xóa
    } catch (error) {
      console.error("Lỗi khi xóa ảnh hàng loạt:", error);
    } finally {
      cleanUpImageRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      console.log("🧹 Dọn dẹp ảnh...");
      console.log(cleanUpImageRef.current);

      try {
        deleteImages(cleanUpImageRef.current); // Gọi hàm xóa ảnh
      } finally {
        setCleanUpImage([]); // Đặt giá trị cho cleanUpImage
        setDeleted([]);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    console.log("Clean up images updated:", cleanUpImage);
  }, [cleanUpImage]);

  const cloudinaryUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "uploaddatn"); // Thay bằng preset của bạn

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dieyhvcou/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    console.log("Cloudinary Upload Response:", data); // Log thông tin trả về từ Cloudinary
    setCleanUpImage((pre) => [...pre, data.public_id]);

    if (data.secure_url && data.public_id) {
      // Trả về thông tin của ảnh (url và public_id)
      return {
        url: data.secure_url, // URL ảnh
        public_id: data.public_id, // public_id ảnh
      };
    } else {
      throw new Error("Upload failed");
    }
  };

  // Hàm xử lý thay đổi (upload và thêm ảnh vào tableData)
  const onChange = async ({ fileList }) => {
    const updatedImages = fileList.map((file) => ({
      url: file.response?.url || file.url, // Lấy URL từ response (nếu có) hoặc từ fileList
      publicId: file.response?.public_id || file.public_id, // Lấy public_id từ response
      uid: file.uid, // UID cho từng ảnh
      status: file.status, // Trạng thái của ảnh
    }));

    // Cập nhật hình ảnh trong form
    setValue("image", updatedImages.slice(0, 6)); // Giữ tối đa 6 ảnh
    console.log(getValues("image"));
  };

  // Hàm xử lý khi xóa ảnh
  const handleRemove = async (file) => {
    console.log("file đang lấy để xóa", file);

    if (file.publicId || file.public_id) {
      // try {
      //   const res = await fetch(`${baseUrl}/cloudinary/delete`, {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ public_id: file.publicId || file.public_id }),
      //   });

      //   const data = await res.json();
      //   if (data.result === "ok") {
      //     // Cập nhật dữ liệu hình ảnh trong form
      //     const currentImages = getValues("image"); // Lấy giá trị hiện tại của hình ảnh
      //     const updatedImages = currentImages.filter(
      //       (img) => img.publicId !== file.publicId
      //     );

      //     // Cập nhật giá trị hình ảnh trong form
      //     setValue("image", updatedImages);
      //   } else {
      //     console.error("Lỗi xóa ảnh:", data);
      //   }
      // } catch (error) {
      //   console.error("Lỗi khi xóa ảnh:", error);
      // }
      setDeleted((pre) => [...pre, file.publicId || file.public_id]);
    } else {
      console.warn("Ảnh không có public_id, không thể xóa");
    }

    // Ghi chú: Bạn có thể bỏ qua đoạn log này nếu không cần thiết
    console.log("đây là dữ liệu", getValues);
  };
// 
const exits = async (productData) => {
  try {
    const response = await exitsProductDetail(productData);
    console.log("Response from của esxits .......... API:", response); // Log response để kiểm tra dữ liệu trả về
    return response.data
  } catch (error) {
    message.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
  } finally {
  }
};


  // Hàm Preview
  const onPreview = async (file) => {
    let src = file.url;

    if (!src && file.originFileObj) {
      // Nếu chưa có URL, tạo URL tạm thời cho ảnh
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }

    if (typeof src === "string") {
      const image = new Image();
      image.src = src;
      const imgWindow = window.open(src);
      imgWindow?.document.write(image.outerHTML);
    }
  };
  // ảnh
  const qrCanvasRef = useRef(null);

  const validationSchema = Yup.object().shape({
    brandId: Yup.number().required("Thương hiệu là bắt buộc"),
    typeId: Yup.number().required("Danh mục là bắt buộc"),
    materialId: Yup.number().required("Chất liệu vải là bắt buộc"),
    soleId: Yup.number().required("Chất liệu đế là bắt buộc"),
    quantity: Yup.number()
      .required("Số lượng là bắt buộc")
      .min(1, "Số lượng phải lớn hơn  0")
      .max(999999, "Số lượng không được vượt quá 99999"), // Thay đổi giá trị tối đa theo nhu cầu
    price: Yup.number()
      .required("Giá bán là bắt buộc")
      .min(1000, "Giá bán phải lớn hơn hoặc bằng 1.000 VNĐ")
      .max(99999999, "Giá bán không được vượt quá 99.999.999 VNĐ"), // Thay đổi giá trị tối đa theo nhu cầu
    weight: Yup.number()
      .required("Cân nặng là bắt buộc")
      .min(100, "Cân nặng phải lớn hơn  100")
      .max(10000, "Cân nặng không được vượt quá 10000 gram"), // Thay đổi giá trị tối đa theo nhu cầu
    description: Yup.string().nullable(),
  });
  const getIdByName = (dataArray, keyName, targetValue) => {
    return dataArray?.find((item) => item[keyName] === targetValue)?.id || null;
  };
  const {
    control,
    handleSubmit: handleFormSubmit,
    reset,
    formState: { errors },
    setValue,
    getValues,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      image: getProductDetail?.image || [],
      description: getProductDetail?.description || "",
      price: getProductDetail?.price || 0,
      quantity: getProductDetail?.quantity || 0,
      weight: getProductDetail?.weight || 0,
      status: getProductDetail?.status || "HOAT_DONG",
      typeId: getIdByName(dataType, "typeName", getProductDetail?.typeName),
      brandId: getIdByName(dataBrand, "brandName", getProductDetail?.brandName),
      materialId: getIdByName(
        dataMaterial,
        "materialName",
        getProductDetail?.materialName
      ),
      soleId: getIdByName(dataSole, "soleName", getProductDetail?.soleName),
      sizeId: getIdByName(dataSize, "sizeName", getProductDetail?.sizeName),
      genderId: getIdByName(
        dataGender,
        "genderName",
        getProductDetail?.genderName
      ),
      colorId: getIdByName(dataColor, "colorName", getProductDetail?.colorName),
      productId: getIdByName(
        dataProduct,
        "productName",
        getProductDetail?.productName
      ),
    },
  });
  useEffect(() => {
    if (isOpen) {
      reset({
        image: getProductDetail?.image || [],
        description: getProductDetail?.description || "",
        price: getProductDetail?.price || 0,
        quantity: getProductDetail?.quantity || 0,
        weight: getProductDetail?.weight || 0,
        status: getProductDetail?.status || "HOAT_DONG",
        typeId: getIdByName(dataType, "typeName", getProductDetail?.typeName),
        brandId: getIdByName(
          dataBrand,
          "brandName",
          getProductDetail?.brandName
        ),
        materialId: getIdByName(
          dataMaterial,
          "materialName",
          getProductDetail?.materialName
        ),
        soleId: getIdByName(dataSole, "soleName", getProductDetail?.soleName),
        sizeId: getIdByName(dataSize, "sizeName", getProductDetail?.sizeName),
        genderId: getIdByName(
          dataGender,
          "genderName",
          getProductDetail?.genderName
        ),
        colorId: getIdByName(
          dataColor,
          "colorName",
          getProductDetail?.colorName
        ),
        productId: getIdByName(
          dataProduct,
          "productName",
          getProductDetail?.productName
        ),
      });
    }
  }, [
    isOpen,
    getProductDetail,
    reset,
    dataType,
    dataBrand,
    dataMaterial,
    dataSole,
    dataSize,
    dataGender,
    dataColor,
    dataProduct,
  ]);

  useEffect(() => {
    if (!isOpen) {
      reset(); // Reset form when modal closes
    }
    console.log(getProductDetail);
  }, [isOpen, reset]);

  const downloadQRCodeCanvas = () => {
    const canvas = qrCanvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `QRCode_Canvas_${getProductDetail?.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      style={{ top: 20 }}
      open={isOpen}
      title={
        <span className="flex">
          <FaEdit style={{ color: COLORS.primary, marginRight: 8 }} /> Chỉnh sửa{" "}
          {title}
        </span>
      }
      width={1000}
      onCancel={handleClose}
      footer={[
        <Button key="back" onClick={handleClose}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleFormSubmit(async (data) => {
            setLoading(true);
            setCleanUpImage([]);
            // console.warn("đay là exit đấy",exits(data));
            

            // Xóa hình ảnh trước
            const mappedDeleted = deletedRef.current.map((publicId) => ({
              publicId,
              productId: data.productId,
              colorId: data.colorId,
            }));

            await deleteImagesAndUpdate(mappedDeleted); // Đợi xóa hoàn thành trước

            // Sau khi xóa xong mới submit dữ liệu sản phẩm
            await handleSubmit(getProductDetail?.id, data);
            setLoading(false);
            console.warn("Dữ liệu gửi tới server", data);
          })}
          loading={loading}
        >
          Xác nhận
        </Button>,
      ]}
      keyboard={false}
      maskClosable={false}
    >
      <Row gutter={[16, 16]}>
        {/* <Col span={6}>
          <label className="text-sm block mb-2">
            <span className="text-red-600">*</span> Sản phẩm
          </label>
          <Controller
            name="productId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                showSearch
                style={{ width: "100%" }}
                placeholder="Chọn sản phẩm"
                options={dataProduct?.map((item) => ({
                  value: item.id,
                  label: item.productName,
                }))}
                // defaultValue={defaultProductId}
              />
            )}
          />
        </Col> */}
        <Col span={6}>
          <label className="text-sm block mb-2">
            <span className="text-red-600">*</span> Thương hiệu
          </label>
          <Controller
            name="brandId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                showSearch
                style={{ width: "100%" }}
                placeholder="Chọn thương hiệu"
                options={dataBrand?.map((item) => ({
                  value: item.id,
                  label: item.brandName,
                }))}
              />
            )}
          />
        </Col>
        <Col span={6}>
          <label className="text-sm block mb-2">
            <span className="text-red-600">*</span> Loại giày
          </label>
          <Controller
            name="typeId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                showSearch
                style={{ width: "100%" }}
                placeholder="Chọn danh mục"
                options={dataType?.map((item) => ({
                  value: item.id,
                  label: item.typeName,
                }))}
              />
            )}
          />
        </Col>
        <Col span={6}>
          <label className="text-sm block mb-2">
            <span className="text-red-600">*</span> Chất liệu vải
          </label>
          <Controller
            name="materialId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                showSearch
                style={{ width: "100%" }}
                placeholder="Chọn chất liệu vải"
                options={dataMaterial?.map((item) => ({
                  value: item.id,
                  label: item.materialName,
                }))}
              />
            )}
          />
        </Col>
        <Col span={6}>
          <label className="text-sm block mb-2">
            <span className="text-red-600">*</span> Chất liệu đế
          </label>
          <Controller
            name="soleId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                showSearch
                style={{ width: "100%" }}
                placeholder="Chọn chất liệu đế"
                options={dataSole?.map((item) => ({
                  value: item.id,
                  label: item.soleName,
                }))}
              />
            )}
          />
        </Col>
        <Col span={6}>
          <label className="text-sm block mb-2">
            <span className="text-red-600">*</span> Giới tính
          </label>
          <Controller
            name="genderId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                showSearch
                style={{ width: "100%" }}
                placeholder="Chọn giới tính"
                options={dataGender?.map((item) => ({
                  value: item.id,
                  label: item.genderName,
                }))}
              />
            )}
          />
        </Col>
        <Col span={6}>
          <label className="text-sm block mb-2">
            <span className="text-red-600">*</span> Kích cỡ
          </label>
          <Controller
            name="sizeId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                showSearch
                style={{ width: "100%" }}
                placeholder="Chọn kích cỡ"
                options={dataSize?.map((item) => ({
                  value: item.id,
                  label: item.sizeName,
                }))}
              />
            )}
          />
        </Col>
        <Col span={6}>
          <label className="text-sm block mb-2">
            <span className="text-red-600">*</span> Màu sắc
          </label>
          <Controller
            name="colorId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                showSearch
                style={{ width: "100%" }}
                placeholder="Chọn màu sắc"
                options={dataColor?.map((item) => ({
                  value: item.id,
                  label: (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "1.2rem",
                          height: "1.2rem",
                          backgroundColor: item.code,
                          borderRadius: "50%",
                        }}
                      />
                      {item.colorName}
                    </div>
                  ),
                }))}
              />
            )}
          />
        </Col>
        <Col span={6}>
          <label className="text-sm block mb-2">
            <span className="text-red-600">*</span> Số lượng
          </label>
          <Controller
            name="quantity"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                placeholder="Số lượng"
                min={1}
                maxLength={4}
                style={{ width: "100%" }}
                suffix={<span>Đôi</span>}
              />
            )}
          />
          {errors.quantity && (
            <span className="text-red-600">{errors.quantity.message}</span>
          )}
        </Col>

        <Col span={6}>
          <label className="text-sm block mb-2">
            <span className="text-red-600">*</span> Giá bán
          </label>
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                placeholder="Giá bán"
                min={1}
                maxLength={8}
                style={{ width: "100%" }}
                suffix={<span>VNĐ</span>}
              />
            )}
          />
          {errors.price && (
            <span className="text-red-600">{errors.price.message}</span>
          )}
        </Col>

        <Col span={6}>
          <label className="text-sm block mb-2">
            <span className="text-red-600">*</span> Cân nặng
          </label>
          <Controller
            name="weight"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                placeholder="Cân nặng"
                min={100}
                maxLength={4}
                style={{ width: "100%" }}
                suffix={<span>gram</span>}
              />
            )}
          />
          {errors.weight && (
            <span className="text-red-600">{errors.weight.message}</span>
          )}
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Radio.Group {...field}>
                <Row gutter={[8, 8]}>
                  <Col>
                    <Radio.Button
                      value="HOAT_DONG"
                      className={clsx(
                        field.value === "HOAT_DONG" ? styles.statushd : "",
                        styles.statushdhv
                      )}
                    >
                      HOẠT ĐỘNG
                    </Radio.Button>
                  </Col>
                  <Col>
                    <Radio.Button
                      value="NGUNG_HOAT_DONG"
                      className={clsx(
                        field.value === "NGUNG_HOAT_DONG"
                          ? styles.statusnhd
                          : "",
                        styles.statusnhdhv
                      )}
                    >
                      NGỪNG HOẠT ĐỘNG
                    </Radio.Button>
                  </Col>
                </Row>
              </Radio.Group>
            )}
          />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <div ref={qrCanvasRef}>
            <QRCode
              type="canvas"
              value={`${getProductDetail?.id || "https://ant.design/"}`}
              style={{ width: "10rem", height: "auto" }}
            />
          </div>
        </Col>
        <Col>
          <Button
            type="primary"
            onClick={downloadQRCodeCanvas}
            style={{ width: "10rem" }}
          >
            <BiDownload size={23} /> DownLoad-QR
          </Button>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <div>Mô tả</div>
        </Col>
        <Col span={24}>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <ReactQuill
                theme="snow"
                value={field.value}
                onChange={field.onChange}
                placeholder="Mô tả tối đa 200 từ"
                modules={{
                  toolbar: [
                    [{ header: [1, 2, false] }],
                    ["bold", "italic", "underline"],
                  ],
                }}
              />
            )}
          />
        </Col>
        <Col span={24}>
          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <Upload
                customRequest={({ file, onSuccess, onError }) => {
                  cloudinaryUpload(file)
                    .then(({ url, public_id }) => {
                      onSuccess({ url, public_id }); // Trả cả public_id về
                    })
                    .catch(onError);
                }}
                listType="picture-card"
                fileList={field.value.map((img) => ({
                  url: img.url,
                  public_id: img.publicId || "Chưa có ID", // Hiển thị mặc định nếu không có publicId
                  uid: img.uid || img.url,
                  status: img.status || "done", // Đặt status mặc định là 'done'
                  name: img.name || "Ảnh không tên", // Tên file, giá trị mặc định nếu không có
                }))}
                onChange={(info) => onChange(info)} // Gọi hàm onChange khi ảnh thay đổi
                onRemove={(file) => handleRemove(file)} // Xử lý khi ảnh bị xóa
                onPreview={onPreview} // Hàm xem trước ảnh khi nhấp
                multiple={true}
                accept="image/jpeg, image/png"
                

              >
                {/* Hiển thị nút upload nếu số lượng ảnh ít hơn 6 */}
                {field.value.length < 6 && (
                  <button
                    style={{
                      border: 0,
                      background: "none",
                      width: "80px",
                      height: "80px",
                    }}
                    type="button"
                  >
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </button>
                )}
              </Upload>
            )}
          />
        </Col>
      </Row>
    </Modal>
  );
};

export default ModalEditSanPham;
