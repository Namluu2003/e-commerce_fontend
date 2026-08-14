


// import React, { useState } from 'react';
// import { Table, Input, Button, Row, Col, Typography, Space, Empty, notification, Modal, Form, Input as AntInput, DatePicker } from 'antd';
// import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
// import styles from './Trademark.module.css';
// import moment from 'moment';

// const { Title } = Typography;

// function Trademark() {
//     // State variables for data, search, and modal visibility
//     const [data, setData] = useState([
//         { key: '1', stt: 1, category: 'Nike', createdAt: '2025-01-01', status: 'Active' },
//         { key: '2', stt: 2, category: 'Adidas', createdAt: '2025-01-02', status: 'Inactive' },
//     ]);
//     const [searchValue, setSearchValue] = useState('');
//     const [isModalVisible, setIsModalVisible] = useState(false);
//     const [isEditMode, setIsEditMode] = useState(false);
//     const [currentRecord, setCurrentRecord] = useState(null);

//     // Handle Add New
//     const handleAdd = () => {
//         setIsEditMode(false);  // Ensure it's not in edit mode
//         setCurrentRecord(null);  // Clear the current record
//         setIsModalVisible(true);  // Open modal for adding new item
//     };

//     // Handle Edit
//     const handleEdit = (record) => {
//         setIsEditMode(true);  // Set edit mode to true
//         setCurrentRecord(record);  // Set the current record to edit
//         setIsModalVisible(true);  // Open modal for editing the record
//     };

//     // Handle Delete
//     const handleDelete = (key) => {
//         Modal.confirm({
//             title: 'Bạn có chắc chắn muốn xóa?',
//             content: 'Dữ liệu sẽ không thể phục hồi.',
//             onOk: () => {
//                 setData(data.filter(item => item.key !== key));

//                 notification.success({
//                     message: 'Thành công',
//                     description: 'Thương hiệu đã được xóa!',
//                 });
//             },
//         });
//     };

//     // Handle Search
//     const handleSearch = (e) => {
//         setSearchValue(e.target.value);
//     };

//     // Filter data based on search input
//     const filteredData = data.filter(item =>
//         item.category.toLowerCase().includes(searchValue.toLowerCase())
//     );

//     // Handle Submit for Add/Edit form
//     const handleFormSubmit = (values) => {
//         if (isEditMode) {
//             // Update data
//             const updatedData = data.map(item =>
//                 item.key === currentRecord.key ? { ...item, ...values } : item
//             );
//             setData(updatedData);
//             notification.success({
//                 message: 'Thành công',
//                 description: 'Thương hiệu đã được cập nhật!',
//             });
//         } else {
//             // Add new data
//             const newData = {
//                 key: Date.now().toString(),
//                 stt: data.length + 1,
//                 category: values.category,
//                 createdAt: values.createdAt.format('YYYY-MM-DD'),
//                 status: values.status,
//             };
//             setData([...data, newData]);
//             notification.success({
//                 message: 'Thành công',
//                 description: 'Thương hiệu đã được thêm thành công!',
//             });
//         }

//         setIsModalVisible(false);  // Close modal after submit
//     };

//     // Define table columns
//     const columns = [
//         {
//             title: 'STT',
//             dataIndex: 'stt',
//             key: 'stt',
//             width: '10%',
//         },
//         {
//             title: 'Thương hiệu',
//             dataIndex: 'category',
//             key: 'category',
//             width: '30%',
//         },
//         {
//             title: 'Ngày tạo',
//             dataIndex: 'createdAt',
//             key: 'createdAt',
//             width: '20%',
//         },
//         {
//             title: 'Trạng thái',
//             dataIndex: 'status',
//             key: 'status',
//             width: '20%',
//             render: (status) => (
//                 <span className={status === 'Active' ? styles.activeStatus : styles.inactiveStatus}>
//                     {status}
//                 </span>
//             ),
//         },
//         {
//             title: 'Thao tác',
//             key: 'action',
//             width: '20%',
//             render: (_, record) => (
//                 <Space size="middle">
//                     <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
//                     <Button type="link" danger onClick={() => handleDelete(record.key)}>
//                         Delete
//                     </Button>
//                 </Space>
//             ),
//         },
//     ];

//     return (
//         <div className={styles.container}>
//             <Title level={2} className={styles.title}>
//                 Danh sách thương hiệu
//             </Title>
//             <Row gutter={[16, 16]} className={styles.searchRow}>
//                 <Col xs={24} sm={24} md={10} lg={10}>
//                     <Input
//                         placeholder="Nhập vào tên thương hiệu để tìm kiếm"
//                         prefix={<SearchOutlined />}
//                         allowClear
//                         className={styles.searchInput}
//                         value={searchValue}
//                         onChange={handleSearch}
//                     />
//                 </Col>
//                 <Col xs={24} sm={24} md={14} lg={14} style={{ textAlign: 'right' }}>
//                     <Button
//                         type="primary"
//                         icon={<PlusOutlined />}
//                         className={styles.addButton}
//                         onClick={handleAdd}
//                     >
//                         Thêm mới
//                     </Button>
//                 </Col>
//             </Row>

//             <Table
//                 columns={columns}
//                 dataSource={filteredData}
//                 pagination={{ pageSize: 10 }}
//                 locale={{
//                     emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có dữ liệu" />,
//                 }}
//                 className={styles.table}
//             />

//             {/* Modal for Add/Edit */}
//             <Modal
//                 title={isEditMode ? "Chỉnh sửa thương hiệu" : "Thêm mới thương hiệu"}
//                 visible={isModalVisible}
//                 onCancel={() => setIsModalVisible(false)}
//                 footer={null}
//             >
//                 <Form
//                     initialValues={{
//                         category: currentRecord ? currentRecord.category : '',
//                         status: currentRecord ? currentRecord.status : 'Active',
//                         createdAt: currentRecord ? moment(currentRecord.createdAt) : moment(),
//                     }}
//                     onFinish={handleFormSubmit}
//                 >
//                     <Form.Item
//                         label="Thương hiệu"
//                         name="category"
//                         rules={[{ required: true, message: 'Vui lòng nhập tên thương hiệu!' }]}
//                     >
//                         <AntInput />
//                     </Form.Item>

//                     <Form.Item
//                         label="Ngày tạo"
//                         name="createdAt"
//                         rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
//                     >
//                         <DatePicker />
//                     </Form.Item>

//                     <Form.Item
//                         label="Trạng thái"
//                         name="status"
//                         rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
//                     >
//                         <AntInput />
//                     </Form.Item>

//                     <Form.Item>
//                         <Button type="primary" htmlType="submit" block>
//                             {isEditMode ? 'Cập nhật' : 'Thêm mới'}
//                         </Button>
//                     </Form.Item>
//                 </Form>
//             </Modal>
//         </div>
//     );
// }

// export default Trademark;





import React, { useState } from 'react';
import { Table, Input, Button, Row, Col, Typography, Space, Empty, notification, Modal, Form, Input as AntInput, DatePicker, Radio } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import styles from './Trademark.module.css';
import moment from 'moment';

const { Title } = Typography;

function Trademark() {
    // State variables for data, search, and modal visibility
    const [data, setData] = useState([
        { key: '1', stt: 1, category: 'Nike', createdAt: '2025-01-01', status: 'Active' },
        { key: '2', stt: 2, category: 'Adidas', createdAt: '2025-01-02', status: 'Inactive' },
    ]);
    const [searchValue, setSearchValue] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);

    // Handle Add New
    const handleAdd = () => {
        setIsEditMode(false);  // Ensure it's not in edit mode
        setCurrentRecord(null);  // Clear the current record
        setIsModalVisible(true);  // Open modal for adding new item
    };

    // Handle Edit
    const handleEdit = (record) => {
        setIsEditMode(true);  // Set edit mode to true
        setCurrentRecord(record);  // Set the current record to edit
        setIsModalVisible(true);  // Open modal for editing the record
    };

    // Handle Delete
    const handleDelete = (key) => {
        Modal.confirm({
            title: 'Bạn có chắc chắn muốn xóa?',
            content: 'Dữ liệu sẽ không thể phục hồi.',
            onOk: () => {
                setData(data.filter(item => item.key !== key));

                notification.success({
                    message: 'Thành công',
                    description: 'Thương hiệu đã được xóa!',
                });
            },
        });
    };

    // Handle Search
    const handleSearch = (e) => {
        setSearchValue(e.target.value);
    };

    // Filter data based on search input
    const filteredData = data.filter(item =>
        item.category.toLowerCase().includes(searchValue.toLowerCase())
    );

    // Handle Submit for Add/Edit form
    const handleFormSubmit = (values) => {
        if (isEditMode) {
            // Update data
            const updatedData = data.map(item =>
                item.key === currentRecord.key ? { ...item, ...values, createdAt: values.createdAt.format('YYYY-MM-DD') } : item
            );
            setData(updatedData);
            notification.success({
                message: 'Thành công',
                description: 'Thương hiệu đã được cập nhật!',
            });
        } else {
            // Add new data
            const newData = {
                key: Date.now().toString(),
                stt: data.length + 1,
                category: values.category,
                createdAt: values.createdAt.format('YYYY-MM-DD'),
                status: values.status,
            };
            setData([...data, newData]);
            notification.success({
                message: 'Thành công',
                description: 'Thương hiệu đã được thêm thành công!',
            });
        }

        setIsModalVisible(false);  // Close modal after submit
    };

    // Define table columns
    const columns = [
        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            width: '10%',
        },
        {
            title: 'Thương hiệu',
            dataIndex: 'category',
            key: 'category',
            width: '30%',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '20%',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: '20%',
            render: (status) => (
                <span className={status === 'Active' ? styles.activeStatus : styles.inactiveStatus}>
                    {status}
                </span>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: '20%',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
                    <Button type="link" danger onClick={() => handleDelete(record.key)}>
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className={styles.container}>
            <Title level={2} className={styles.title}>
                Danh sách thương hiệu
            </Title>
            <Row gutter={[16, 16]} className={styles.searchRow}>
                <Col xs={24} sm={24} md={10} lg={10}>
                    <Input
                        placeholder="Nhập vào tên thương hiệu để tìm kiếm"
                        prefix={<SearchOutlined />}
                        allowClear
                        className={styles.searchInput}
                        value={searchValue}
                        onChange={handleSearch}
                    />
                </Col>
                <Col xs={24} sm={24} md={14} lg={14} style={{ textAlign: 'right' }}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        className={styles.addButton}
                        onClick={handleAdd}
                    >
                        Thêm mới
                    </Button>
                </Col>
            </Row>

            <Table
                columns={columns}
                dataSource={filteredData}
                pagination={{ pageSize: 10 }}
                locale={{
                    emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có dữ liệu" />,
                }}
                className={styles.table}
            />

            {/* Modal for Add/Edit */}
            <Modal
                title={isEditMode ? "Chỉnh sửa thương hiệu" : "Thêm mới thương hiệu"}
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form
                    initialValues={{
                        category: currentRecord ? currentRecord.category : '',
                        status: currentRecord ? currentRecord.status : 'Active',
                        createdAt: currentRecord ? moment(currentRecord.createdAt, 'YYYY-MM-DD') : moment(), // Convert string to moment
                    }}
                    onFinish={handleFormSubmit}
                >
                    <Form.Item
                        label="Thương hiệu"
                        name="category"
                        rules={[{ required: true, message: 'Vui lòng nhập tên thương hiệu!' }]}
                    >
                        <AntInput />
                    </Form.Item>

                    <Form.Item
                        label="Ngày tạo"
                        name="createdAt"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
                    >
                        <DatePicker />
                    </Form.Item>

                    <Form.Item
                        label="Trạng thái"
                        name="status"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                    >
                        <Radio.Group>
                            <Radio value="Active">Active</Radio>
                            <Radio value="Inactive">Inactive</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            {isEditMode ? 'Cập nhật' : 'Thêm mới'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default Trademark;
