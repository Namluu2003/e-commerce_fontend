import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

    const handleProvinceChange = (event) => {
        const provinceId = event.target.value;
        setSelectedProvince(provinceId);
        setDistricts([]); // Reset danh sách quận/huyện khi chọn tỉnh mới
        setWards([]); // Reset danh sách xã/phường khi chọn tỉnh mới

        // Gọi API lấy quận/huyện của tỉnh đã chọn
        axios.get(`https://provinces.open-api.vn/api/p/${provinceId}/?depth=2`)
            .then(response => {
                setDistricts(response.data.districts); // Cập nhật danh sách quận/huyện
            })
            .catch(error => {
                console.error('Error fetching districts:', error);
            });

        // Call onAddressChange to send data to parent
        onAddressChange(provinceId, selectedDistrict, selectedWard, specificAddress);
    };

    const handleDistrictChange = (event) => {
        const districtId = event.target.value;
        setSelectedDistrict(districtId);
        setWards([]); // Reset danh sách xã/phường khi chọn quận/huyện mới

        // Gọi API lấy xã/phường của quận/huyện đã chọn
        axios.get(`https://provinces.open-api.vn/api/d/${districtId}/?depth=2`)
            .then(response => {
                setWards(response.data.wards); // Cập nhật danh sách xã/phường
            })
            .catch(error => {
                console.error('Error fetching wards:', error);
            });

        // Call onAddressChange to send data to parent
        onAddressChange(selectedProvince, districtId, selectedWard, specificAddress);
    };

    const handleWardChange = (event) => {
        const wardId = event.target.value;
        setSelectedWard(wardId);

        // Call onAddressChange to send data to parent
        onAddressChange(selectedProvince, selectedDistrict, wardId, specificAddress);
    };

    const handleSpecificAddressChange = (event) => {
        const specificAddress = event.target.value;
        setSpecificAddress(specificAddress);

        // Call onAddressChange to send data to parent
        onAddressChange(selectedProvince, selectedDistrict, selectedWard, specificAddress);
    };

    useEffect(() => {
        // When component mounts, notify parent with initial values
        onAddressChange(selectedProvince, selectedDistrict, selectedWard, specificAddress);
    }, []);

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Select Address</h2>

            <div className="row">
                {/* Dropdown for Provinces */}
                <div className="col-md-6 mb-3">
                    <label htmlFor="province" className="form-label">Tỉnh</label>
                    <select
                        id="province"
                        className="form-select"
                        onChange={handleProvinceChange}
                        value={selectedProvince || ''}
                    >
                        <option value="">Select Province</option>
                        {provinces.map(province => (
                            <option key={province.code} value={province.code}>
                                {province.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Dropdown for Districts */}
                <div className="col-md-6 mb-3">
                    <label htmlFor="district" className="form-label">Huyện</label>
                    <select
                        id="district"
                        className="form-select"
                        onChange={handleDistrictChange}
                        value={selectedDistrict || ''}
                        disabled={!selectedProvince}
                    >
                        <option value="">Select District</option>
                        {districts.map(district => (
                            <option key={district.code} value={district.code}>
                                {district.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Dropdown for Wards */}
                <div className="col-md-6 mb-3">
                    <label htmlFor="ward" className="form-label">Xã</label>
                    <select
                        id="ward"
                        className="form-select"
                        value={selectedWard || ''}
                        onChange={handleWardChange}
                        disabled={!selectedDistrict}
                    >
                        <option value="">Select Ward</option>
                        {wards.map(ward => (
                            <option key={ward.code} value={ward.code}>
                                {ward.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Input for House Number */}
                <div className="col-md-6 mb-3">
                    <label htmlFor="houseNumber" className="form-label">Số nhà/ngõ đường</label>
                    <input
                        type="text"
                        id="houseNumber"
                        className="form-control"
                        value={specificAddress}
                        onChange={handleSpecificAddressChange}
                        placeholder="Enter house number or street name"
                    />
                </div>
            </div>
        </div>
    );
}

export default AddressSelector;
