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
  Tooltip,
  Switch,
} from "antd";
import { COLORS } from "../../../constants/constants.js";
import styles from "./Sole.module.css";
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
  fetchSoles,
  createSole,
  updateSole,
  deleteSole,
  getSole,
  searchNameSole,
  existsBySoleName,
  switchStatus,
} from "./ApiSole.js";
import { FaRegTrashCan } from "react-icons/fa6";
import { RxUpdate } from "react-icons/rx";
import clsx from "clsx";
import { debounce } from "lodash";
import { FaEdit } from "react-icons/fa";
import { color } from "framer-motion";
import { toast } from "react-toastify";

const Sole = () => {
  const { Title } = Typography;
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isActiveUpdate, setIsActiveUpdate] = useState(true);
  const [soles, setSoles] = useState([]);
  const [totalSoles, setTotalSoles] = useState(0);
  const [selectedSole, setSelectedSole] = useState(null);
  const [requestSearch, setRequestSearch] = useState({
    name: "",
  });

  const [request, setRequest] = useState({
    soleName: "",
    status: "HOAT_DONG",
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5, // Số dòng hiển thị mỗi trang
  });
  const error = useRef(null);
  const errorUpdate = useRef(null);

  const handleRequest = async (e) => {
    const { name, value } = e.target;
    setRequest((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // validate cho create
  const [errorMessage, setErrorMessage] = useState("");
  const [formCreate] = Form.useForm();
  const [formUpdate] = Form.useForm();
  const handleSubmit = async (values) => {
    // Cắt khoảng trắng ở đầu và cuối trước khi gửi request
    const trimmedValues = {
      ...values,
      soleName: values?.soleName?.trim(),
    };

    console.log(trimmedValues);

    await handleCreateSole(trimmedValues);
    setOpenCreate(false);
    setRequestSearch("");
    formCreate.resetFields(); // Reset form sau khi submit
  };

  const handleSubmitUpdate = async (values) => {
    // Cắt khoảng trắng ở đầu và cuối trước khi gửi request
    const trimmedValues = {
      ...values,
      soleName: values?.soleName?.trim(),
    };

    console.log(trimmedValues);

    await handleUpdateSole(trimmedValues);
    setOpenUpdate(false);
    setRequestSearch("");

    formUpdate.resetFields(); // Reset form sau khi submit
  };

  // Hàm fetch dữ liệu soles
  useEffect(() => {
    fetchSolesData();
  }, [pagination]);

  const fetchSolesData = async () => {
    setLoading(true);
    try {
      const { data, total } = requestSearch.name?.trim()
        ? await searchNameSole(pagination, requestSearch)
        : await fetchSoles(pagination);
      setSoles(data);
      setTotalSoles(total);
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
      const { data, total } = await searchNameSole(pagination, requestSearch);
      setSoles(data);
      setTotalSoles(total);
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };
  // thêm
  const handleCreateSole = async (soleData) => {
    try {
      setLoading(true);
      console.log(request);
      await createSole(soleData);

      setRequestSearch({ name: "" });
      setPagination({ current: 1, pageSize: pagination.pageSize });

      fetchSolesData(); // Refresh data after creation
      toast.success("Đế đã được tạo thành công!");
    } catch (error) {
      console.error(error);
      //   message.error(error.message || "Có lỗi xảy ra khi tạo thương hiệu.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSole = useCallback(async (soleData) => {
    try {
      setLoading(true);

      await updateSole(selectedSole.data.id, soleData);
      console.log(selectedSole.data.id);
      setSelectedSole(null);
      setOpenUpdate(false);
      toast.success("Cập nhật Đế giàythành công");
      fetchSolesData(); // Refresh data after update
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật thương hiệu.");
    } finally {
      setLoading(false);
    }
  });

  // xóa
  const handleDeleteSole = useCallback(async (soleId) => {
    try {
      setLoading(true);
      await deleteSole(soleId);
      fetchSolesData(); // Refresh data after deletion
      toast.success("Xóa thương hiệu thành công.");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Có lỗi xảy ra khi xóa thương hiệu.");
    } finally {
      setLoading(false);
    }
  });
  const handleGetSole = useCallback(
    async (soleId) => {
      setLoading(true);
      try {
        const soleData = await getSole(soleId);
        setSelectedSole(soleData);
        console.log(soleData);

        formUpdate.setFieldsValue({
          soleName: soleData.data.soleName || "",
        });

        setOpenUpdate(true); // Hiển thị modal
      } catch (error) {
        toast.error(
          error.toast || "Có lỗi xảy ra khi tải thông tin thương hiệu."
        );
      } finally {
        setLoading(false); // Tắt trạng thái loading
      }
    },
    [] // Dependency list để tránh re-define hàm không cần thiết
  );

  const handleDataSource = () => {
    const totalRows = pagination.pageSize;
    const dataLength = soles.length;
    const emptyRows = Math.max(totalRows - dataLength, 0);

    const emptyData = new Array(emptyRows).fill({}).map((_, index) => ({
      key: `empty-${index}`, // Thêm key duy nhất
    }));

    return [
      ...soles.map((sole, index) => ({ ...sole, key: sole.id || index })),
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
      title: "Tên Đế giày",
      dataIndex: "soleName",
      key: "soleName",
      width: "20rem",
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
                        fetchSolesData();
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
                  onClick={() => handleGetSole(record.id)}
                >
                  Cập nhật
                </Button>
              </Col>

              {/* <Col>
                <Popconfirm
                  title="Xóa Hãng"
                  description="Bạn có muốn xóa Đế giàynày kh"
                  okText="Xác nhận"
                  cancelText="Hủy"
                  onConfirm={() => handleDeleteSole(record.id)}
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

  const handleCreate = () => {
    setLoading(true);
    handleCreateSole(request);

    setTimeout(() => {
      setLoading(false);
      setOpenCreate(false);
      setRequest({
        soleName: "",
        status: "HOAT_DONG",
      });
    }, 800);
  };
  const handleUpdate = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setOpenUpdate(false);
    }, 800);
  };

  return (
    <Card>
      <h3>Đế giày</h3>
      <div className={"d-flex justify-content-center gap-4 flex-column"}>
        <Row gutter={[16, 16]}>
          <Col span={20}>
            <Input
              placeholder="Nhập vào tên Đế giàybạn muốn tìm!"
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
            Thêm Đế giày
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
            title="Thêm đế giày"
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
            <p>Nhập thông tin đế giày mới...</p>
            <Form
              form={formCreate}
              onFinish={handleSubmit} // Handle form submission
              layout="vertical"
            >
              <Form.Item
                name="soleName"
                label={`Tên đế giày`}
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
                            `Tên đế giày chỉ chứa chữ và số, không có ký tự đặc biệt`
                          )
                        );
                      }
                      if (value.trim().length > 20) {
                        return Promise.reject(
                          new Error(`Tên đế giày tối đa 20 ký tự`)
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input placeholder="Nhập tên mới vào đây!" allowClear />
              </Form.Item>
            </Form>
          </Modal>
          <Modal
            open={openUpdate}
            title="Sửa đế giày"
            onCancel={() => {
              setOpenUpdate(false);
              setRequest({
                soleName: "",
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
                name="soleName"
                label={`Tên đế giày`}
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
                            `Tên đế giày chỉ chứa chữ và số, không có ký tự đặc biệt`
                          )
                        );
                      }
                      if (value.trim().length > 20) {
                        return Promise.reject(
                          new Error(`Tên đế giày tối đa 20 ký tự`)
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input placeholder="Nhập tên mới vào đây!" allowClear />
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
          total={totalSoles}
          showSizeChanger
          pageSizeOptions={["3", "5", "10", "20"]}
          onShowSizeChange={(current, pageSize) => {
            setPagination({
              current: 1, // Quay lại trang 1 khi thay đổi số lượng phần tử mỗi trang
              pageSize,
            });
          }}
          onChange={(page, pageSize) => {
            setPagination({ current: page, pageSize });
          }}
        />
      </div>
    </Card>
  );
};

export default Sole;
