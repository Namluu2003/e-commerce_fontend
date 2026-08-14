import {Button, Image, Tag} from "antd";
import {convertBillStatusToString, convertLongTimestampToDate, formatVND} from "../../../helpers/Helpers.js";
import {MdDelete} from "react-icons/md";
import React from "react";
import {Link} from "react-router-dom";
import {FiEye} from "react-icons/fi";
import BillStatusComponent from "../componets/BillStatusComponent.jsx";
import BillTypeComponent from "../componets/BillTypeComponent.jsx";
import {FaEye} from "react-icons/fa6";
import {COLORS} from "../../../constants/constants.js";

export const columnsBillProductTable = (onActionClick) => [
    {
        title: 'STT',
        dataIndex: 'stt',
        key: 'stt',
        render: (text, record, index) => index + 1,
    },
    {
        title: 'Ảnh sản phẩm',
        dataIndex: 'imageUrl',
        key: 'imageUrl',
        render: (url) => {
            return (
                <div className="d-flex justify-content-center">
                    <Image
                        style={{ objectFit: 'contain' }}
                        width={120}
                        src={url ?? 'https://via.placeholder.com/120'}
                    />
                </div>
            );
        },
    },
    {
        title: 'Tên sản phẩm',
        dataIndex: 'productName',
        key: 'productName',
    },
    {
        title: 'Thương hiệu',
        dataIndex: 'brand',
        key: 'brand',
        render: (brand) => brand?.brandName ?? 'Không xác định',
    },


    {
        title: 'Số lượng có sẵn',
        dataIndex: 'totalQuantity',
        key: 'totalQuantity',
    },

    {
        title: 'Tổng tiền',
        dataIndex: 'totalPrice',
        key: 'totalPrice',
        render: (price) =>
            price ? `${price.toLocaleString()} VND` : 'Chưa tính',
    },
    {
        title: 'Hành động',
        dataIndex: 'action',
        key: 'action',
        render: (_, record) => (
            <Button
                type="primary"
                onClick={() => {
                    if (onActionClick) {
                        onActionClick(record);
                    }
                }}
            >
                Chọn
            </Button>
        ),
    },
];

export  const  columnsBillList = () => {
    return  [

        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            align: 'center',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Mã hóa đơn',
            dataIndex: 'billCode',
            align: 'center',
            key: 'billCode',
        },
        {
            title: 'Khách Hàng',
            dataIndex: 'customerName',
            key: 'customerName',
            render: (text, record, index) => {
                return (
                    <div>
                        {record.customerName ? record.customerName  : "Khách lẻ"}
                    </div>
                )
            },
            align: 'center',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'customerPhone',
            key: 'customerPhone',
            align: 'center',
            render: (text, record, index) => {
                return (
                    <div>
                        {record.customerPhone ? record.customerPhone  : "Khách lẻ"}
                    </div>
                )
            },
        },

        {
            title: 'Loại đơn hàng',
            dataIndex: 'billType',
            key: 'billType',
            render: (record) =>   <BillTypeComponent text={record}  status={record} color={"purple"}/>,
            align: 'center',

        },

        {
            title: 'Ngày tạo',
            dataIndex: 'createAt',
            align: 'center',
            key: 'createAt',
            render: (timestamp) => {
                return convertLongTimestampToDate(timestamp)
            },
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalMoney',
            align: 'center',
            render: (record) => formatVND(record),
            key: 'totalMoney',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            align: 'center',
            render: (record) =>  <BillTypeComponent text={convertBillStatusToString(record)}  status={record} color={"green"}/>,
            key: 'status',
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Link to={`/admin/bill/bill-detail/${record.billCode}`}>
                    <Button

                        icon={<FaEye  color={`${COLORS.primary}`} size={20} />}
                        onClick={() => {
                        }}
                    >

                    </Button>
                </Link>

            ),
        },
    ]
};
