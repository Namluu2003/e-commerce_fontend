import React, {useState, useEffect} from 'react';
import {Input, Select, DatePicker, Slider, Button, Table, Space, Card, message, Modal, Drawer, Form, Avatar} from 'antd';
import {
    SearchOutlined,
    ReloadOutlined,
    EditOutlined,
    PlusOutlined,
    DownloadOutlined,
    UserOutlined
} from '@ant-design/icons';
import moment from 'moment';
import {Link} from 'react-router-dom';
import axios from 'axios';
import {FaEdit, FaMapMarkedAlt} from "react-icons/fa";
import {generateAddressString} from "../helpers/Helpers.js";
import {COLORS} from "../constants/constants.js";
import {Tooltip} from 'antd';
import * as XLSX from 'xlsx';
import AddressSelectorAntd from "../admin/utils/AddressSelectorAntd.jsx";
import {genStringAccountStatus} from "./accountService.js";
import {toast} from "react-toastify";

const {Option} = Select;
const {RangePicker} = DatePicker;

const CustomerTest = () => {
    const [searchText, setSearchText] = useState('');
    const [status, setStatus] = useState('null');
    const [dobRange, setDobRange] = useState([]);
    const [ageRange, setAgeRange] = useState([0, 100]);
    const [data, setData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [recordSelected, setRecordSelected] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [newAddress, setNewAddress] = useState({
        provinceId: null,
        districtId: null,
        wardId: null,
        specificAddress: null
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const handleExportToExcel = async () => {
        try {
            const exportData = await Promise.all(data.map(async (item) => {
                const addressesString = await Promise.all(item.addresses.map(async (address) => {
                    return await generateAddressString(address.provinceId, address.districtId, address.wardId, address.specificAddress);
                }));

                return {
                    'STT': item.key,
                    'Họ và tên': item.fullName,
                    'CCCD': item.CitizenId,
                    'Số điện thoại': item.phoneNumber,
                    'Ngày sinh': moment(item.dateBirth).format('DD/MM/YYYY'), // Format date for Excel
                    'Email': item.email,
                    'Trạng Thái': item.status,
                    'Địa chỉ': addressesString.join('\n'),
                };
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData, {header: Object.keys(exportData[0])}); // Include header row

            // Styling the header
            const headerStyle = {
                font: {bold: true},
                alignment: {horizontal: 'center'}, // Center header text
                fill: {fgColor: {rgb: 'FFD8BF'}}, // Light orange background
            };

            for (let col in worksheet) {
                if (col.startsWith('!')) continue; // Skip metadata properties
                worksheet[col].s = headerStyle; // Apply header style
            }
            // Setting column widths (important for readability)
            const columnWidths = [
                {wch: 5},  // STT (adjust as needed)
                {wch: 20}, // Họ và tên
                {wch: 15}, // CCCD
                {wch: 15}, // Số điện thoại
                {wch: 12}, // Ngày sinh
                {wch: 25}, // Email
                {wch: 10}, // Trạng Thái
                {wch: 40}, // Địa chỉ
            ];
            worksheet['!cols'] = columnWidths;

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
            XLSX.writeFile(workbook, `customers_${moment().format('YYYYMMDDHHmmss')}.xlsx`);
            toast.success('Xuất file Excel thành công!');

        } catch (error) {
            console.error('Error exporting to Excel:', error);
            toast.error('Xuất file Excel thất bại!');
        }
    };

    // Function to check if the URL is valid - copied from Staff component
    const isValidUrl = (url) => {
        if (!url) return false;
        
        // Check if the URL is a string and has a minimum length
        if (typeof url !== 'string' || url.length < 5) return false;
        
        // Simple check if it starts with http:// or https:// or data:
        return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:');
    };

    // Generate avatar initials from name - copied from Staff component
    const getInitials = (name) => {
        if (!name) return '?';
        
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0].charAt(0)}${parts[parts.length-1].charAt(0)}`.toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    };

    const fetchData = (page = 0, size = 10) => {
        const params = {
            page: page,
            size: size
        };
        
        axios.get('http://localhost:8080/api/admin/customers/index', {params})
            .then((response) => {
                const { content, totalElements } = response.data;
                const fetchedData = content.map((item, index) => ({
                    key: index + 1,
                    id: item.id,
                    avatar: item.avatar,
                    fullName: item.fullName,
                    CitizenId: item.citizenId,
                    phoneNumber: item.phoneNumber,
                    dateBirth: moment(item.dateBirth).format('YYYY-MM-DD HH:mm:ss'),
                    status: item.status,
                    email: item.email,
                    gender: item.gender === 1 ? 'Nam' : 'Nữ',
                    addresses: item.addresses,
                    password: item.password
                }));
                
                setData(fetchedData);
                setPagination(prev => ({
                    ...prev,
                    total: totalElements
                }));
            })
            .catch((error) => console.error('Error fetching data:', error));
    };

    const handleSearch = () => {
        const params = {
            searchText: searchText || null,
            status: status === 'null' ? null : status,
            startDate: dobRange && dobRange[0] ? dobRange[0].format('YYYY-MM-DDTHH:mm:ss') : null,
            endDate: dobRange && dobRange[1] ? dobRange[1].format('YYYY-MM-DDTHH:mm:ss') : null,
            minAge: ageRange[0] === 0 ? null : ageRange[0],
            maxAge: ageRange[1] === 100 ? null : ageRange[1],
            page: pagination.current - 1,
            size: pagination.pageSize
        };

        axios.get('http://localhost:8080/api/admin/customers/index', {params})
            .then((response) => {
                const { content, totalElements } = response.data;
                const fetchedData = content.map((item, index) => ({
                    key: index + 1,
                    id: item.id,
                    avatar: item.avatar,
                    fullName: item.fullName,
                    CitizenId: item.citizenId,
                    phoneNumber: item.phoneNumber,
                    dateBirth: moment(item.dateBirth).format('YYYY-MM-DD HH:mm:ss'),
                    status: item.status,
                    email: item.email,
                    gender: item.gender === 1 ? 'Nam' : 'Nữ',
                    addresses: item.addresses,
                    password: item.password
                }));
                setData(fetchedData);
                setPagination(prev => ({
                    ...prev,
                    total: totalElements
                }));
            })
            .catch((error) => {
                console.error('Error fetching filtered data:', error);
                toast.error('Có lỗi xảy ra khi tìm kiếm!');
            });
    };

    const handleTableChange = (pagination) => {
        setPagination(pagination);
        const params = {
            searchText: searchText || null,
            status: status === 'null' ? null : status,
            startDate: dobRange && dobRange[0] ? dobRange[0].format('YYYY-MM-DD') : null,
            endDate: dobRange && dobRange[1] ? dobRange[1].format('YYYY-MM-DD') : null,
            minAge: ageRange[0] === 0 ? null : ageRange[0],
            maxAge: ageRange[1] === 100 ? null : ageRange[1],
            page: pagination.current - 1,
            size: pagination.pageSize
        };

        axios.get('http://localhost:8080/api/admin/customers/index', {params})
            .then((response) => {
                const { content, totalElements } = response.data;
                const fetchedData = content.map((item, index) => ({
                    key: index + 1,
                    id: item.id,
                    avatar: item.avatar,
                    fullName: item.fullName,
                    CitizenId: item.citizenId,
                    phoneNumber: item.phoneNumber,
                    dateBirth: moment(item.dateBirth).format('YYYY-MM-DD HH:mm:ss'),
                    status: item.status,
                    email: item.email,
                    gender: item.gender === 1 ? 'Nam' : 'Nữ',
                    addresses: item.addresses,
                    password: item.password
                }));
                setData(fetchedData);
                setPagination(prev => ({
                    ...prev,
                    total: totalElements
                }));
            })
            .catch((error) => {
                console.error('Error fetching filtered data:', error);
                toast.error('Có lỗi xảy ra khi tải dữ liệu!');
            });
    };

    const handleReset = () => {
        setSearchText('');
        setStatus('null');
            setDobRange([]);
        setAgeRange([0, 100]);
        setPagination(prev => ({
            ...prev,
            current: 1
        }));
        fetchData(0, pagination.pageSize);
    };

    const showModalAddress = (record) => {
        setIsModalOpen(true);
        setRecordSelected(record);
        fetchAddresses(record);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const fetchAddresses = async (record) => {
        if (record?.addresses) {
            const addressStrings = await Promise.all(
                record.addresses.map(async (el) => {
                    const addressString = await generateAddressString(el.provinceId, el.districtId, el.wardId, el.specificAddress);
                    return {
                        id: el.id,
                        address: addressString,
                        isDefault: el.isAddressDefault,
                        provinceId: el.provinceId,
                        districtId: el.districtId,
                        wardId: el.wardId,
                        specificAddress: el.specificAddress
                    };
                })
            );
            setAddresses(addressStrings);
        }
    };
    const handleAddAddressClick = () => {
        setIsDrawerOpen(true);
        setNewAddress({
            districtId: null,
            wardId: null,
            specificAddress: "",
            provinceId: null
        });
        setIsEditing(false);
    };

    const handleAddAddress = async () => {
        try {
            // Gọi API thêm địa chỉ
            const response = await axios.post(
                `http://localhost:8080/api/admin/customers/add-address/${recordSelected.id}`,
                newAddress
            );
            console.log(newAddress)
            toast.success('Thêm địa chỉ thành công!');
            // Cập nhật lại danh sách addresses
            const provinceId = String(response.data.provinceId);
            const districtId = String(response.data.districtId);
            const wardId = String(response.data.wardId);

            const newAddressString = await generateAddressString(
                provinceId,
                districtId,
                wardId,
                response.data.specificAddress
            );
            // Thêm bản ghi mới lên đầu danh sách
            setAddresses((prevAddresses) => [
                {
                    ...response.data,
                    address: newAddressString,
                    isDefault: response.data.isAddressDefault,
                },
                ...prevAddresses,
            ]);

            setNewAddress({});
            setIsDrawerOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error adding address:', error);
            toast.error('Thêm địa chỉ thất bại!');
        }
    };
    const handleEditAddress = async (addressId) => {
        try {
            const response = await axios.put(
                `http://localhost:8080/api/admin/customers/update-address/${addressId}`,
                newAddress
            );

            toast.success('Cập nhật địa chỉ thành công!');

            const provinceId = String(response.data.provinceId);
            const districtId = String(response.data.districtId);
            const wardId = String(response.data.wardId);

            const updatedAddressString = await generateAddressString(
                provinceId,
                districtId,
                wardId,
                response.data.specificAddress
            );

            // Cập nhật lại trong state
            setAddresses((prevAddresses) =>
                prevAddresses.map((address) =>
                    address.id === addressId
                        ? {
                            ...address,
                            ...response.data,
                            address: updatedAddressString,
                        }
                        : address
                )
            );

            setNewAddress({});
            setIsDrawerOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error updating address:', error);
            toast.error('Cập nhật địa chỉ thất bại!');
        }
    };
    const handleSetDefaultAddress = (addressId) => {
        axios
            .put(`http://localhost:8080/api/admin/customers/set-default-address/${addressId}`)
            .then(() => {
                toast.success('Đặt làm mặc định thành công!');

                // Cập nhật lại state addresses (di chuyển địa chỉ mặc định lên đầu)
                setAddresses((prevAddresses) => {
                    const updatedAddresses = prevAddresses.map((addr) => ({
                        ...addr,
                        isDefault: addr.id === addressId,
                    }));
                    // Di chuyển địa chỉ mặc định lên đầu (nếu muốn)
                    return updatedAddresses;
                });

                // Fetch lại danh sách khách hàng
                fetchData();
            })
            .catch((error) => {
                console.error('Error setting default address:', error);
                toast.error('Đặt làm mặc định thất bại!');
            });
    };

    const handleEditAddressClick = (address) => {
        console.log(address)
        setNewAddress({
            specificAddress: address.specificAddress,
            provinceId: address.provinceId,
            districtId: address.districtId,
            wardId: address.wardId
        });

        setIsEditing(true);
        setEditingAddressId(address.id);
        setIsDrawerOpen(true);

    };
    const columns = [
        {
            title: 'STT',
            dataIndex: 'key',
            key: 'key',
            width: 60,
        },
        {
            title: 'Ảnh',
            dataIndex: 'avatar',
            key: 'avatar',
            width: 80,
            render: (src, record) => {
                // For debugging - log the avatar URL
                console.log(`Avatar for ${record.fullName}:`, src);
                
                return (
                    <Avatar 
                        src={isValidUrl(src) ? src : null}
                        style={{ 
                            backgroundColor: !isValidUrl(src) ? '#1890ff' : 'transparent',
                            color: '#fff',
                            fontSize: '16px',
                            border: '1px solid #f0f0f0',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                        size={50}
                        icon={!isValidUrl(src) && !record.fullName ? <UserOutlined /> : null}
                        alt={record.fullName}
                    >
                        {!isValidUrl(src) && record.fullName ? getInitials(record.fullName) : null}
                    </Avatar>
                );
            },
        },
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            render: (text) => (
                <div>
                    {text ? text : "Chưa cập nhật"}
                </div>
            )
        },

        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },

        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let bgColor = '';
                let color = '';
                let border = '';
                let label = genStringAccountStatus(status);

                switch (status) {
                    case 0: // Hoạt động
                        bgColor = '#f6ffed';
                        color = '#52c41a';
                        border = '1px solid #b7eb8f';
                        break;
                    case 1: // Đã khóa
                        bgColor = '#fff1f0';
                        color = '#ff4d4f';
                        border = '1px solid #ffa39e';
                        break;
                    case 2: // Chưa kích hoạt
                    default:
                        bgColor = '#fffbe6';
                        color = '#faad14';
                        border = '1px solid #ffe58f';
                        break;
                }

                return (
                    <Button
                        type="default"
                        style={{
                            borderRadius: '5px',
                            padding: '2px 15px',
                            height: '30px',
                            textAlign: 'center',
                            fontWeight: 'normal',
                            backgroundColor: bgColor,
                            color: color,
                            border: border,
                        }}
                    >
                        {label}
                    </Button>
                );
            },
        },

        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa khách hàng">
                        <Link to={`/admin/customer-update/${record.id}`}>
                            <Button
                                icon={
                                    <FaEdit
                                        style={{
                                            color: `${COLORS.primary}`,
                                            fontSize: "1.5rem",
                                        }}
                                    />
                                }
                            />
                        </Link>
                    </Tooltip>
                    <Tooltip title="Xem địa chỉ">
                        <Button
                            type="danger"
                            icon={<FaMapMarkedAlt/>}
                            onClick={() => showModalAddress(record)}
                            style={{
                                borderRadius: '20px',
                                color: '#17a2b8',
                                border: '1px solid #17a2b8'
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const onAddressChange = (selectedProvince, selectedDistrict, selectedWard, specificAddress) => {
        setNewAddress(
            {
                districtId: selectedDistrict,
                provinceId: selectedProvince,
                wardId: selectedWard,
                specificAddress: specificAddress
            }
        )
    }

    return (
        <div>
            <h3>Quản lý tài khoản khách hàng</h3>

            <Modal
                title={`Danh sách địa chỉ của ${recordSelected?.fullName} - ${recordSelected?.phoneNumber}`}
                okText="OK"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Button type="primary" onClick={handleAddAddressClick} icon={<PlusOutlined/>}
                        style={{marginBottom: '10px'}}>
                    Thêm địa chỉ mới
                </Button>
                <div style={{maxHeight: '300px', overflowY: 'auto'}}>
                    {addresses.length === 0 ? (
                        <p>Không có địa chỉ nào.</p>
                    ) : (
                        addresses.map((addressObj, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    border: '1px solid #d9d9d9',
                                    marginBottom: '10px',
                                    backgroundColor: '#f9f9f9'
                                }}
                            >
                                <span style={{flex: 1}}>{addressObj.address}</span>
                                <Button
                                    type="default"
                                    icon={<EditOutlined/>}
                                    onClick={() => handleEditAddressClick(addressObj)}
                                    style={{marginLeft: '10px', borderRadius: '5px'}}
                                />
                                <Button
                                    type="primary"
                                    onClick={() => handleSetDefaultAddress(addressObj.id)}
                                    style={{
                                        marginLeft: '10px',
                                        borderRadius: '5px',
                                        backgroundColor: addressObj.isDefault ? '#4CAF50' : '#1890ff'
                                    }}
                                >
                                    {addressObj.isDefault ? 'Mặc định' : 'Đặt làm mặc định'}
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </Modal>

            <Drawer
                title={isEditing ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
                width={360}
                onClose={() => setIsDrawerOpen(false)}
                visible={isDrawerOpen}
                bodyStyle={{paddingBottom: 80}}
            >
                <Form layout="vertical">
                    <Form.Item name="address">
                        <AddressSelectorAntd
                            provinceId={newAddress.provinceId}
                            districtId={newAddress?.districtId}
                            wardId={newAddress?.wardId}
                            specificAddressDefault={newAddress?.specificAddress}
                            onAddressChange={onAddressChange}/>
                    </Form.Item>

                </Form>
                <Button
                    type="primary"
                    onClick={() =>
                        isEditing
                            ? handleEditAddress(editingAddressId)
                            : handleAddAddress()
                    }
                    style={{width: '100%', marginBottom: '10px', borderRadius: '5px'}}
                >
                    {isEditing ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ'}
                </Button>
            </Drawer>

            <Card>
                <h4>Bộ lọc</h4>
                <hr/>
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                    <label style={{marginRight: '10px', fontWeight: '500'}}>Tìm kiếm:</label>
                    <Input
                        placeholder="Tìm kiếm tên và sdt..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{width: '250px', marginRight: '20px', borderRadius: '10px'}}
                    />

                    <label style={{marginRight: '10px', fontWeight: '500'}}>Ngày sinh:</label>
                    <RangePicker
                        format="YYYY-MM-DD"
                        showTime
                        value={dobRange}
                        onChange={(dates) => setDobRange(dates)}
                        style={{marginRight: '20px', borderRadius: '10px'}}
                    />
                </div>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <label style={{marginRight: '10px', fontWeight: '500'}}>Trạng thái:</label>
                    <Select
                        value={status}
                        onChange={(value) => setStatus(value)}
                        style={{width: '250px', marginRight: "20px", borderRadius: '10px'}}
                    >
                        <Option value="null">Tất cả</Option>
                        <Option value="HOAT_DONG">Hoạt Động</Option>
                        <Option value="NGUNG_HOAT_DONG">Ngưng hoạt động</Option>
                        <Option value="CHUA_KICH_HOAT">Chưa kích hoạt</Option>
                    </Select>

                    <label style={{marginRight: '10px', fontWeight: '500'}}>Khoảng tuổi:</label>
                    <Slider
                        range
                        min={0}
                        max={100}
                        value={ageRange}
                        onChange={(value) => setAgeRange(value)}
                        style={{width: '250px'}}
                    />
                </div>
                <div style={{marginTop: '20px'}}>
                    <Button
                        type="primary"
                        icon={<SearchOutlined/>}
                        onClick={handleSearch}
                        style={{marginRight: "10px"}}
                    >
                        Tìm kiếm
                    </Button>
                    <Button
                        type="default"
                        icon={<ReloadOutlined/>}
                        onClick={handleReset}
                        style={{marginRight: "10px"}}
                    >
                        Làm mới bộ lọc
                    </Button>

                    <Link to="/admin/customer-create">
                        <Button
                            type="primary"
                            icon={<PlusOutlined/>}
                            style={{marginRight: "10px"}}
                        >
                            Thêm mới
                        </Button>
                    </Link>
                    <Button type="default" icon={<DownloadOutlined/>} onClick={handleExportToExcel}>
                        Xuất Excel
                    </Button>
                    <Table 
                        columns={columns} 
                        dataSource={data} 
                        style={{marginTop: '20px'}}
                        scroll={{ x: 1100 }}
                        pagination={pagination}
                        onChange={handleTableChange}
                    />
                </div>
            </Card>
        </div>
    );
};

export default CustomerTest;