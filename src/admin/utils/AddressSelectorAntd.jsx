import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Select, Input, Row, Col, Form } from 'antd';

const { Option } = Select;
const tokenGHN = import.meta.env.VITE_GHN_API_KEY;
const GHN_API_URL = 'https://online-gateway.ghn.vn/shiip/public-api/master-data';
const TOKEN = tokenGHN;

function AddressSelector({ provinceId, districtId, wardId, specificAddressDefault, onAddressChange }) {
    console.log(provinceId, districtId, wardId, specificAddressDefault)
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // Đảm bảo provinceId, districtId,
    const [selectedProvince, setSelectedProvince] = useState(provinceId ? Number(provinceId) : null);
    const [selectedDistrict, setSelectedDistrict] = useState(districtId ? Number(districtId) : null);
    const [selectedWard, setSelectedWard] = useState(wardId ? String(wardId) : null);
    const [specificAddress, setSpecificAddress] = useState(specificAddressDefault || '');

    // Fetch provinces
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await axios.get(`${GHN_API_URL}/province`, { headers: { Token: TOKEN } });
                setProvinces(response.data.data);
            } catch (error) {
                console.error('Error fetching provinces:', error);
            }
        };
        fetchProvinces();
    }, []);

    // Fetch districts khi selectedProvince thay đổi
    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const response = await axios.post(
                    `${GHN_API_URL}/district`,
                    { province_id: selectedProvince },
                    { headers: { Token: TOKEN } }
                );
                setDistricts(response.data.data);
            } catch (error) {
                console.error('Error fetching districts:', error);
            }
        };

        if (selectedProvince) {
            fetchDistricts();
        } else {
            setDistricts([]);
            setSelectedDistrict(null);
        }
    }, [selectedProvince]);

    // Fetch wards khi selectedDistrict thay đổi
    useEffect(() => {
        const fetchWards = async () => {
            try {
                const response = await axios.post(
                    `${GHN_API_URL}/ward`,
                    { district_id: selectedDistrict },
                    { headers: { Token: TOKEN } }
                );
                setWards(response.data.data);
            } catch (error) {
                console.error('Error fetching wards:', error);
            }
        };

        if (selectedDistrict) {
            fetchWards();
        } else {
            setWards([]);
            setSelectedWard(null);
        }
    }, [selectedDistrict]);

    // Cập nhật lại khi props thay đổi
    useEffect(() => {
            setSelectedProvince(provinceId ? Number(provinceId) : null);
    }, [provinceId]);

    useEffect(() => {
        if (districtId) {
            setSelectedDistrict(Number(districtId));
        }
    }, [districtId]);

    useEffect(() => {
        if (wardId) {
            setSelectedWard(String(wardId));
        }
    }, [wardId]);

    useEffect(() => {
        setSpecificAddress(specificAddressDefault || '');
    }, [specificAddressDefault]);

    // Handle Select changes
    const handleProvinceChange = (value) => {
        setSelectedProvince(Number(value));
        setSelectedDistrict(null);
        setSelectedWard(null);
        setDistricts([]);
        setWards([]);
        onAddressChange(Number(value), null, null, specificAddress);
    };

    const handleDistrictChange = (value) => {
        setSelectedDistrict(Number(value));
        setSelectedWard(null);
        setWards([]);
        onAddressChange(selectedProvince, Number(value), null, specificAddress);
    };

    const handleWardChange = (value) => {
        setSelectedWard(String(value));
        onAddressChange(selectedProvince, selectedDistrict, Number(value), specificAddress);
    };

    const handleSpecificAddressChange = (e) => {
        const value = e.target.value;
        setSpecificAddress(value);
        onAddressChange(selectedProvince, selectedDistrict, selectedWard, value);
    };

    return (
        <Form>
            <Row gutter={16}>
                <Col span={12} className="mb-3">
                    <Form.Item label="Tỉnh/Thành phố">
                        <Select
                            value={selectedProvince}
                            onChange={handleProvinceChange}
                            placeholder="Chọn tỉnh/thành phố"
                            showSearch
                            filterOption={(input, option) =>
                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            optionFilterProp="children"
                        >
                            {provinces.map((province) => (
                                <Option key={province.ProvinceID} value={province.ProvinceID}>
                                    {province.ProvinceName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item label="Quận/Huyện">
                        <Select
                            value={selectedDistrict}
                            onChange={handleDistrictChange}
                            placeholder="Chọn quận/huyện"
                            disabled={!selectedProvince}
                            showSearch
                            filterOption={(input, option) =>
                                (option?.children ?? '').toLowerCase().inclfudes(input.toLowerCase())
                            }
                            optionFilterProp="children"
                        >
                            {districts?.map((district) => (
                                <Option key={district.DistrictID} value={district.DistrictID}>
                                    {district.DistrictName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item label="Phường/Xã">
                        <Select
                            value={selectedWard}
                            onChange={handleWardChange}
                            placeholder="Chọn xã/phường"
                            disabled={!selectedDistrict}
                            showSearch
                            filterOption={(input, option) =>
                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            optionFilterProp="children"
                        >
                            {wards.map((ward) => (
                                <Option key={ward.WardCode} value={ward.WardCode}>
                                    {ward.WardName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item label="Số nhà/ngõ đường">
                        <Input
                            value={specificAddress}
                            maxLength={50}
                            onChange={handleSpecificAddressChange}
                            placeholder="Ngõ/tên đường ..."
                        />
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );
}

export default AddressSelector;
