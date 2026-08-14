import {Badge} from "antd";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";

export const itemsTabsBillList = () => {
    const [counts, setCounts] = useState({});

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const response = await axiosInstance.get("/api/admin/bill/count-by-status");
                const data = response.data;
                const countsMap = data.reduce((acc, item) => {
                    acc[item.name] = item.value;
                    return acc;
                }, {});
                setCounts(countsMap);
            } catch (error) {
                console.error("Error fetching counts:", error);
            }
        };

        fetchCounts();
    }, []);

    const tabs = [
        { key: 'all', label: "Tất cả" },
        { key: 'CHO_XAC_NHAN', label: "Chờ xác nhận" },
        { key: 'DA_XAC_NHAN', label: "Đã xác nhận" },
        { key: 'CHO_VAN_CHUYEN', label: "Chờ vận chuyển" },
        { key: 'DANG_VAN_CHUYEN', label: "Đang vận chuyển" },
        { key: 'DA_THANH_TOAN', label: "Đã thanh toán" },
        { key: 'DA_GIAO_HANG', label: "Đã giao hàng" },
        { key: 'DA_HOAN_THANH', label: "Đã hoàn thành" },
        { key: 'DA_HUY', label: "Đã hủy" },

    ];
    console.log(counts["CHO_XAC_NHAN"]);
    return tabs.map(tab => ({
        key: tab.key,
        label: (
            <>
                {tab.label} <Badge
                showZero={true}
                count={counts[tab.key] !== undefined ? counts[tab.key] : 0} className={"mb-3 ms-1"} />
            </>
        )
    }));
}