import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, Typography, Card, Space, Statistic } from "antd";
import { Link } from "react-router-dom";
import moment from "moment";
import { ShoppingCartOutlined, DollarOutlined, UserOutlined, ShoppingOutlined } from '@ant-design/icons';
import AddressSelector from "./AddressSelector.jsx";
import AddressSelectorAntd from "./AddressSelectorAntd.jsx";
import {generateAddressString} from "../../helpers/Helpers.js";
import Statistical from "../statistical/Statistical.jsx";

const { Title, Text } = Typography;

const Dashboard = () => {
    const [data, setData] = useState([
        { label: "Chờ Xác Nhận", value: 0 },
        { label: "Chờ Lấy Hàng", value: 0 },
        { label: "Đang giao hàng", value: 0 },
        { label: "Sản Phẩm Hết Hàng", value: 0 },
    ]);
    const [currentTime, setCurrentTime] = useState(moment().format("HH:mm:ss"));
    const [topProducts, setTopProducts] = useState([]);
    const [statistics, setStatistics] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0
    });

    const [address, setAddress] = useState({
        provinceId: null,
        districtId: null,
        wardId: null,
        specificAddress: '',
    });

    const [addressText, setAddressText] = useState('')

    const handleAddressChange =   (provinceId, districtId, wardId, specificAddress) => {
        setAddress({
            provinceId,
            districtId,
            wardId,
            specificAddress,
        });
        console.log('Updated Address:', {
            provinceId,
            districtId,
            wardId,
            specificAddress,
        });

    };

    // Fetch dashboard data
    useEffect(() => {
        // TODO: Replace with actual API calls
        setStatistics({
            totalRevenue: 1500000000,
            totalOrders: 150,
            totalCustomers: 89,
            totalProducts: 200
        });

        setTopProducts([
            { name: "Nike Air Max", sales: 50 },
            { name: "Adidas Ultraboost", sales: 45 },
            { name: "Jordan 1", sales: 40 },
            { name: "Converse Chuck 70s", sales: 35 }
        ]);

        const interval = setInterval(() => {
            setCurrentTime(moment().format("HH:mm:ss"));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="dashboard-container">

                        <Statistical />

        </div>
    );
};

export default Dashboard;
