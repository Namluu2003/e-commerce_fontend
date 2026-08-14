// import React, { useEffect, useState, useMemo } from 'react';
// import { Space, Table, Input, DatePicker, Select, Card, Button, Modal, Form, message, Col, Row, theme, Tag, Radio, Spin, List } from 'antd';
// import axios from 'axios';
// import { baseUrl, convertStatusVoucher, ConvertvoucherType, ConvertdiscountType } from '../../helpers/Helpers.js';
// import useUrlBuilders from './hooks/useURLS.jsx';
// import moment from 'moment';
// import { DownOutlined } from '@ant-design/icons';
// import "./StatusSelector.css";
// import { render } from 'react-dom';
// import { EyeOutlined, EditOutlined, DeleteOutlined, RedoOutlined, PlusOutlined } from '@ant-design/icons';
// import { FaEye } from "react-icons/fa6";
// import { FaEdit } from "react-icons/fa";
// import { Link,useNavigate  } from 'react-router-dom';




// const { Option } = Select;

// //table
// const columns = (handleEdit, handleDelete, handleDetail) => [
//     {
//         title: 'STT',
//         dataIndex: 'stt',
//         key: 'stt',
//         align: 'center',

//         render: (text, record, index) => index + 1,
//     },
//     {
//         title: 'Mã phiếu giảm giá',
//         dataIndex: 'voucherCode',
//         key: 'voucherCode',
//         align: 'center',

//     },
//     {
//         title: 'Tên phiếu giảm giá',
//         dataIndex: 'voucherName',
//         key: 'voucherName',
//         align: 'center',

//     },
//     {
//         title: 'Loại phiếu giảm giá',
//         dataIndex: 'voucherType',
//         key: 'voucherType',
//         align: 'center',

//         render: (text, record) => {
//             let displayStatus = ConvertvoucherType(record.voucherType);
//             return (
//                 <span>
//                     {displayStatus}
//                 </span>
//             );
//         },
//     },
//     {
//         title: 'Loại giảm giá',
//         dataIndex: 'discountType',
//         key: 'discountType',
//         align: 'center',

//         render: (text, record) => {
//             let displayStatus = ConvertdiscountType(record.discountType);
//             return (
//                 <span>
//                     {displayStatus}
//                 </span>
//             );
//         },
//     },
//     {
//         title: 'Số lượng phiếu giảm giá',
//         dataIndex: 'quantity',
//         key: 'quantity',
//         align: 'center',

//     },
//     {
//         title: 'Giá trị giảm',
//         dataIndex: 'discountValue',
//         key: 'discountValue',
//         align: 'center',

//         render: (text, record) => {
//             console.log("record.discountType:", record.discountType); // Debug
//             console.log("text:", text); // Debug

//             return (
//                 <span>
//                     {record.discountType === 'PERCENT'
//                         ? `${record.discountValue} %`
//                         : `${record.discountValue} đ`}
//                 </span>
//             );
//         },
//     }
//     ,

//     {
//         title: 'Giá trị tối thiểu',
//         dataIndex: 'billMinValue',
//         key: 'billMinValue',
//         align: 'center',

//         render: (text) => text ? <span>{text.toLocaleString()} đ</span> : <span>0 đ</span>,
//     },
//     {
//         title: 'Giá trị tối đa',

//         dataIndex: 'discountMaxValue',
//         key: 'discountMaxValue',
//         align: 'center',

//         render: (text) => text ? <span>{text.toLocaleString()} đ</span> : <span>0 đ</span>,
//     },
//     {
//         title: 'Ngày bắt đầu',
//         dataIndex: 'startDate',
//         key: 'startDate',
//         align: 'center',

//         render: (text) => new Date(text).toLocaleDateString(),
//     },
//     {
//         title: 'Ngày kết thúc',
//         dataIndex: 'endDate',
//         key: 'endDate',
//         align: 'center',

//         render: (text) => new Date(text).toLocaleDateString(),
//     },
//     {
//         title: 'Trạng thái',
//         dataIndex: 'statusVoucher',
//         key: 'statusVoucher',
//         align: 'center',

//         render: (_, record) => {
//             let displayStatus = convertStatusVoucher(record.statusVoucher);
//             let color =
//                 record.statusVoucher === 'dang_kich_hoat' ? '#389e0d' :
//                     record.statusVoucher === 'chua_kich_hoat' ? 'orange' :
//                         'red';

//             let backgroundColor =
//                 record.statusVoucher === 'dang_kich_hoat' ? '#f6ffed' :
//                     record.statusVoucher === 'chua_kich_hoat' ? '#fff4e6' :
//                         '#fff1f0';

//             return (
//                 <div
//                     style={{
//                         cursor: 'pointer',
//                         color: color,
//                         border: `1px solid ${color}`,
//                         borderRadius: '8px',
//                         textAlign: 'center',
//                         padding: '5px 10px',
//                         display: 'inline-block',
//                         backgroundColor: backgroundColor,
//                         fontSize: '12px',
//                     }}
//                 >
//                     {displayStatus}
//                 </div>
//             );
//         },
//     },


//     ,
//     {
//         title: 'Thao tác',
//         key: 'action',
//         render: (_, record) => (
//             <Space size="middle">
//                 {record.statusVoucher !== 'ngung_kich_hoat' && (
//                         <Button
//                             icon={
//                                 <FaEdit
//                                     style={{
//                                         color: "#ff974d",
//                                         marginRight: "-3",
//                                         fontSize: "1.5rem",
//                                     }}
//                                 />
//                             }
//                             onClick={() => handleEdit(record)}
//                         />

//                 )}
//                 <Button
//                     icon={<FaEye style={{
//                         color: "#ff974d",
//                         marginRight: -1,
//                         fontSize: "1.3rem",
//                     }} />}
//                     onClick={() => handleDetail(record)}></Button>
//                 <Button style={{

//                     border: 'none',
//                 }} danger onClick={() => handleDelete(record.id)}>Xóa</Button>
//             </Space>
//         ),
//     },
// ];

// const AdvancedSearchForm = ({ onSearch }) => {
//     const { token } = theme.useToken();
//     const [form] = Form.useForm();
//     const [expand, setExpand] = useState(false);


//     const formStyle = {
//         maxWidth: 'none',
//         background: token.colorFillAlter,
//         borderRadius: token.borderRadiusLG,
//         padding: 24,

//     };
//     const getFields = () => {

//         return (
//             <>
//                 <Col span={8}>
//                     <Form.Item name="voucherCode" label="Mã phiếu giảm giá">
//                         <Input placeholder="Nhập mã phiếu giảm giá" />
//                     </Form.Item>
//                 </Col>
//                 <Col span={8}>
//                     <Form.Item name="voucherType" label="Tên phiếu giảm giá">
//                         <Input placeholder="Nhập Tên phiếu giảm giá" />
//                     </Form.Item>
//                 </Col>
//                 <Col span={8}>
//                     <Form.Item name="discountValue" label="Giá trị giảm giá (VNĐ)">
//                         <Input placeholder="Nhập giá trị giảm" />
//                     </Form.Item>
//                 </Col>
//                 <Col span={8}>
//                     <Form.Item name="startDate" label="Ngày bắt đầu">
//                         <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
//                     </Form.Item>
//                 </Col>
//                 <Col span={8}>
//                     <Form.Item name="endDate" label="Ngày kết thúc">
//                         <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
//                     </Form.Item>
//                 </Col>
//                 <Col span={8}>
//                     <Form.Item name="statusVoucher" label="Trạng thái">
//                         <Select placeholder="Chọn trạng thái">
//                             <Option value="dang_kich_hoat">Đang kích hoạt</Option>
//                             <Option value="ngung_kich_hoat">Ngừng kích hoạt</Option>
//                             <Option value="chua_kich_hoat">Chưa kích hoạt</Option>

//                         </Select>
//                     </Form.Item>
//                 </Col>
//             </>
//         );
//     };

//     const onFinish = (values) => {
//         onSearch(values);
//     };
//     const handleSubmit = async () => {
//         try {
//             await form.validateFields(); // Kiểm tra toàn bộ form
//             handleOk(); // Nếu hợp lệ, tiếp tục xử lý
//         } catch (error) {
//             console.log("Có lỗi trong form:", error);
//         }
//     };
//     return (
//         <Card >
//             <Form form={form} name="advanced_search" style={{ formStyle }}
//                 onFinish={onFinish} layout="vertical">
//                 <Row gutter={24}>{getFields()}</Row>
//                 <div style={{ textAlign: 'right' }}>
//                     <Space size="small">
//                         {/* <Button type="primary" htmlType="submit" style={{

//                             border: 'none',
//                         }}>
//                             Lọc
//                         </Button> */}
//                         <Button
//                             icon={<RedoOutlined />}
//                             onClick={() => {
//                                 form.resetFields();
//                             }}
//                             style={{ color: 'white', borderRadius: '20px', backgroundColor: '#ff974d', borderColor: '#ff974d' }}


//                         >

//                         </Button>
//                         {/* <a
//                             style={{ fontSize: 12 }}
//                             onClick={() => {
//                                 setExpand(!expand);
//                             }}
//                         >
//                             <DownOutlined rotate={expand ? 180 : 0} /> {expand ? 'Thu gọn' : 'Mở rộng'}
//                         </a> */}
//                     </Space>
//                 </div>
//             </Form>
//         </Card>
//     );
// };

// const VoucherList = () => {
//     const [voucherData, setVoucherData] = useState([]);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [form] = Form.useForm();
//     const [editingVoucher, setEditingVoucher] = useState(null);
//     const navigate = useNavigate();


//     const style = {
//         display: "flex",
//         flexDirection: "column",
//         gap: 8,
//     };
//     const [value, setValue] = useState(1);
//     const [customers, setCustomers] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [pagination, setPagination] = useState({
//         page: 0,
//         size: 5,
//         total: 7
//     });

//     // Fetching voucher data (you may want to keep this if it's not commented out)
//     useEffect(() => {
//         getPageVoucher();
//     }, [pagination]);

//     const getPageVoucher = async () => {
//         const response = await axios.get(`${baseUrl}/api/admin/voucher/page?page=${pagination.page}&size=${pagination.size}`);
//         const data = response.data.data;
//         console.log(data);

//         const items = data.content.map((el) => {
//             el.startDate = new Date(el.startDate);
//             el.endDate = new Date(el.endDate);
//             return el;
//         });
//         setVoucherData(items);
//         console.log(items);


//         const newPagination = {
//             page: data.number,
//             size: data.size,
//             total: data.totalElements
//         };

//         // Update pagination only if there's a change
//         if (
//             pagination.page !== newPagination.page ||
//             pagination.size !== newPagination.size ||
//             pagination.total !== newPagination.total
//         ) {
//             setPagination(newPagination);
//         }
//     };

//     const handleAdd = () => {
//         setIsDeatil(false)
//         setIsEdit(false)
//         setEditingVoucher(null);
//         setIsModalOpen(true);
//     };

//     const handleEdit = (record) => {
//         navigate(`/admin/voucher/update`, { state: { voucher: record } });
//         // setEditingVoucher(record);
//         // setIsEdit(true)
//         // setIsModalOpen(true);
//         form.setFieldsValue({
//             ...record,
//             startDate: moment(record.startDate),  // Use moment for startDate
//             endDate: moment(record.endDate)       // Use moment for endDate
//         });
//     };

//     const handleDelete = async (id) => {
//         try {
//             await axios.delete(`${baseUrl}/api/admin/voucher/delete/${id}`);
//             message.success('Xóa phiếu giảm giá thành công!');
//             getPageVoucher();  // Fetch updated list
//         } catch (error) {
//             message.error('Lỗi khi xóa phiếu giảm giá!');
//         }
//     };
//     const [isDetail, setIsDeatil] = useState(false);
//     const [isEdit, setIsEdit] = useState(false);


//     const handleDetail = (record) => {
//         setIsDeatil(true)
//         setIsEdit(false)
//         setEditingVoucher(record);
//         setIsModalOpen(true);
//         form.setFieldsValue({
//             ...record,
//             startDate: moment(record.startDate),  // Use moment for startDate
//             endDate: moment(record.endDate)       // Use moment for endDate
//         });
//     };

//     const handleOk = async () => {
//         if (isDetail) {
//             setIsModalOpen(false);
//             return
//         }
//         try {
//             const value = await form.validateFields();
//             const values = form.getFieldsValue();
//             if (editingVoucher) {
//                 // Edit existing voucher
//                 await axios.put(`${baseUrl}/api/admin/voucher/update/${editingVoucher.id}`, values, value);
//                 message.success('Cập nhật phiếu giảm giá thành công!');
//             } else {
//                 // Add new voucher
//                 await axios.post(`${baseUrl}/api/admin/voucher/add`, values, value);
//                 console.log("day la du lieu value", value);
//                 console.log("day la values", values);
//                 console.log("dday la them");

//                 message.success('Thêm mới phiếu giảm giá thành công!');
//             }
//             getPageVoucher();  // Fetch updated list
//             setIsModalOpen(false);
//             form.resetFields();
//         } catch (error) {
//             message.error('Lỗi khi lưu trữ liệu!', error);
//         }

//     };

//     const handleCancel = () => {
//         setIsModalOpen(false);
//         form.resetFields();
//     };

//     const handleOnChangeTable = (paginationTable) => {
//         setPagination({
//             ...pagination,
//             page: paginationTable.current - 1, // Update current page
//             size: paginationTable.pageSize, // Update page size
//         });
//     };
//     // MÃ THÊM: Xử lý tìm kiếm
//     const handleSearch = (values) => {
//         console.log('Search Values:', values);
//     }
//     // const onChange = (e) => {
//     //     const selectedValue = e.target.value;
//     //     setValue(selectedValue);
//     // }
//     const [voucherType, setVoucherType] = useState(0); // Mặc định là Công khai

//     const onChange = (e) => {
//         setVoucherType(e.target.value);
//     };

//     return (
//         <>
//             <h4>Bộ lọc </h4>

//             {/* MÃ THÊM: Thêm AdvancedSearchForm */}
//             <AdvancedSearchForm onSearch={handleSearch} />
//             <h4 style={{ paddingTop: '15px' }}>Danh sách phiếu giảm giá</h4>

//             <Card>
//                 <Link to={"/admin/voucher/add"} >
//                     <Button type="primary" icon={<PlusOutlined />}
//                         onClick={handleAdd} style={{
//                             marginBottom: '20px',
//                             border: 'none',
//                             backgroundColor: '#ff974d'
//                         }}>
//                         Thêm mới
//                     </Button>
//                 </Link>


//                 <Table
//                     columns={columns(handleEdit, handleDelete, handleDetail)}
//                     dataSource={voucherData}
//                     rowKey="id"
//                     pagination={{
//                         current: pagination.page + 1,
//                         pageSize: pagination.size,
//                         total: pagination.total
//                     }}
//                     onChange={handleOnChangeTable}


//                 />
//                 <Modal
//                     title={isEdit ? 'Chỉnh sửa phiếu giảm giá' : (isDetail ? "Chi tiết" : 'Thêm mới phiếu giảm giá')}
//                     open={isModalOpen}
//                     onOk={handleOk}
//                     onCancel={handleCancel}
//                     okText="Xác nhận"
//                     cancelText="Hủy"
//                     okButtonProps={{
//                         style: {

//                             border: 'none',
//                             // fontFamily: 'Poppins',
//                         },
//                     }}
//                     cancelButtonProps={{
//                         style: {

//                             border: 'none',
//                             // fontFamily: 'Poppins',
//                         },
//                     }}
//                 //màu label={<span style={{ color: '#1A3353', fontFamily: 'Poppins' }}>Mã phiếu giảm giá</span>}

//                 >
//                     <Form form={form} layout="vertical">
//                         <Form.Item name="voucherName" label="Tên phiếu giảm giá" rules={[{ required: true, message: 'Không được bỏ trống' }]}>
//                             <Input placeholder="Nhập tên phiếu giảm giá" />
//                         </Form.Item>
//                         <Form.Item name="quantity" label="Số lượng" rules={[
//                             { required: true, message: 'Không được bỏ trống' },
//                             ({ getFieldValue }) => ({
//                                 validator(_, value) {
//                                     if (!value || (Number(value) >= 1 && Number.isInteger(Number(value)))) {
//                                         return Promise.resolve();
//                                     }
//                                     return Promise.reject(new Error('Số lượng phải là số nguyên lớn hơn hoặc bằng 1'));
//                                 },
//                             }),
//                         ]}>
//                             <Input type="number" placeholder="Nhập số lượng" min={1} />
//                         </Form.Item>

//                         <Form.Item label="Giá trị giảm" required>
//                             <Input.Group compact>
//                                 <Form.Item
//                                     name="discountValue"
//                                     noStyle
//                                     dependencies={["discountType"]}
//                                     rules={[
//                                         ({ getFieldValue }) => ({
//                                             validator(_, value) {
//                                                 const num = Number(value);
//                                                 const type = getFieldValue("discountType");

//                                                 if (!value) return Promise.reject(new Error('Không được bỏ trống'));

//                                                 if (type === "PERCENT" && (!Number.isInteger(num) || num < 1 || num > 80)) {
//                                                     return Promise.reject(new Error('Giá trị giảm (%) phải từ 1 đến 80'));
//                                                 }

//                                                 if (num < 1) {
//                                                     return Promise.reject(new Error('Giá trị giảm phải lớn hơn 0'));
//                                                 }

//                                                 return Promise.resolve();
//                                             },
//                                         }),
//                                     ]}
//                                 >
//                                     <Input type="number" placeholder="Nhập giá trị giảm" style={{ width: '70%' }} />
//                                 </Form.Item>

//                                 <Form.Item name="discountType" noStyle rules={[{ required: true, message: 'Không được bỏ trống' }]}>
//                                     <Select placeholder="Chọn loại giảm" style={{ width: '30%' }}>
//                                         <Option value="PERCENT">%</Option>
//                                         <Option value="MONEY">đ</Option>
//                                     </Select>
//                                 </Form.Item>
//                             </Input.Group>
//                         </Form.Item>


//                         <Form.Item
//                             name="billMinValue"
//                             label="Giá trị tối thiểu"
//                             rules={[
//                                 { required: true, message: 'Không được bỏ trống' },
//                                 ({ getFieldValue }) => ({
//                                     validator(_, value) {
//                                         const maxValue = getFieldValue("discountMaxValue");
//                                         if (value === undefined || value < 0 || !Number.isInteger(Number(value))) {
//                                             return Promise.reject(new Error('Giá trị phải là số nguyên dương!'));
//                                         }
//                                         if (maxValue !== undefined && maxValue !== null && Number(value) >= Number(maxValue)) {
//                                             return Promise.reject(new Error('Giá trị tối thiểu phải nhỏ hơn giá trị tối đa!'));
//                                         }
//                                         return Promise.resolve();
//                                     },
//                                 }),
//                             ]}
//                         >
//                             <Input type="number" placeholder="Nhập giá trị tối thiểu" suffix="đ" />
//                         </Form.Item>

//                         <Form.Item
//                             name="discountMaxValue"
//                             label="Giá trị tối đa"
//                             dependencies={["billMinValue"]}
//                             rules={[
//                                 { required: true, message: 'Không được bỏ trống' },
//                                 ({ getFieldValue }) => ({
//                                     validator(_, value) {
//                                         const minValue = getFieldValue("billMinValue");
//                                         if (value === undefined || value < 0 || !Number.isInteger(Number(value))) {
//                                             return Promise.reject(new Error('Giá trị phải là số nguyên dương!'));
//                                         }
//                                         if (minValue !== undefined && minValue !== null && Number(value) <= Number(minValue)) {
//                                             return Promise.reject(new Error('Giá trị tối đa phải lớn hơn giá trị tối thiểu!'));
//                                         }
//                                         return Promise.resolve();
//                                     },
//                                 }),
//                             ]}
//                         >
//                             <Input type="number" placeholder="Nhập giá trị tối đa" suffix="đ" />
//                         </Form.Item>


//                         <Form.Item
//                             name="startDate"
//                             label="Ngày bắt đầu"
//                             rules={[
//                                 { required: true, message: 'Không được bỏ trống' },
//                                 ({ getFieldValue }) => ({
//                                     validator(_, value) {
//                                         if (!value || !getFieldValue('endDate') || value.isBefore(getFieldValue('endDate'))) {
//                                             return Promise.resolve();
//                                         }
//                                         return Promise.reject(new Error('Ngày bắt đầu không được vượt quá ngày kết thúc!'));
//                                     },
//                                 }),
//                             ]}
//                         >
//                             <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
//                         </Form.Item>

//                         <Form.Item
//                             name="endDate"
//                             label="Ngày kết thúc"
//                             rules={[
//                                 { required: true, message: 'Không được bỏ trống' },
//                                 ({ getFieldValue }) => ({
//                                     validator(_, value) {
//                                         if (!value || !getFieldValue('startDate') || value.isAfter(getFieldValue('startDate'))) {
//                                             return Promise.resolve();
//                                         }
//                                         return Promise.reject(new Error('Ngày kết thúc phải lớn hơn ngày bắt đầu!'));
//                                     },
//                                 }),
//                             ]}
//                         >
//                             <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
//                         </Form.Item>
//                         <Form.Item name="voucherType" label="Loại phiếu giảm giá" rules={[{ required: true, message: 'Không được bỏ trống' }]}>
//                             <Radio.Group onChange={onChange} value={voucherType} disabled>
//                                 <Radio value={"PUBLIC"}>Công khai</Radio>
//                                 <Radio value={"PRIVATE"}>Riêng tư</Radio>
//                             </Radio.Group>
//                         </Form.Item>
//                     </Form>
//                 </Modal>
//             </Card>
//         </>

//     );
// };

// export default VoucherList;
    // useEffect(() => {
    //     if (value === "PRIVATE") {
    //         fetchCustomers().then(() => {
    //             setShowTable(true);
    //             form.setFieldsValue({ quantity: selectedRowKeys.length });
    //         });
    //     }
    // }, [selectedRowKeys, value, form]);