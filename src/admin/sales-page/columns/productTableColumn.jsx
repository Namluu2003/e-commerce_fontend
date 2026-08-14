import {Button, Tag, Tooltip} from "antd";
import React from "react";
import {COLORS} from "../../../constants/constants.js";

export const productTableColumn = (pagination, handleOnAddProductToBill) => [
    {
        title: "#",
        dataIndex: "stt",
        key: "stt",
        render: (_, __, index) => (
            <div>{index + 1 + (pagination.current - 1) * pagination.pageSize}</div>
        ),
        onCell: () => ({
            style: {
                width: "50px",
                height: "50px",
                lineHeight: "50px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            },
        }),
    },
    {
        title: "Ảnh",
        dataIndex: "image",
        key: "image",
        render: (images, record) => {
            const hasPromotion = record.promotionResponse?.promotionName && record.promotionResponse?.discountValue;
            const discountValue = record.promotionResponse?.discountValue || 0;

            return (
                <div style={{position: 'relative', width: '70px', height: '70px'}}>
                    {images && Array.isArray(images) && images.length > 0 ? (
                        <img
                            src={images[0].url}
                            alt="Sản phẩm"
                            style={{
                                width: '70px',
                                height: '70px',
                                objectFit: 'cover',
                                borderRadius: '4px'
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: '70px',
                                height: '70px',
                                backgroundColor: '#f5f5f5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '4px'
                            }}
                        >
                            No image
                        </div>
                    )}

                    {hasPromotion && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-10px',
                                width: '26px',
                                height: '26px',
                                backgroundColor: 'red',
                                borderRadius: '50%',
                                color: 'white',
                                fontSize: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                boxShadow: '0 0 2px rgba(0,0,0,0.3)'
                            }}
                        >
                            -{discountValue}%
                        </div>
                    )}
                </div>
            );
        },
        onCell: () => ({
            style: {
                width: "90px",
                height: "60px",
                padding: "5px",
            },
        }),
    },
    {
        title: "Sản phẩm",
        dataIndex: "productName",
        key: "productName",
        render: (_, record) => {
            const {productName, sizeName, colorName} = record;
            return (
                <div style={{textAlign: "center", whiteSpace: "normal"}}>
                    <div style={{fontWeight: "bold", fontSize: "14px"}}>{productName}</div>
                    <div style={{color: "#555", fontSize: "14px"}}>Size: {sizeName}</div>
                    <div style={{color: "#888", fontSize: "14px"}}>Màu: {colorName}</div>
                </div>
            );
        },
        onCell: () => ({
            style: {
                width: "180px",
                height: "70px",
                padding: "8px",
                textAlign: "center",
                verticalAlign: "middle",
                wordWrap: "break-word",
                whiteSpace: "normal",
            },
        }),
    },

    {
        title: "Hãng",
        dataIndex: "brandName",
        key: "productName",
        onCell: () => ({
            style: {
                width: "80px",
                height: "50px",
                lineHeight: "50px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            },
        }),
    },

    {
        title: "Chất liệu",
        dataIndex: "materialName",
        key: "productName",
        onCell: () => ({
            style: {
                width: "80px",
                height: "50px",
                lineHeight: "50px",

                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            },
        }),
    },

    {
        title: "Đế giày",
        dataIndex: "soleName",
        key: "productName",

        onCell: () => ({
            style: {
                width: "100px",
                height: "50px",
                lineHeight: "50px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            },
        }),
    },
    {
        title: "Giới tính",
        dataIndex: "genderName",
        key: "productName",

        onCell: () => ({
            style: {
                width: "100px",
                height: "50px",
                lineHeight: "50px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            },
        }),
    },
    {
        title: "Số lượng",
        dataIndex: "quantity",
        key: "productName",
        onCell: () => ({
            style: {
                width: "100px",
                height: "50px",
                lineHeight: "50px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            },
        }),
    },
    {
        title: "Giá",
        dataIndex: "price",
        key: "price",
        render: (price, record) => {
            if (price === null || price === undefined) return "Chưa có giá";

            const formattedPrice = new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
            }).format(price);

            const hasPromotion = record.promotionResponse?.promotionName && record.promotionResponse?.discountValue;
            const discountValue = record.promotionResponse?.discountValue || 0;
            const discountedPrice = price * (1 - discountValue / 100);

            return (
                <div className="">

                    <div style={{
                        fontWeight: "",
                        fontSize: "14px",
                        textDecoration: hasPromotion ? "line-through" : "none"
                    }}>
                        {formattedPrice}
                    </div>
                    {hasPromotion && (
                        <div style={{color: "red", fontSize: "13px"}}>
                            Giảm {discountValue} %
                        </div>
                    )}
                    {hasPromotion && (
                        <div>
                            <div style={{
                                color: COLORS.primary
                            }} className="fw-bold">
                                {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND"
                                }).format(discountedPrice)}
                            </div>
                        </div>
                    )}
                </div>
            );
        },
        onCell: () => ({
            style: {
                width: "100px",
                height: "10px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            },
        }),
    },
    {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (_, {status}) => {
            let color = status === "HOAT_DONG" ? "green" : "red";
            if (!status) {
                return null;
            }
            return (
                <Tag color={color} style={{fontSize: "12px", padding: "5px 15px"}}>
                    {status === "HOAT_DONG" ? "Hoạt động" : "Ngừng hoạt động"}{" "}
                    {/* Hiển thị status với chữ in hoa */}
                </Tag>
            );
        },
    },
    {
        title: "Thao tác",
        dataIndex: "actions",
        key: "actions",
        render: (_, record) => {
            if (!record.status || Object.keys(record).length === 0) {
                return null;
            }
            return (
                <>
                    <Tooltip title="Chọn sản phẩm">
                        <Button
                            type={"primary"}
                            onClick={() => {
                                handleOnAddProductToBill(record)
                            }}
                            style={{marginRight: "1rem"}}
                        >
                            Chọn
                        </Button>
                    </Tooltip>
                </>
            );
        },
    },
];