import React, {useState, useEffect} from 'react';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList} from 'recharts';
import {DatePicker, Segmented, Select, Space, message} from 'antd';
import dayjs from 'dayjs';
import 'antd/dist/reset.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axiosInstance from "../../../utils/axiosInstance.js";

const {Option} = Select;
const {RangePicker} = DatePicker;

const TIME_OPTIONS = [
    {label: 'Ngày', value: 'day'},
    {label: 'Tuần', value: 'week'},
    {label: 'Năm', value: 'year'},
];

// Hàm format tiền
const formatCurrency = (value) => {
    if (typeof value !== 'number') return value;
    return value.toLocaleString('vi-VN', {style: 'currency', currency: 'VND'});
};

const ProductOrderChart = () => {
    const [selectedType, setSelectedType] = useState('orders');
    const [selectedTime, setSelectedTime] = useState('day');
    const [selectedRange, setSelectedRange] = useState(null);
    const [chartData, setChartData] = useState([]);

    const getTypeLabel = (value) => {
        if (value === 'orders') return 'Đơn Hàng';
        if (value === 'quantity') return 'Số Lượng';
        if (value === 'totalMoney') return 'Doanh Thu';
        return '';
    };

    const getTimeLabel = (value) => {
        const found = TIME_OPTIONS.find(option => option.value === value);
        return found ? found.label : '';
    };

    const fetchData = async () => {
        try {
            const params = new URLSearchParams({
                type: selectedType,
                time: selectedTime,
            });

            if (selectedRange) {
                params.append('from', dayjs(selectedRange[0]).format('YYYY-MM-DD'));
                params.append('to', dayjs(selectedRange[1]).format('YYYY-MM-DD'));
            }

            const res = await axiosInstance.get(`/api/admin/statistical/getStatistics?${params.toString()}`);
            const data = await res.data;
            setChartData(data);
        } catch (error) {
            console.error(error);
            message.error('Không thể lấy dữ liệu thống kê');
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedType, selectedTime, selectedRange]);

    return (
        <div className=" mt-4">
            <div className="p-4 shadow-sm">
                <h5 className="mb-4">
                    Thống kê {getTypeLabel(selectedType).toLowerCase()} theo {getTimeLabel(selectedTime).toLowerCase()}
                </h5>

                <div className="d-flex justify-content-between mb-4">

                    <Space>

                        <Segmented
                            options={[
                                {label: 'Đơn Hàng', value: 'orders'},
                                {label: 'Doanh Thu', value: 'totalMoney'},
                                {label: 'Số Lượng', value: 'quantity'},
                            ]}
                            className="segmented-primary"
                            value={selectedType}
                            onChange={value => setSelectedType(value)}
                            block
                            style={{ minWidth: '300px' }} // Tăng chiều rộng
                        />
                    </Space>


                    <Space>
                        <RangePicker
                            format="DD/MM/YYYY"
                            onChange={(dates) => setSelectedRange(dates)}
                        />
                        <Segmented
                            options={TIME_OPTIONS}
                            value={selectedTime}
                            onChange={value => setSelectedTime(value)}
                        />
                    </Space>

                </div>

                <div style={{width: '100%', height: 400}}>
                    <ResponsiveContainer>
                        <BarChart
                            data={chartData}
                            margin={{top: 20, right: 30, left: 20, bottom: 5}}
                        >
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="label"/>
                            <YAxis/>
                            <Tooltip
                                formatter={(value) =>
                                    selectedType === 'totalMoney' ? formatCurrency(value) : value
                                }
                                labelFormatter={(label) => `Thời gian: ${label}`}
                            />
                            <Legend
                                formatter={(value) => getTypeLabel(value)}
                            />
                            <Bar dataKey={selectedType} fill="#1890ff">
                                <LabelList
                                    dataKey={selectedType}
                                    position="top"
                                    formatter={(value) =>
                                        selectedType === 'totalMoney' ? formatCurrency(value) : value
                                    }
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ProductOrderChart;