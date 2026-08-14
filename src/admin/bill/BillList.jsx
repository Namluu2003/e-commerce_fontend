import React, { useEffect, useState } from "react";
import {
  Space,
  Table,
  Input,
  Tabs,
  Card,
  Col,
  Row,
  Button,
  Select,
  DatePicker,
  Form,
} from "antd";
import axios from "axios";
import { baseUrl } from "../../helpers/Helpers.js";
// import useUrlBuilder from './hooks/useUrlBuilder';
import { columnsBillList } from "./columns/columns.jsx";
import { itemsTabsBillList } from "./items_tabs/ItemsTabs.jsx";
import useUrlBuilder from "./hooks/useUrlBuilder.jsx";
import dayjs from "dayjs";

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const BillList = () => {
  //em tú code thêm
  const [billCounts, setBillCounts] = useState({}); // Lưu số lượng hóa đơn theo trạng thái
  // em tú hết code
  const defaultURL = `${baseUrl}/api/admin/bill/index`;
  const [activeTab, setActiveTab] = useState("all");
  const [billsData, setBillsData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    total: 0,
  });
  const [searchParams, setSearchParams] = useState({
    search: "",
    typeBill: "null",
    startDate: null,
    endDate: null,
  });
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  // Sử dụng custom hook để tạo URL
  const url = useUrlBuilder(defaultURL, activeTab, pagination, searchParams);

  //em tú hết
  useEffect(() => {
    getBill();
  }, [url]);

  const getBill = async () => {
    setLoading(true);
    try {
      const response = await axios.get(url);
      setBillsData(response.data.data);
      setPagination({
        ...pagination,
        page: response.data.currentPage,
        total: response.data.totalElements,
      });
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnChangeTable = (paginationTable) => {
    setPagination({
      ...pagination,
      page: paginationTable.current - 1, // Trang hiện tại
      size: paginationTable.pageSize, // Số mục mỗi trang
    });
  };
  useEffect(() => {
    form.setFieldsValue({
      startDate: dayjs(), // hoặc bạn format nếu muốn
    });
  }, []);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    console.log(values.startDate);
    setSearchParams({
      search: values.search || "",
      typeBill: values.typeBill || "null",
      startDate: values.startDate || null,
      endDate: values.endDate || null,
    });
  };

  const handleReset = () => {
    form.resetFields();
    setSearchParams({
      search: "",
      typeBill: "null",
      startDate: null,
      endDate: null,
    });
    setPagination({
      ...pagination,
      page: 0,
    });
  };

  const onChangeTab = (key) => {
    setActiveTab(key);
    setPagination({
      ...pagination,
      page: 0,
    });
  };

  return (
    <div className="d-flex flex-column gap-3">
      <h2>Quản lý hóa đơn</h2>
      <Card className="flex-column gap-5 d-flex">
        <div className="d-flex gap-2 align-items-center">
          <h3>Bộ lọc</h3>
        </div>
        <hr />
        <Form {...layout} form={form} name="control-hooks">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="search" label="Tìm kiếm">
                <Input maxLength={100} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="typeBill" label="Loại đơn">
                <Select placeholder="Select an option" allowClear>
                  <Select.Option value="null">Tất cả</Select.Option>
                  <Select.Option value="ONLINE">Online</Select.Option>
                  <Select.Option value="OFFLINE">Tại quầy</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startDate" label="Ngày bắt đầu">
                <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="Ngày kết thúc">
                <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <div className="d-flex justify-content-center gap-3">
            <Button type="primary" htmlType="button" onClick={handleSearch}>
              Tìm kiếm
            </Button>
            <Button htmlType="button" onClick={handleReset}>
              Làm mới
            </Button>
          </div>
        </Form>
      </Card>

      <Card>
        <h4>Danh sách hóa đơn</h4>
        <hr />
        <Tabs
          defaultActiveKey="all"
          items={itemsTabsBillList(billCounts)}
          onChange={onChangeTab}
        />
        <div className="d-flex justify-content-center">
          <Table
            className="w-100"
            onChange={handleOnChangeTable}
            pagination={{
              current: pagination.page + 1,
              pageSize: pagination.size,
              total: pagination.total,
            }}
            columns={columnsBillList()}
            dataSource={billsData}
            loading={loading}
          />
        </div>
      </Card>
    </div>
  );
};

export default BillList;
