import {Button, Image, InputNumber} from "antd";
import React from "react";
import {formatVND} from "../../../helpers/Helpers.js";
import {COLORS} from "../../../constants/constants.js";

export const salesColumns = (onActionClick, handleOnChangeQuantityInCart, ) => [
    {
        title: 'STT',
        dataIndex: 'stt',
        key: 'stt',
        align: 'center',
        render: (text, record, index) => index + 1,
    },
    {
        title: "Ảnh",
        dataIndex: "image",
        key: "image",
        render: (images) => {
            if (images && Array.isArray(images) && images.length > 0) {
                return (
                    <Image
                        src={images[0].url}
                        alt="Sản phẩm"
                        style={{
                            width: '100px',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                        }}
                    />
                );
            }
            return (
                <div
                    style={{
                        width: '100px',
                        height: '100px',
                        backgroundColor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px'
                    }}
                >
                    No image
                </div>
            );
        },
        onCell: () => ({
            style: {
                width: "80px",
                height: "60px",
                padding: "5px",
            },
        }),
    },
    {
        title: 'Sản phẩm',
        dataIndex: 'productName',
        align: 'center',
        key: 'productName',
        render: (_, record) => {
            const { productName, sizeName, colorName, materialName, soleName } = record;
            return productName ? (
                <div>
                    <div>{`${productName} - [${sizeName}] - [${colorName}]`}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                        {`Chất liệu: ${materialName}, Đế: ${soleName}`}
                    </div>
                </div>
            ) : "";
        },
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

                    <div style={{ fontWeight: "", fontSize: "14px", textDecoration: hasPromotion ? "line-through" : "none" }}>
                        {formattedPrice}
                    </div>
                    {hasPromotion && (
                        <div style={{ color: "red", fontSize: "13px" }}>
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
    },
    {
        title: 'Số lượng',
        dataIndex: 'quantityInCart',
        key: 'quantityInCart',
        render: (quantityInCart, record) => (
            <InputNumber
                min={1}
                type={"number"}
                value={quantityInCart}
                defaultValue={quantityInCart}
                onChange={(value) => handleOnChangeQuantityInCart(value, record)}
            />
        ),

    },
    {
        title: 'Tổng tiền',
        align: 'center',
        key: 'totalPrice',
        render: (_, record) => {
            const hasPromotion = record.promotionResponse?.promotionName && record.promotionResponse?.discountValue;
            const discountValue = record.promotionResponse?.discountValue || 0;
            const effectivePrice = hasPromotion ? record.price * (1 - discountValue / 100) : record.price;

            return formatVND(effectivePrice * (record.quantityInCart || 1));
        },
    },
    {
        title: 'Hành động',
        dataIndex: 'action',
        align: 'center',
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
                Xóa
            </Button>
        ),
    },
];