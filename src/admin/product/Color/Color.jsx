import {
  Table,
  Input,
  Button,
  Row,
  Col,
  Typography,
  Card,
  Modal,
  Pagination,
  message,
  Tag,
  Form,
  Space,
  Radio,
  Flex,
  Grid,
  Popconfirm,
  ColorPicker,
  Tooltip,
  Switch,
} from "antd";
import styles from "./Color.module.css";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import axios from "axios";
import {
  fetchColors,
  createColor,
  updateColor,
  deleteColor,
  getColor,
  searchNameColor,
  existsByColorName,
  switchStatus,
} from "./ApiColor.js";
import { FaRegTrashCan } from "react-icons/fa6";
import { RxUpdate } from "react-icons/rx";
import clsx from "clsx";
import { debounce } from "lodash";
import { FaEdit } from "react-icons/fa";
import { COLORS } from "../../../constants/constants.js";
import { toast } from "react-toastify";

const Color = () => {
  const { Title } = Typography;
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isActiveUpdate, setIsActiveUpdate] = useState(true);
  const [brands, setColors] = useState([]);
  const [totalColors, setTotalColors] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [requestSearch, setRequestSearch] = useState({
    name: "",
  });

  const [request, setRequest] = useState({
    colorName: "",
    status: "HOAT_DONG",
    code: "#000000",
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5, // Số dòng hiển thị mỗi trang
  });
  const error = useRef(null);
  const errorUpdate = useRef(null);
  const [formCreate] = Form.useForm();
  const [formUpdate] = Form.useForm();
  const handleSubmit = async (values) => {
    // Cắt khoảng trắng ở đầu và cuối trước khi gửi request
    const trimmedValues = {
      ...values,
      colorName: values?.colorName?.trim(),
    };

    console.log(trimmedValues);

    await handleCreateColor(trimmedValues);
    setOpenCreate(false);
    setRequestSearch("");
    formCreate.resetFields(); // Reset form sau khi submit
  };

  const handleSubmitUpdate = async (values) => {
    // Cắt khoảng trắng ở đầu và cuối trước khi gửi request
    const trimmedValues = {
      ...values,
      colorName: values?.colorName?.trim(),
    };

    console.log(trimmedValues);

    await handleUpdateColor(trimmedValues);
    setOpenUpdate(false);
    setRequestSearch("");

    formUpdate.resetFields(); // Reset form sau khi submit
  };
  const handleRequest = async (e) => {
    const { name, value } = e.target;
    setRequest((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // validate cho create
  const [errorMessage, setErrorMessage] = useState("");

  useLayoutEffect(() => {
    if (!/^[\p{L}\p{N}\s]{1,20}$/u.test(request.colorName)) {
      setErrorMessage(
        "Tên Màu sắc là chữ, số tối đa 20 ký tự, và không chứa ký tự đặc biệt"
      );
      setIsActive(false);
    } else if (request.colorName.trim() === "") {
      setErrorMessage("Không được để trống");
      setIsActive(false);
    } else {
      setErrorMessage("Hợp lệ !!!");
      setIsActive(true);
    }
  }, [request.colorName]);

  const [errorMessageUpdate, setErrorMessageUpdate] = useState("");

  useLayoutEffect(() => {
    if (!/^[\p{L}\p{N}\s]{1,20}$/u.test(request.colorName)) {
      setErrorMessageUpdate(
        "Tên Màu sắc là chữ, số tối đa 20 ký tự, và không chứa ký tự đặc biệt"
      );
      setIsActiveUpdate(false);
    } else if (request.colorName.trim() === "") {
      setErrorMessageUpdate("Không được để trống");
      setIsActiveUpdate(false);
    } else {
      setErrorMessageUpdate("Hợp lệ !!!");
      setIsActiveUpdate(true);
    }
  }, [request.colorName]);
  // Hàm fetch dữ liệu brands
  useEffect(() => {
    fetchColorsData();
  }, [pagination]);

  const fetchColorsData = async () => {
    setLoading(true);
    try {
      const { data, total } = requestSearch.name?.trim()
        ? await searchNameColor(pagination, requestSearch)
        : await fetchColors(pagination);
      setColors(data);
      setTotalColors(total);
      console.log(requestSearch.name + "đây là search");
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  const searchName = async () => {
    setLoading(true);
    setPagination((prev) => ({ ...prev, current: 1 }));
    try {
      const { data, total } = await searchNameColor(pagination, requestSearch);
      setColors(data);
      setTotalColors(total);
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };
  // thêm
  const handleCreateColor = async (brandData) => {
    try {
      setLoading(true);
      console.log(request);
      await createColor(brandData);

      setRequestSearch({ name: "" });
      setPagination({ current: 1, pageSize: pagination.pageSize });

      fetchColorsData(); // Refresh data after creation
      toast.success("Màu sắc đã được tạo thành công!");
    } catch (error) {
      console.error(error);
      //   message.error(error.message || "Có lỗi xảy ra khi tạo Màu sắc.");
    } finally {
      setLoading(false);
      setRequest({
        colorName: "",
        status: "HOAT_DONG",
        code: "#000000",
      });
    }
  };

  const handleUpdateColor = useCallback(async (brandData) => {
    try {
      setLoading(true);

      await updateColor(selectedColor.data.id, brandData);
      console.log(selectedColor.data.id);
      setSelectedColor(null);
      setOpenUpdate(false);
      toast.success("Cập nhật Màu sắc thành công");
      fetchColorsData(); // Refresh data after update
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật Màu sắc.");
    } finally {
      setLoading(false);
      setRequest({
        colorName: "",
        status: "HOAT_DONG",
        code: "#000000",
      });
    }
  });

  // xóa
  const handleDeleteColor = useCallback(async (brandId) => {
    try {
      setLoading(true);
      await deleteColor(brandId);
      fetchColorsData(); // Refresh data after deletion
      toast.success("Xóa Màu sắc thành công.");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Có lỗi xảy ra khi xóa Màu sắc.");
    } finally {
      setLoading(false);
    }
  });
  const handleGetColor = useCallback(
    async (brandId) => {
      setLoading(true);
      try {
        const brandData = await getColor(brandId);
        setSelectedColor(brandData);
        console.log(brandData);

        formUpdate.setFieldsValue({
          colorName: brandData.data.colorName || "",
          code: brandData.data.code,
        });

        setOpenUpdate(true); // Hiển thị modal
      } catch (error) {
        toast.error(
          error.message || "Có lỗi xảy ra khi tải thông tin Màu sắc."
        );
      } finally {
        setLoading(false); // Tắt trạng thái loading
      }
    },
    [] // Dependency list để tránh re-define hàm không cần thiết
  );

  const handleDataSource = () => {
    const totalRows = pagination.pageSize;
    const dataLength = brands.length;
    const emptyRows = Math.max(totalRows - dataLength, 0);

    const emptyData = new Array(emptyRows).fill({}).map((_, index) => ({
      key: `empty-${index}`, // Thêm key duy nhất
    }));

    return [
      ...brands.map((brand, index) => ({ ...brand, key: brand.id || index })),
      ...emptyData,
    ];
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: "5rem",
      render: (_, __, index) => (
        <div style={{ height: "2rem" }}>
          {index + 1 + (pagination.current - 1) * pagination.pageSize}
        </div>
      ),
    },
    {
      title: "Màu sắc",
      dataIndex: "colorName",
      key: "colorName",
      render: (text, record) => {
        // Tìm mã màu tương ứng
        if (!record.id) return null;

        const colorCode = record.code ? record.code : "#FFFFFF"; // Mặc định màu trắng nếu không tìm thấy

        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "1rem", // Đường kính hình tròn
                height: "1rem", // Đường kính hình tròn
                borderRadius: "50%", // Tạo hình tròn
                backgroundColor: colorCode, // Mã màu nền
                marginRight: "8px",
                border: "1px solid gray",
              }}
            />
            <span>{record.colorName}</span>
          </div>
        );
      },
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updateAt",
      key: "updateAt",
      width: "15rem",
      render: (text) => {
        // Kiểm tra xem ngày có hợp lệ không
        const date = new Date(text);
        if (isNaN(date.getTime())) {
          return ""; // Nếu không hợp lệ, trả về chuỗi trống
        }
        return date.toLocaleDateString(); // Nếu hợp lệ, trả về ngày đã format
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "15rem",
      render: (_, { status }) => {
        let color = status === "HOAT_DONG" ? "green" : "red";
        if (!status) {
          return null;
        }
        return (
          <Tag color={color} style={{ fontSize: "12px", padding: "5px 15px" }}>
            {status === "HOAT_DONG" ? "Hoạt động" : "Ngừng hoạt động"}{" "}
            {/* Hiển thị status với chữ in hoa */}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => {
        if (!record.id || Object.keys(record).length === 0) {
          return null;
        }
        return (
          <>
            <Row gutter={[16, 16]}>
              <Col>
                <Tooltip title="Thay đổi trạng thái">
                  <Switch
                    checked={record.status === "HOAT_DONG"}
                    onChange={async (checked) => {
                      try {
                        await switchStatus(record.id, {
                          status: checked ? "HOAT_DONG" : "NGUNG_HOAT_DONG",
                        });
                        toast.success("Cập nhật trạng thái thành công!");
                        fetchColorsData();
                      } catch (error) {
                        toast.error("Cập nhật trạng thái thất bại!");
                      }
                    }}
                  />
                </Tooltip>
              </Col>
              <Col>
                <Button
                  icon={
                    <FaEdit
                      style={{
                        color: `${COLORS.primary}`,
                        marginRight: 8,
                        fontSize: "1.5rem",
                      }}
                    />
                  }
                  onClick={() => handleGetColor(record.id)}
                >
                  Cập nhật
                </Button>
              </Col>

              {/* <Col>
                <Popconfirm
                  title="Xóa Hãng"
                  description="Bạn có muốn xóa Màu sắc này kh"
                  okText="Xác nhận"
                  cancelText="Hủy"
                  onConfirm={() => handleDeleteColor(record.id)}
                >
                  <Button className={`${styles.buttonDelete} ant-btn`}>
                    <FaRegTrashCan size={20} color="#FF4D4F" /> xóa
                  </Button>
                </Popconfirm>
              </Col> */}
            </Row>
          </>
        );
      },
    },
  ];
  return (
    <Card>
      <h3>Màu sắc</h3>{" "}
      <div className={"d-flex justify-content-center gap-4 flex-column"}>
        <Row gutter={[16, 16]}>
          <Col span={20}>
            <Input
              placeholder="Nhập vào tên Màu sắc bạn muốn tìm!"
              prefix={<SearchOutlined />}
              allowClear
              name="name"
              value={requestSearch.name}
              onChange={(e) => {
                setRequestSearch((prev) => ({
                  ...prev,
                  name: e.target.value, // Cập nhật giá trị nhập vào
                }));
              }}
              onPressEnter={searchName}
            />
          </Col>

          <Col span={4}>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={searchName}
              style={{}}
            >
              Tìm kiếm
            </Button>
          </Col>
        </Row>

        <Row style={{ marginTop: 20 }}>
          <Button
            type="primary"
            onClick={() => {
              setOpenCreate(true);
            }}
            style={{}}
          >
            Thêm Màu sắc
          </Button>
          <Button
            type="primary"
            onClick={() => {
              setRequestSearch({ name: "" });
              setPagination({ current: 1, pageSize: pagination.pageSize });
            }}
            style={{ marginLeft: "2rem" }}
          >
            Làm mới
          </Button>
          <Modal
            open={openCreate}
            title="Thêm màu sắc"
            onCancel={() => {
              setOpenCreate(false);
            }}
            footer={[
              <Button
                key="back"
                onClick={() => {
                  setOpenCreate(false);
                }}
              >
                Hủy
              </Button>,
              <Popconfirm
                title="Bạn có chắc chắn muốn xác nhận không?"
                okText="Có"
                cancelText="Không"
                onConfirm={() => formCreate.submit()}
              >
                <Button
                  key="submit"
                  type="primary"
                  loading={loading}
                  // disabled={!isActive}
                >
                  Xác nhận
                </Button>
              </Popconfirm>,
            ]}
          >
            <p>Nhập thông tin giới tính mới...</p>
            <Form
              form={formCreate}
              onFinish={handleSubmit} // Handle form submission
              layout="vertical"
            >
              <Form.Item
                name="colorName"
                label={`Tên màu sắc`}
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value || !value.trim()) {
                        return Promise.reject(
                          new Error(
                            "Không được để trống hoặc chỉ có khoảng trắng"
                          )
                        );
                      }
                      if (!/^[\p{L}\p{N} ]+$/u.test(value.trim())) {
                        return Promise.reject(
                          new Error(
                            `Tên màu sắc chỉ chứa chữ và số, không có ký tự đặc biệt`
                          )
                        );
                      }
                      if (value.trim().length > 20) {
                        return Promise.reject(
                          new Error(`Tên màu sắc tối đa 20 ký tự`)
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input placeholder="Nhập tên mới vào đây!" allowClear />
              </Form.Item>
              <Form.Item name="code">
                <div>Chọn màu</div>
                <ColorPicker
                  defaultValue={"#000000"}
                  onChange={(value) => {
                    formCreate.setFieldsValue({
                      code: value.toHexString() || "",
                    });
                    console.log(value);
                  }}
                />
              </Form.Item>
            </Form>
          </Modal>
          <Modal
            open={openUpdate}
            title="Sửa màu sắc"
            onCancel={() => {
              setOpenUpdate(false);
              setRequest({
                colorName: "",
                status: "HOAT_DONG",
              });
            }}
            footer={[
              <Button
                key="back"
                onClick={() => {
                  setOpenUpdate(false);
                }}
              >
                Hủy
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={loading}
                onClick={() => formUpdate.submit()}
                // disabled={!isActiveUpdate}
              >
                Xác nhận
              </Button>,
            ]}
          >
            <p>Nhập thông tin Muốn sửa...</p>

            <Form
              form={formUpdate}
              onFinish={handleSubmitUpdate} // Handle form submission
              layout="vertical"
            >
              <Form.Item
                name="colorName"
                label={`Tên màu sắc`}
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value || !value.trim()) {
                        return Promise.reject(
                          new Error(
                            "Không được để trống hoặc chỉ có khoảng trắng"
                          )
                        );
                      }
                      if (!/^[\p{L}\p{N} ]+$/u.test(value.trim())) {
                        return Promise.reject(
                          new Error(
                            `Tên màu sắc chỉ chứa chữ và số, không có ký tự đặc biệt`
                          )
                        );
                      }
                      if (value.trim().length > 20) {
                        return Promise.reject(
                          new Error(`Tên màu sắc tối đa 20 ký tự`)
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input placeholder="Nhập tên mới vào đây!" allowClear />
              </Form.Item>
              <Form.Item label="Chọn màu" name="code">
                <ColorPicker
                  value={formUpdate.getFieldValue("code")} // Hiển thị màu hiện tại
                  onChange={(color) => {
                    const hexColor = color.toHexString(); // Lấy mã hex
                    formUpdate.setFieldsValue({ code: hexColor });
                  }}
                />
              </Form.Item>
            </Form>
          </Modal>
        </Row>

        <Table
          columns={columns}
          dataSource={handleDataSource()} // Dữ liệu đã xử lý với dòng trống
          loading={loading}
          pagination={false} // Bỏ pagination trong Table
          locale={{
            emptyText: (
              <div style={{ textAlign: "center" }}>
                <p>No data</p>
              </div>
            ),
          }}
        />

        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={totalColors}
          showSizeChanger
          pageSizeOptions={["3", "5", "10", "20"]}
          onShowSizeChange={(current, pageSize) => {
            setPagination({
              current: 1, // Quay lại trang 1 khi thay đổi số lượng phần tử mỗi trang
              pageSize,
            });
            // fetchColorsData(); // Gọi lại API để cập nhật dữ liệu phù hợp
          }}
          onChange={(page, pageSize) => {
            setPagination({ current: page, pageSize });
            // fetchColorsData(); // Gọi lại API để cập nhật dữ liệu phù hợp
          }}
        />
      </div>
    </Card>
  );
};

export default Color;
