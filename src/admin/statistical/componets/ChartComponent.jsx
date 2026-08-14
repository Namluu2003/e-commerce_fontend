import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area } from "recharts";
import { Card, DatePicker, Space, Select, Typography } from "antd";
import moment from "moment";

const { RangePicker } = DatePicker;
const { Title } = Typography;
const { Option } = Select;

// Hàm tạo dữ liệu giả lập cho biểu đồ
const generateData = (timeFrame, startDate, endDate) => {
    const data = [];
    let currentDate = moment(startDate);

    while (currentDate.isSameOrBefore(endDate, 'day')) {
        data.push({
            date: currentDate.format(
                timeFrame === "day" ? "DD/MM/YYYY" :
                timeFrame === "week" ? `Tuần ${currentDate.isoWeek()} - ${currentDate.year()}` :
                timeFrame === "month" ? currentDate.format("MM/YYYY") : currentDate.format("YYYY")
            ),
            value: Math.floor(Math.random() * (timeFrame === "day" ? 100 : timeFrame === "week" ? 500 : timeFrame === "month" ? 2000 : 10000)) + 50
        });
        currentDate.add(1, timeFrame === "week" ? "weeks" : timeFrame);
    }
    return data;
};

const ChartComponent = () => {
    const [timeFrame, setTimeFrame] = useState("day");
    const [dateRange, setDateRange] = useState([moment().subtract(9, "days"), moment()]);
    const [data, setData] = useState(generateData("day", dateRange[0], dateRange[1]));
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const handleDateChange = (dates) => {
        if (dates) {
            setDateRange(dates);
            setData(generateData(timeFrame, dates[0], dates[1]));
        }
    };

    const handleTimeFrameChange = (value) => {
        let newStartDate, newEndDate;
        if (value === "day") {
            newStartDate = moment().subtract(9, "days");
            newEndDate = moment();
        } else if (value === "week") {
            newStartDate = moment().startOf("isoWeek").subtract(9, "weeks");
            newEndDate = moment().endOf("isoWeek");
        } else if (value === "month") {
            newStartDate = moment().startOf("year");
            newEndDate = moment().endOf("year");
        } else {
            newStartDate = moment().subtract(4, "years").startOf("year");
            newEndDate = moment().endOf("year");
        }
        setTimeFrame(value);
        setDateRange([newStartDate, newEndDate]);
        setData(generateData(value, newStartDate, newEndDate));
    };

    return (
        <>
        
        <Card style={{ padding: "20px" }}>
            <Title level={3}>Phân tích</Title>
            <Space style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between" }}>
                <RangePicker format="DD/MM/YYYY" onChange={handleDateChange} value={dateRange} />
                <Select defaultValue="day" onChange={handleTimeFrameChange} value={timeFrame}>
                    <Option value="day">Ngày</Option>
                    <Option value="week">Tuần</Option>
                    <Option value="month">Tháng</Option>
                    <Option value="year">Năm</Option>
                </Select>
            </Space>

            <ResponsiveContainer width="100%" height={400}>
                <LineChart 
                    data={data} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    onMouseMove={(e) => setHoveredIndex(e.activeTooltipIndex)}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#d6e6ff" />
                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#4287f5" fill="#a0c4ff" opacity={0.5} />
                    <Line type="monotone" dataKey="value" stroke="#4287f5" strokeWidth={3} dot={{ r: 6 }} />
                    {hoveredIndex !== null && (
                        <ReferenceLine x={data[hoveredIndex]?.date} stroke="#4287f5" strokeWidth={2} strokeDasharray="3 3" />
                    )}
                </LineChart>
            </ResponsiveContainer>
        </Card>     
           </>

    );
};

export default ChartComponent;
