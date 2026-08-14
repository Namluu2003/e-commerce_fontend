import {Tag} from "antd";
import {convertBillStatusToString, convertLongTimestampToDate} from "../../../helpers/Helpers.js";
import React from "react";

export const columnsBillHistory = [
    {
        title: 'STT',
        dataIndex: 'stt',
        key: 'stt',
        render: (text, record, index) => index + 1,
    },
    {
        title: 'Trạng thái',
        dataIndex: 'status',
        render: (record) => <div>
            <Tag style={{
                fontSize: 16
            }} color={"purple"}>{convertBillStatusToString(record)}</Tag>
        </div>,
        key: 'status',
    },
    {
        title: 'Người xác nhận',
        dataIndex: 'createdBy',
        key: 'createdBy',
    },
    {
        title: 'Ghi chú',
        dataIndex: 'description',
        key: 'description',
    },
    {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (timestamp) => {
            return convertLongTimestampToDate(Number(timestamp));
        },
    },


];