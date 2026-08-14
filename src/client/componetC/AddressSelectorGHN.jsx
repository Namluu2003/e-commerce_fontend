import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Select, Input, Row, Col, Form, Spin } from "antd";
import { calculateShippingFee, generateAddressString } from "./apiGHN";

const { Option } = Select;
const GHN_API_URL =
  "https://online-gateway.ghn.vn/shiip/public-api/master-data";

function AddressSelectorGHN({
  provinceId,
  districtId,
  wardId,
  specificAddressDefault,
  onAddressChange,
}) {
  const tokenGHN = useRef(import.meta.env.VITE_GHN_API_KEY); // Lưu token tránh re-render
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState(provinceId || null);
  const [selectedDistrict, setSelectedDistrict] = useState(districtId || null);
  const [selectedWard, setSelectedWard] = useState(wardId || null);
  const [specificAddress, setSpecificAddress] = useState(
    specificAddressDefault || ""
  );

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  //

  async function getAddress() {
    const fullAddress = await generateAddressString(
      201,
      3440,
      "13008",
      "123 Đường ABC"
    );
    console.log("Địa chỉ đầy đủ:", fullAddress);
  }
  useEffect(() => {
    console.log("🔄 Cập nhật state từ props:", {
      provinceId,
      districtId,
      wardId,
      specificAddressDefault,
    });

    setSelectedProvince(Number(provinceId) || null);
    setSelectedDistrict(Number(districtId) || null);
    setSelectedWard(String(wardId) || null);
    setSpecificAddress(specificAddressDefault || "");
  }, [provinceId, districtId, wardId, specificAddressDefault]);

  // Lấy danh sách tỉnh/thành phố
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const response = await axios.get(`${GHN_API_URL}/province`, {
          headers: { Token: tokenGHN.current },
        });
        setProvinces(response.data.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách tỉnh/thành phố:", error);
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
    console.log(getAddress());
  }, []);

  // Lấy danh sách quận/huyện khi tỉnh thay đổi
  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setSelectedDistrict(null);
      return;
    }

    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const response = await axios.post(
          `${GHN_API_URL}/district`,
          { province_id: selectedProvince },
          { headers: { Token: tokenGHN.current } }
        );
        setDistricts(response.data.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách quận/huyện:", error);
      } finally {
        setLoadingDistricts(false);
      }
    };
    fetchDistricts();
  }, [selectedProvince]);

  // Lấy danh sách phường/xã khi quận thay đổi
  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      setSelectedWard(null);
      return;
    }

    const fetchWards = async () => {
      setLoadingWards(true);
      try {
        const response = await axios.post(
          `${GHN_API_URL}/ward`,
          { district_id: selectedDistrict },
          { headers: { Token: tokenGHN.current } }
        );
        setWards(response.data.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách phường/xã:", error);
      } finally {
        setLoadingWards(false);
      }
    };
    fetchWards();
  }, [selectedDistrict]);

  // Hàm xử lý thay đổi tỉnh/thành phố
  const handleProvinceChange = (value) => {
    setSelectedProvince(value);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);
    onAddressChange(value, null, null, specificAddress);
  };

  // Hàm xử lý thay đổi quận/huyện
  const handleDistrictChange = (value) => {
    setSelectedDistrict(value);
    setSelectedWard(null);
    setWards([]);
    onAddressChange(selectedProvince, value, null, specificAddress);
  };

  // Hàm xử lý thay đổi phường/xã
  const handleWardChange = (value) => {
    setSelectedWard(value);
    onAddressChange(selectedProvince, selectedDistrict, value, specificAddress);
  };

  // Hàm xử lý thay đổi địa chỉ cụ thể
  const handleSpecificAddressChange = (e) => {
    const value = e.target.value;
    setSpecificAddress(value);
    onAddressChange(selectedProvince, selectedDistrict, selectedWard, value);
    console.log("dịa chỉ ", selectedProvince, selectedDistrict, selectedWard);
  };

  return (
    <Form layout="vertical">
      <Row gutter={16}>
        {/* Tỉnh / Thành phố */}
        <Col span={12}>
          <Form.Item label="Tỉnh/Thành phố">
            <Select
              value={selectedProvince}
              onChange={handleProvinceChange}
              placeholder="Chọn tỉnh/thành phố"
              loading={loadingProvinces}
              allowClear
            >
              {provinces.map((province) => (
                <Option key={province.ProvinceID} value={province.ProvinceID}>
                  {province.ProvinceName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {/* Quận / Huyện */}
        <Col span={12}>
          <Form.Item label="Quận/Huyện">
            <Select
              value={selectedDistrict}
              onChange={handleDistrictChange}
              placeholder="Chọn quận/huyện"
              disabled={!selectedProvince}
              loading={loadingDistricts}
              allowClear
            >
              {districts.map((district) => (
                <Option key={district.DistrictID} value={district.DistrictID}>
                  {district.DistrictName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {/* Phường / Xã */}
        <Col span={12}>
          <Form.Item label="Phường/Xã">
            <Select
              value={selectedWard}
              onChange={handleWardChange}
              placeholder="Chọn xã/phường"
              disabled={!selectedDistrict}
              loading={loadingWards}
              allowClear
            >
              {wards.map((ward) => (
                <Option key={ward.WardCode} value={ward.WardCode}>
                  {ward.WardName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {/* Địa chỉ cụ thể */}
        <Col span={12}>
          <Form.Item label="Số nhà/ngõ đường">
            <Input
              value={specificAddress}
              onChange={handleSpecificAddressChange}
              placeholder="Nhập số nhà, ngõ, đường..."
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Hiển thị loading nếu dữ liệu đang được tải */}
      {(loadingProvinces || loadingDistricts || loadingWards) && <Spin />}
    </Form>
  );
}

export default AddressSelectorGHN;
