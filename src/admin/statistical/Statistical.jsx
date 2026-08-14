import React from 'react';
import CardStatical from "./componets/CardStatical.jsx";
import ChartComponent from "./componets/ChartComponent.jsx";
import ChartStatusBill from "./componets/ChartStatusBill.jsx";
import SalesRevenue from "./componets/SalesRevenue.jsx"
import {Card} from 'antd';
import ProductOrderChart from "./componets/ProductOrderChart.jsx";

const Statistical = () => {
    return (
        <>
                <div style={{ fontSize: '30px', fontWeight: 'bold',textAlign:'center' }}>
                    TỔNG QUAN CỬA HÀNG
                </div>
           <div className={"d-flex flex-column gap-3"}>
            {/* Thống kê doanh thu */}
            <Card>
                <SalesRevenue />
            </Card>
               <Card>
                   <ProductOrderChart/>
            </Card>
            {/* Thống kê sản phẩm bán chạy và biểu đồ tròn */}
            <ChartStatusBill />

            {/* Thống kê sản phẩm tồn kho */}
            <Card>
                <CardStatical />
            </Card>
        </div>
        </>

    );
};

export default Statistical;



