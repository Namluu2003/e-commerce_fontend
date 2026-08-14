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
} from "antd";
// <<<<<<< HEAD
// import styles from "./Category.module.css";
// =======
// >>>>>>> 4d13b44762587031a9e4c244d9430790911bb36f
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState, useCallback, useRef, useLayoutEffect } from "react";
import axios from "axios";
import {
  fetchBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  searchNameBrand,
  existsByBrandName,
} from "./Brand/apibrand.js";
import { FaRegTrashCan } from "react-icons/fa6";
import { RxUpdate } from "react-icons/rx";
import clsx from "clsx";
import { debounce } from "lodash";

const Category = () => {
  const { Title } = Typography;
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isActiveUpdate, setIsActiveUpdate] = useState(true);
  const [brands, setBrands] = useState([]);
  const [totalBrands, setTotalBrands] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [requestSearch, setRequestSearch] = useState({
    name: "",
  });

  const [request, setRequest] = useState({
    brandName: "",
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

  useLayoutEffect(() => {
    if (!/^[\p{L}\p{N}\s]{1,20}$/u.test(request.brandName)) {
      setErrorMessage("Tên hãng là chữ, số tối đa 20 ký tự, và không chứa ký tự đặc biệt");
      setIsActive(false);
    } else if (request.brandName.trim() === "") {
      setErrorMessage("Không được để trống");
      setIsActive(false);
    } else {
      setErrorMessage("Hợp lệ !!!");
      setIsActive(true);
    }
  }, [request.brandName]);
  
  const [errorMessageUpdate, setErrorMessageUpdate] = useState("");

  useLayoutEffect(() => {
    if (!/^[\p{L}\p{N}\s]{1,20}$/u.test(request.brandName)) {
      setErrorMessageUpdate("Tên hãng là chữ, số tối đa 20 ký tự, và không chứa ký tự đặc biệt");
      setIsActiveUpdate(false);
    } else if (request.brandName.trim() === "") {
      setErrorMessageUpdate("Không được để trống");
      setIsActiveUpdate(false);
    } else {
      setErrorMessageUpdate("Hợp lệ !!!");
      setIsActiveUpdate(true);
    }
  }, [request.brandName]);
  // Hàm fetch dữ liệu brands
  useEffect(() => {
    fetchBrandsData();
  }, [pagination]);

  const fetchBrandsData = async () => {
    setLoading(true);
    try {
      const { data, total } = requestSearch.name.trim()
        ? await searchNameBrand(pagination, requestSearch)
        : await fetchBrands(pagination);
      setBrands(data);
      setTotalBrands(total);
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
      const { data, total } = await searchNameBrand(pagination, requestSearch);
      setBrands(data);
      setTotalBrands(total);
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };
  // thêm
  const handleCreateBrand = async (brandData) => {
    try {
      setLoading(true);
      console.log(request);
      await createBrand(brandData);

      setRequestSearch({ name: "" });
      setPagination({ current: 1, pageSize: pagination.pageSize });

      fetchBrandsData(); // Refresh data after creation
      message.success("Thương hiệu đã được tạo thành công!");
    } catch (error) {
      console.error(error);
      //   message.error(error.message || "Có lỗi xảy ra khi tạo thương hiệu.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBrand = useCallback(async (brandData) => {
    try {
      setLoading(true);

      await updateBrand(selectedBrand.data.id, brandData);
      console.log(selectedBrand.data.id);
      setSelectedBrand(null);
      setOpenUpdate(false);
      message.success("Cập nhật Hãng thành công");
      fetchBrandsData(); // Refresh data after update
    } catch (error) {
      console.error(error);
      message.error(error.message || "Có lỗi xảy ra khi cập nhật thương hiệu.");
    } finally {
      setLoading(false);
    }
  });

  // xóa
  const handleDeleteBrand = useCallback(async (brandId) => {
    try {
      setLoading(true);
      await deleteBrand(brandId);
      fetchBrandsData(); // Refresh data after deletion
      message.success("Xóa thương hiệu thành công.");
    } catch (error) {
      console.error(error);
      message.error(error.message || "Có lỗi xảy ra khi xóa thương hiệu.");
    } finally {
      setLoading(false);
    }
  });
  const handleGetBrand = useCallback(
    async (brandId) => {
      setLoading(true);
      try {
        const brandData = await getBrand(brandId);
        setSelectedBrand(brandData);
        console.log(brandData);

        setRequest({
          brandName: brandData.data.brandName,
          status: brandData.data.status,
        }); // Cập nhật form với thông tin từ API

        setOpenUpdate(true); // Hiển thị modal
      } catch (error) {
        message.error(
          error.message || "Có lỗi xảy ra khi tải thông tin thương hiệu."
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
      title: "Tên Hãng",
      dataIndex: "brandName",
      key: "brandName",
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
          <Tag color={color} style={{ fontSize: "14px", padding: "6px 12px" }}>
            {status} {/* Hiển thị status với chữ in hoa */}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => {
        if (!record.status || Object.keys(record).length === 0) {
          return null;
        }
        return (
          <>
            <Row gutter={[16, 16]}>
              <Col>
                <Button onClick={() => handleGetBrand(record.id)}>
                  <RxUpdate size={20} color="primary" /> Cập nhật
                </Button>
              </Col>

              <Col>
                <Popconfirm
                  title="Xóa Hãng"
                  description="Bạn có muốn xóa hãng này kh"
                  okText="Xác nhận"
                  cancelText="Hủy"
                  onConfirm={() => handleDeleteBrand(record.id)}
                >
                  <Button className={`${styles.buttonDelete} ant-btn`}>
                    <FaRegTrashCan size={20} color="#FF4D4F" /> xóa
                  </Button>
                </Popconfirm>
              </Col>
            </Row>
          </>
        );
      },
    },
  ];

  const handleCreate = () => {
    setLoading(true);
    handleCreateBrand(request);

    setTimeout(() => {
      setLoading(false);
      setOpenCreate(false);
      setRequest({
        brandName: "",
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
      <Title level={2}>Hãng</Title>
      <div className={"d-flex justify-content-center gap-4 flex-column"}>
        <Row gutter={[16, 16]}>
          <Col span={20}>
            <Input
              placeholder="Nhập vào tên hãng bạn muốn tìm!"
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
            />
          </Col>

          <Col span={4}>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={searchName}
              style={{
                backgroundColor: "#90649C",
                borderColor: "#90649C",
                color: "#fff",
              }}
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
            style={{
                backgroundColor: "#90649C",
                borderColor: "#90649C",
                color: "#fff",
              }}
          >
            Thêm Hãng
          </Button>
          <Modal
            open={openCreate}
            title="Thêm Hãng"
            onOk={handleCreate}
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
              <Button
                key="submit"
                type="primary"
                loading={loading}
                onClick={handleCreate}
                disabled={!isActive}
              >
                Xác nhận
              </Button>,
            ]}
          >
            <p>Nhập thông tin hãng mới...</p>
            <Form>
              <Input
                placeholder="Nhập tên hãng vào đây!"
                style={{ marginBottom: "0.3rem" }}
                value={request.brandName}
                name="brandName"
                onChange={handleRequest}
                allowClear
              />
             <div style={{ color: isActive ? "green" : "red" }}>{errorMessage}</div>

              <Radio.Group
                onChange={handleRequest}
                value={request.status}
                name="status"
                style={{
                  marginTop: "0.5rem",
                }}
              >
                <Row gutter={[1, 1]}>
                  <Col>
                    <Radio.Button
                      value="HOAT_DONG"
                      className={clsx(
                        request.status === "HOAT_DONG" ? styles.statushd : "",
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
                        request.status === "NGUNG_HOAT_DONG"
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
            </Form>
          </Modal>
          <Modal
            open={openUpdate}
            title="Sửa Hãng"
            onOk={handleUpdate}
            onCancel={() => {
              setOpenUpdate(false);
              setRequest({
                brandName: "",
                status: "HOAT_DONG"
              })
              
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
                onClick={() => handleUpdateBrand(request)}
                disabled={!isActiveUpdate}
              >
                Xác nhận
              </Button>,
            ]}
          >
            <p>Nhập thông tin Muốn sửa...</p>

            <Form>
              <Input
                placeholder="Nhập tên hãng vào đây!"
                style={{ marginBottom: "0.3rem" }}
                value={request.brandName} // Bind to 'brand' in state
                name="brandName" // Ensure 'name' matches the key in the state
                onChange={handleRequest} // Update state when input changes
                allowClear
              />
                  <div style={{ color: isActiveUpdate ? "green" : "red" }}>{errorMessageUpdate}</div>

              <Radio.Group
                onChange={handleRequest} // Handle the status change
                value={request.status} // Bind to 'status' in state
                name="status" // Ensure 'name' matches the key in the state
              >
                <Row gutter={[1, 1]}>
                  <Col>
                    <Radio.Button
                      value="HOAT_DONG"
                      className={clsx(
                        request.status === "HOAT_DONG" ? styles.statushd : "",
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
                        request.status === "NGUNG_HOAT_DONG"
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
          total={totalBrands}
          showSizeChanger
          pageSizeOptions={["3", "5", "10", "20"]}
          onShowSizeChange={(current, pageSize) => {
            setPagination({
              current: 1, // Quay lại trang 1 khi thay đổi số lượng phần tử mỗi trang
              pageSize,
            });
            fetchBrandsData(); // Gọi lại API để cập nhật dữ liệu phù hợp
          }}
          onChange={(page, pageSize) => {
            setPagination({ current: page, pageSize });
            fetchBrandsData(); // Gọi lại API để cập nhật dữ liệu phù hợp
          }}
        />
      </div>
    </Card>
  );
};

export default Category;
