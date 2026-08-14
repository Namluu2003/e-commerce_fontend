import {Tag} from "antd";
import {
    convertLongTimestampToDate,
    formatVND,
    paymentBillStatusConvert,
    paymentMethodConvert,
    paymentTypeConvert
} from "../../../helpers/Helpers.js";
import React from "react";

export const columnsPaymentMethodTable = [
    {
        title: 'STT',
        dataIndex: 'stt',
        key: 'stt',
        render: (text, record, index) => index + 1,
    },
    {
        title: 'Mã giao dịch',
        dataIndex: 'transactionCode',
        key: 'transactionCode',
        render: (record) => <span>{record ? record : "Không"}</span>,
    },
    {
        title: 'Loại giao dịch',
        dataIndex: 'paymentMethodsType',
        key: 'paymentMethodsType',
        render: (text) => {
            const paymentType = paymentTypeConvert[text] || { text: text, color: "blue" };
            return <Tag style={{ fontSize: 16 }} color={paymentType.color}>{paymentType.text}</Tag>;
        }
    },
    {
        title: 'Phương thức thanh toán',
        dataIndex: 'paymentMethod',
        key: 'paymentMethod',
        render: (text) => <Tag style={{
            fontSize: 16
        }} color={"blue"}>{paymentMethodConvert[text]}</Tag>,
    },
    {
        title: 'Trạng thái thanh toán',
        dataIndex: 'paymentBillStatus',
        key: 'paymentBillStatus',
        render: (text) => {
            const paymentStatus = paymentBillStatusConvert[text] || { text: text, color: "blue" };
            return <Tag style={{ fontSize: 16 }} color={paymentStatus.color}>{paymentStatus.text}</Tag>;
        }

    },
    {
        title: 'Thời gian',
        dataIndex: 'createdAt',
        key: 'createdAt ',
        render: (timestamp) => {
            return convertLongTimestampToDate(timestamp)
        },
    },

    {
        title: 'Tổng tiền',
        dataIndex: 'totalMoney',
        key: 'totalMoney',
        render: (text) => (
            <div>
                {formatVND(text)}
            </div>
        )
    },
    {
        title: 'Ghi chú',
        dataIndex: 'notes',
        key: 'notes',
    },

];