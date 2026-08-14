import React from 'react';
import {Avatar, Button, Card, Checkbox, Col, Collapse, Form, Image, Input, List, Row, Select, Space, Tag} from "antd";
import {FaCheck, FaCheckCircle, FaTicketAlt} from "react-icons/fa";
import {MdOutlineDonutLarge} from "react-icons/md";
import {AiFillCreditCard} from "react-icons/ai";
import {Typography} from "antd";
import voucher_image from "../../../../public/img/voucher_image.png"
import {convertDate, formatVND, generateAddressString} from "../../../helpers/Helpers.js";
import {SiCheckio} from "react-icons/si";
import {COLORS} from "../../../constants/constants.js";
import AddressSelectorAntd from "../../utils/AddressSelectorAntd.jsx";
import {  Radio } from 'antd';
import PaymentQRComponent from "./PaymentQRComponent.jsx";

const {Text} = Typography;

const style = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
};


const SalePaymentInfo = ({
                             amount,
                             handleCustomerMoneyChange,
                             customerMoney,
                             change,
                             vouchers,
                             handleOnSelectedVoucher,
                             discount,
                             selectedVouchers,
                             isShipping,
                             handleCheckIsShipping,
                             handleChangePaymentMethod,
                             paymentMethods,
                             handleBankCustomerMoneyChange,
                             handleCashCustomerMoneyChange,
                             cashCustomerMoney,
                             bankCustomerMoney,
                             handleOnPayment,
                             isSuccess,
                             handleOnPrintBill,
                             canPayment,
                             onAddressChange,
                             onAddressSelected,
                             customerAddresses,
                             addressShipping,
                             recipientName,
                             recipientPhoneNumber,
                             isNewShippingInfo,
                             detailAddressShipping,
                             customerInfo,
                             handleOnChangerRecipientPhoneNumber,
                             handleOnChangerRecipientName,
                             shippingFee,
                             handleOnChangeShippingFee,
                             currentBill,
                             transactionCode,
                             isCOD,
                             handleCheckIsCOD,
                             showAllCustomerAddresses,
                            isFreeShip,
                             freeShipData,
                             phoneError
                         }) => {
    const missingAmount = Math.max(0, parseInt(amount)+(parseInt(isFreeShip ? 0 : shippingFee)) - parseInt(customerMoney)); // Không cộng cho discount nữa
    return (
        <>
            <Checkbox checked={isShipping} value={isShipping} onChange={handleCheckIsShipping}>
                Giao hàng
            </Checkbox>

            <Card hidden={!isShipping}>
                <div className={"d-flex gap-5 align-items-center justify-content-between"}>
                    <div>
                        <h3 style={{marginBottom: '16px'}}>Thông tin giao hàng</h3>
                        {
                            isFreeShip  ?
                                ( <Tag color="green">Đơn hàng đã được miễn phí ship!</Tag> )  :
                                <Tag color="blue">Mua thêm tối thiểu {
                                    formatVND(freeShipData?.minOrderValue - (amount + discount) )
                                } để được miễn phí vận chuyển</Tag>
                        }
                    </div>
                    {
                        isShipping &&  customerInfo &&   <Button type={"primary"} onClick={
                            () =>   showAllCustomerAddresses(customerInfo)
                        }>
                            Xem tất cả địa chỉ
                        </Button>
                    }
                </div>
                <hr/>
                <Form layout="vertical">
                    {isShipping && (
                        <Form.Item name="address" >
                            <Radio.Group
                                style={style}
                                onChange={onAddressSelected}
                                value={addressShipping}
                                options={customerAddresses}
                            />
                        </Form.Item>


                    )}

                    {isShipping && (
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Tên người nhận"
                                >
                                    <Input value={recipientName}
                                           maxLength={50}
                                           onChange={handleOnChangerRecipientName}
                                           placeholder="Nhập tên người nhận" />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    label="Số điện thoại người nhận"
                                    validateStatus={phoneError ? "error" : ""}
                                    help={phoneError}
                                >
                                    <Input
                                        value={recipientPhoneNumber}
                                        onChange={handleOnChangerRecipientPhoneNumber}
                                        type="text"
                                        placeholder="Nhập số điện thoại"
                                        maxLength={10}
                                    />
                                </Form.Item>

                            </Col>
                        </Row>
                    )}

                    {isShipping && ( isNewShippingInfo || !customerInfo ) && (
                        <div style={{ marginBottom: '24px' }}>
                            <Form.Item >
                                <h5>Chọn địa chỉ giao hàng</h5>
                                <AddressSelectorAntd onAddressChange={onAddressChange} />
                            </Form.Item>
                        </div>
                    )}

                    {isShipping && (
                        <Form.Item label="Phí vận chuyển">
                            <Input
                                type="number"
                                min={0}
                                placeholder="Nhập số tiền"
                                onChange={handleOnChangeShippingFee}
                                value={shippingFee}
                                suffix="VNĐ"
                            />
                        </Form.Item>
                    )}
                </Form>
            </Card>
            <Card>
                <h3>Thông tin thanh toán</h3>
                <hr/>
                <div className={"row"}>
                    <div className={"col-md-6"}>
                        <div className={"py-2"}>
                            <Collapse
                                expandIconPosition={"end"}
                                defaultActiveKey={['1', '2']}
                                items={[{
                                    key: '1',
                                    label: (
                                        <div className={"d-flex justify-content-between align-items-center"}>
                                            <span className={"d-flex gap-3 align-items-center"}><FaTicketAlt/> Phiếu giảm giá</span>
                                            <span className={"bold"}>Chọn hoặc nhập mã giảm giá </span>
                                        </div>
                                    ),
                                    children: (
                                        <>
                                            {selectedVouchers && (
                                                <div
                                                    style={{
                                                        padding: '10px',
                                                        marginBottom: '10px',
                                                        backgroundColor: '#f6ffed',
                                                        border: '1px solid #b7eb8f',
                                                        borderRadius: '4px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '8px'
                                                    }}
                                                >
                                                    {
                                                        discount > 0 &&
                                                        <div className="d-flex align-items-center gap-2">
                                                            <FaCheckCircle color={COLORS.success}/>
                                                            <div>
                                                                <div style={{fontWeight: 'bold'}}>
                                                                    Đã áp dụng voucher tốt nhất:
                                                                </div>
                                                                <div>
                                                                    {selectedVouchers.voucherName} - Giảm {' '}
                                                                    {formatVND(discount)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }

                                                    {selectedVouchers.suggestions && selectedVouchers.suggestions.length > 0 && (
                                                        <div
                                                            style={{
                                                                marginTop: '8px',
                                                                padding: '8px',
                                                                backgroundColor: '#fff1f0',
                                                                border: '1px solid #ffccc7',
                                                                borderRadius: '4px'
                                                            }}
                                                        >
                                                            <div style={{fontWeight: 'bold', marginBottom: '4px'}}>
                                                                Gợi ý tối ưu voucher:
                                                            </div>
                                                            {selectedVouchers.suggestions.map((suggestion, index) => (
                                                                <div key={index}
                                                                     style={{fontSize: '13px', marginBottom: '4px'}}>
                                                                    Mua thêm {formatVND(suggestion.amountNeeded)} để
                                                                    dùng voucher{' '}
                                                                    <strong>{suggestion.voucherName}</strong> và tiết
                                                                    kiệm thêm{' '}
                                                                    <strong
                                                                        style={{color: '#ff4d4f'}}>{formatVND(suggestion.additionalBenefit)}</strong>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className={""} style={{}}>
                                                <List
                                                    itemLayout="horizontal"
                                                    dataSource={vouchers}
                                                    renderItem={(item, index) => {
                                                        const originalTotal = amount + parseInt(shippingFee); // Total amount including shipping
                                                        const isVoucherApplicable = originalTotal >= (item.billMinValue || 0); // Check if the voucher can be applied

                                                        return (
                                                            <List.Item
                                                                actions={[
                                                                    (selectedVouchers?.bestVoucher?.id === item.id ?
                                                                            <FaCheckCircle size={25}
                                                                                           color={`${COLORS.success}`}/>
                                                                            :
                                                                            <Button
                                                                                type={"primary"}
                                                                                onClick={() => isVoucherApplicable ? handleOnSelectedVoucher(item) : null}
                                                                                disabled={!isVoucherApplicable} // Disable if not applicable
                                                                            >
                                                                                Chọn
                                                                            </Button>
                                                                    )
                                                                ]}
                                                            >
                                                                <List.Item.Meta
                                                                    avatar={<img width={55} src={voucher_image}
                                                                                 alt={"img voucher"}/>}
                                                                    title={<a
                                                                        href="https://ant.design">{item?.voucherName}</a>}
                                                                    description={
                                                                        <div>
                                                                            <div>Số lượng : {item?.quantity ?? 0}</div>
                                                                            <div>Ngày hết hạn
                                                                                : {convertDate(item.endDate)}</div>
                                                                            <div>Giá trị giảm
                                                                                : {item?.discountType === "MONEY"
                                                                                    ? formatVND(item.discountValue)
                                                                                    : `${item.discountValue}% (tối đa ${formatVND(item.discountMaxValue)})`
                                                                                }</div>
                                                                            <div>Giá trị đơn hàng tối
                                                                                thiểu: {formatVND(item?.billMinValue || 0)}</div>
                                                                            <div>Giảm tối
                                                                                đa: {item?.discountMaxValue && item.discountType === "PERCENT"
                                                                                    ? formatVND(item.discountMaxValue)
                                                                                    : 'Không giới hạn'
                                                                                }</div>
                                                                            <div>Loại
                                                                                voucher: {item?.voucherType === "PUBLIC" ? "Công khai" : "Riêng tư"}</div>
                                                                        </div>
                                                                    }
                                                                />
                                                            </List.Item>
                                                        );
                                                    }}
                                                />
                                            </div>
                                        </>
                                    )
                                }]}
                            />
                        </div>
                    </div>
                    <div className={"col-md-6"}>

                        <Form layout="vertical" onFinish={handleOnPayment}>
                            <Form.Item label="Tổng tiền hàng">
                                <Text strong>{formatVND((amount + discount))}</Text>
                            </Form.Item>
                            <Form.Item label="Giảm giá">
                                <Text strong>{formatVND(discount)}</Text>
                            </Form.Item>
                            <Form.Item label="Phí vận chuyển">
                                <Text
                                    className={isFreeShip ? "text-decoration-line-through" : ""}

                                    strong>{formatVND(shippingFee ? parseInt(shippingFee) : 0)}</Text>
                            </Form.Item>
                            <Form.Item label="Tổng tiền cần thanh toán">
                                <Text strong style={{color: "red"}}>{formatVND(amount
                                    + parseInt(!isFreeShip ? shippingFee : 0))}</Text>
                            </Form.Item>
                            <Form.Item label="Chọn phương thức thanh toán">
                                <Select
                                    disabled={transactionCode}
                                    onChange={handleChangePaymentMethod} value={paymentMethods} defaultValue="cash"
                                    style={{width: "100%"}}>
                                    <Option value="cash">
                                        <MdOutlineDonutLarge/> Tiền mặt
                                    </Option>
                                    <Option value="bank">
                                        <AiFillCreditCard/> Chuyển khoản
                                    </Option>
                                    <Option value="cashAndBank">
                                        <MdOutlineDonutLarge/> Tiền mặt & <AiFillCreditCard/> Chuyển khoản
                                    </Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                hidden={paymentMethods !== "cash" && paymentMethods !== "cashAndBank"}
                                label="Tiền mặt khách đưa"
                            >
                                <Input
                                    type="number"
                                    min={0}
                                    disabled={isCOD}
                                    placeholder="Nhập số tiền"
                                    onChange={handleCashCustomerMoneyChange}
                                    value={parseInt(cashCustomerMoney)}
                                    suffix="VNĐ"
                                />
                            </Form.Item>

                            <Form.Item hidden={paymentMethods !== "cashAndBank"} label="Số tiền cần chuyển khoản thêm">
                                <Text type="danger">{missingAmount > 0 ? missingAmount.toLocaleString() : 0} đ</Text>
                            </Form.Item>

                            <Form.Item
                                hidden={paymentMethods !== "bank" && paymentMethods !== "cashAndBank"}
                                label="Tiền khách chuyển khoản"
                            >
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="Nhập số tiền"
                                    onChange={handleBankCustomerMoneyChange}
                                    value={parseInt(bankCustomerMoney)}
                                    suffix="VNĐ"
                                    disabled={paymentMethods === "bank" || paymentMethods === "cashAndBank"}
                                />
                            </Form.Item>

                            {(paymentMethods === "bank" || paymentMethods === "cashAndBank") && (
                                <Form.Item label="Quét mã QR để thanh toán">
                                    <PaymentQRComponent
                                        key={currentBill}
                                        amount={missingAmount}
                                        handleBankCustomerMoneyChange={handleBankCustomerMoneyChange}
                                        currentBill={currentBill}
                                        transactionCode={transactionCode}
                                        paymentMethods={paymentMethods}
                                    />
                                    <div>
                                        Mã giao dịch : {transactionCode ? transactionCode : ""}
                                    </div>
                                </Form.Item>
                            )}

                            {customerMoney < amount && (
                                <Text type="danger">Vui lòng nhập đủ tiền khách đưa!</Text>
                            )}
                            <Form.Item label="Số tiền còn thiếu">
                                <Text type="danger">{missingAmount > 0 ? missingAmount.toLocaleString() : 0} đ</Text>
                            </Form.Item>
                            <Form.Item label="Tiền thừa">
                                <Text strong>{change > 0 ? change.toLocaleString() : 0} đ</Text>
                            </Form.Item>

                            {
                                isShipping &&
                                <Form.Item hidden={isSuccess}>
                                    <Checkbox checked={isCOD} value={isCOD} onChange={handleCheckIsCOD}>
                                        Thanh toán khi giao hàng
                                    </Checkbox>
                                </Form.Item>
                            }

                            <Form.Item hidden={isSuccess}>
                                <Button onClick={handleOnPayment} type="primary" block
                                        disabled={isCOD ? false : !canPayment}>
                                    Tạo hóa đơn
                                </Button>
                            </Form.Item>

                            <Form.Item hidden={!isSuccess}>
                                <Button onClick={handleOnPrintBill} type="primary"
                                        block>
                                    In hóa đơn
                                </Button>
                            </Form.Item>

                        </Form>
                    </div>
                </div>
            </Card>

        </>
    );
};

export default SalePaymentInfo;