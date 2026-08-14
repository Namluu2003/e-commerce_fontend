import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Select, Input, Row, Col, Form, Button } from 'antd';

const { Option } = Select;

function AddressSelector({ provinceId, districtId, wardId, specificAddressDefault, onAddressChange }) {
    const [provinces, setProvinces] = useState([]); // Tỉnh
    const [districts, setDistricts] = useState([]); // Quận/Huyện
    const [wards, setWards] = useState([]); // Xã/Phường
    const [selectedProvince, setSelectedProvince] = useState(provinceId); // Province ID
    const [selectedDistrict, setSelectedDistrict] = useState(districtId); // District ID
    const [selectedWard, setSelectedWard] = useState(wardId); // Ward ID
    const [specificAddress, setSpecificAddress] = useState(specificAddressDefault); // House Number/Input
    useEffect(() => {
        axios.get('https://provinces.open-api.vn/api/p/')
            .then(response => {
                setProvinces(response.data); // Cập nhật danh sách tỉnh
            })
            .catch(error => {
                console.error('Error fetching provinces:', error);
            });
    }, []);


    useEffect(() => {
        axios.get(`https://provinces.open-api.vn/api/p/${selectedProvince}/?depth=2`)
            .then(response => {
                setDistricts(response.data.districts); // Cập nhật danh sách quận/huyện
            })
            .catch(error => {
                console.error('Error fetching districts:', error);
            });

        // Call onAddressChange to send data to parent
        onAddressChange(selectedProvince, selectedDistrict, selectedWard, specificAddress);
    },[selectedProvince])

    useEffect(() => {
        // Gọi API lấy xã/phường của quận/huyện đã chọn
        axios.get(`https://provinces.open-api.vn/api/d/${selectedDistrict}/?depth=2`)
            .then(response => {
                setWards(response.data.wards); // Cập nhật danh sách xã/phường
            })
            .catch(error => {
                console.error('Error fetching wards:', error);
            });
        onAddressChange(selectedProvince, selectedDistrict, selectedWard, specificAddress);
    }, [selectedDistrict]);
    const handleProvinceChange = (value) => {
        setSelectedProvince(value);
        setDistricts([]); // Reset danh sách quận/huyện khi chọn tỉnh mới
        setSelectedDistrict(null)
        setSelectedWard(null)
        setWards([]); // Reset danh sách xã/phường khi chọn tỉnh mới
    };
    const handleDistrictChange = (value) => {
        setSelectedDistrict(value);
        setSelectedWard(null)
        setWards([]); // Reset danh sách xã/phường khi chọn quận/huyện mới
    };

    const handleWardChange = (value) => {
        setSelectedWard(value);
        // Call onAddressChange to send data to parent
        onAddressChange(selectedProvince, selectedDistrict, value, specificAddress);
    };

    const handleSpecificAddressChange = (e) => {
        const { value } = e.target;
        setSpecificAddress(value);
        onAddressChange(selectedProvince, selectedDistrict, selectedWard, value);
    };

    useEffect(() => {
        // When component mounts, notify parent with initial values
        onAddressChange(selectedProvince, selectedDistrict, selectedWard, specificAddress);
    }, []);

    return (
        <div >
            <Form >
                <Row gutter={16}>
                    {/* Dropdown for Provinces */}
                    <Col span={12} className={"mb-3"}>
                        <Form.Item
                            label="Tỉnh"
                            labelCol={{ span: 12 }}
                            wrapperCol={{ span: 24 }}
                        >
                            <Select
                                value={selectedProvince || null}
                                onChange={handleProvinceChange}
                                placeholder="Chọn tỉnh/thành phố"
                            >
                                {provinces.map(province => (
                                    <Option key={province.code} value={province.code}>
                                        {province.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    {/* Dropdown for Districts */}
                    <Col span={12}>
                        <Form.Item
                            label="Huyện"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                        >
                            <Select
                                value={selectedDistrict || null}
                                onChange={handleDistrictChange}
                                placeholder="Chọn quận/huyện"
                                disabled={!selectedProvince}
                            >
                                {districts.map(district => (
                                    <Option key={district.code} value={district.code}>
                                        {district.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    {/* Dropdown for Wards */}
                    <Col span={12}>
                        <Form.Item
                            label="Xã"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                        >
                            <Select
                                value={selectedWard || null}
                                onChange={handleWardChange}
                                placeholder="Chọn xã/phường"
                                disabled={!selectedDistrict}
                            >
                                {wards.map(ward => (
                                    <Option key={ward.code} value={ward.code}>
                                        {ward.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Số nhà/ngõ đường"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                        >
                            <Input
                                value={specificAddress}
                                onChange={handleSpecificAddressChange}
                                placeholder="Ngõ/tên đường ..."
                            />
                        </Form.Item>
                    </Col>
                </Row>


            </Form>
        </div>
    );
}

export default AddressSelector;
