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
import styles from "./Material.module.css";
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
  fetchMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getMaterial,
  searchNameMaterial,
  existsByMaterialName,
  switchStatus,
} from "./ApiMaterial.js";
import { FaRegTrashCan } from "react-icons/fa6";
import { RxUpdate } from "react-icons/rx";
import clsx from "clsx";
import { debounce } from "lodash";
import { FaEdit } from "react-icons/fa";
import { COLORS } from "../../../constants/constants.js";

const Material = () => {
  const { Title } = Typography;
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isActiveUpdate, setIsActiveUpdate] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [totalMaterials, setTotalMaterials] = useState(0);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [requestSearch, setRequestSearch] = useState({
    name: "",
  });

  const [request, setRequest] = useState({
    materialName: "",
    status: "HOAT_DONG",
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5, // Số dòng hiển thị mỗi trang
  });

  const [formCreate] = Form.useForm();
  const [formUpdate] = Form.useForm();
  const handleSubmit = async (values) => {
    // Cắt khoảng trắng ở đầu và cuối trước khi gửi request
    const trimmedValues = {
      ...values,
      materialName: values?.materialName?.trim(),
    };

    console.log(trimmedValues);

    await handleCreateMaterial(trimmedValues);
    setOpenCreate(false);
    setRequestSearch("");
    formCreate.resetFields(); // Reset form sau khi submit
  };

  const handleSubmitUpdate = async (values) => {
    // Cắt khoảng trắng ở đầu và cuối trước khi gửi request
    const trimmedValues = {
      ...values,
      brandName: values?.brandName?.trim(),
    };

    console.log(trimmedValues);

    await handleUpdateMaterial(trimmedValues);
    setOpenUpdate(false);
    setRequestSearch("");

    formUpdate.resetFields(); // Reset form sau khi submit
  };
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

  // Hàm fetch dữ liệu materials
  useEffect(() => {
    fetchMaterialsData();
  }, [pagination]);

  const fetchMaterialsData = async () => {
    setLoading(true);
    try {
      const { data, total } = requestSearch.name?.trim()
        ? await searchNameMaterial(pagination, requestSearch)
        : await fetchMaterials(pagination);
      setMaterials(data);
      setTotalMaterials(total);
      console.log(requestSearch.name + "đây là search");
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  const searchName = async () => {
    setLoading(true);
    setPagination((prev) => ({ ...prev, current: 1 }));
    try {
      const { data, total } = await searchNameMaterial(
        pagination,
        requestSearch
      );
      setMaterials(data);
      setTotalMaterials(total);
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };
  // thêm
  const handleCreateMaterial = async (materialData) => {
    try {
      setLoading(true);
      console.log(request);
      await createMaterial(materialData);

      setRequestSearch({ name: "" });
      setPagination({ current: 1, pageSize: pagination.pageSize });

      fetchMaterialsData(); // Refresh data after creation
      message.success("Chất liệu đã được tạo thành công!");
    } catch (error) {
      console.error(error);
      //   message.error(error.message || "Có lỗi xảy ra khi tạo Chất liệu.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMaterial = useCallback(async (materialData) => {
    try {
      setLoading(true);

      await updateMaterial(selectedMaterial.data.id, materialData);
      console.log(selectedMaterial.data.id);
      setSelectedMaterial(null);
      setOpenUpdate(false);
      message.success("Cập nhật Chất Liệuthành công");
      fetchMaterialsData(); // Refresh data after update
    } catch (error) {
      console.error(error);
      message.error(error.message || "Có lỗi xảy ra khi cập nhật Chất liệu.");
    } finally {
      setLoading(false);
    }
  });

  // xóa
  const handleDeleteMaterial = useCallback(async (materialId) => {
    try {
      setLoading(true);
      await deleteMaterial(materialId);
      fetchMaterialsData(); // Refresh data after deletion
      message.success("Xóa Chất liệu thành công.");
    } catch (error) {
      console.error(error);
      message.error(error.message || "Có lỗi xảy ra khi xóa Chất liệu.");
    } finally {
      setLoading(false);
    }
  });
  const handleGetMaterial = useCallback(
    async (materialId) => {
      setLoading(true);
      try {
        const materialData = await getMaterial(materialId);
        setSelectedMaterial(materialData);
        console.log(materialData);

        formUpdate.setFieldsValue({
          materialName: materialData.data.materialName || "",
        });

        setOpenUpdate(true); // Hiển thị modal
      } catch (error) {
        message.error(
          error.message || "Có lỗi xảy ra khi tải thông tin Chất liệu."
        );
      } finally {
        setLoading(false); // Tắt trạng thái loading
      }
    },
    [] // Dependency list để tránh re-define hàm không cần thiết
  );

  const handleDataSource = () => {
    const totalRows = pagination.pageSize;
    const dataLength = materials.length;
    const emptyRows = Math.max(totalRows - dataLength, 0);

    const emptyData = new Array(emptyRows).fill({}).map((_, index) => ({
      key: `empty-${index}`, // Thêm key duy nhất
    }));

    return [
      ...materials.map((material, index) => ({
        ...material,
        key: material.id || index,
      })),
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
      title: "Tên Chất Liệu",
      dataIndex: "materialName",
      key: "materialName",
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
                        message.success("Cập nhật trạng thái thành công!");
                        fetchMaterialsData();
                      } catch (error) {
                        message.error("Cập nhật trạng thái thất bại!");
                      }
                    }}
                  />
                </Tooltip>
              </Col>
              <Col>
                <Button
                  onClick={() => handleGetMaterial(record.id)}
                  icon={
                    <FaEdit
                      style={{
                        color: `${COLORS.primary}`,
                        marginRight: 8,
                        fontSize: "1.5rem",
                      }}
                    />
                  }
                >
                  Cập nhật
                </Button>
              </Col>

              {/* <Col>
                <Popconfirm
                  title="Xóa Hãng"
                  description="Bạn có muốn xóa Chất Liệunày kh"
                  okText="Xác nhận"
                  cancelText="Hủy"
                  onConfirm={() => handleDeleteMaterial(record.id)}
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
    handleCreateMaterial(request);

    setTimeout(() => {
      setLoading(false);
      setOpenCreate(false);
      setRequest({
        materialName: "",
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
      <h3>Chất liệu</h3>{" "}
      <div className={"d-flex justify-content-center gap-4 flex-column"}>
        <Row gutter={[16, 16]}>
          <Col span={20}>
            <Input
              placeholder="Nhập vào tên Chất Liệubạn muốn tìm!"
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
            Thêm Chất liệu
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
            title="Thêm chất liệu"
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
            <p>Nhập thông tin chất liệu mới...</p>
            <Form
              form={formCreate}
              onFinish={handleSubmit} // Handle form submission
              layout="vertical"
            >
              <Form.Item
                name="materialName"
                label={`Tên chất liệu`}
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
                            `Tên chất liệu chỉ chứa chữ và số, không có ký tự đặc biệt`
                          )
                        );
                      }
                      if (value.trim().length > 20) {
                        return Promise.reject(
                          new Error(`Tên chất liệu tối đa 20 ký tự`)
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
            title="Sửa Chất liệu"
            onCancel={() => {
              setOpenUpdate(false);
              setRequest({
                materialName: "",
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
                name="materialName"
                label={`Tên Chất liệu`}
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
                            `Tên Chất liệu chỉ chứa chữ và số, không có ký tự đặc biệt`
                          )
                        );
                      }
                      if (value.trim().length > 20) {
                        return Promise.reject(
                          new Error(`Tên chất liệu tối đa 20 ký tự`)
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
          total={totalMaterials}
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

export default Material;
