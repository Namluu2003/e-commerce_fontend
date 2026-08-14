import React, {useEffect, useState} from "react";
import {Image} from "antd";
import {genQrUrl} from "../../../utils/payment.js";
import axios from "axios";
import {toast} from "react-toastify";

const PaymentQrComponent = ({amount, currentBill, transactionCode, handleBankCustomerMoneyChange}) => {
    const tokenSePay = import.meta.env.VITE_SE_PAY_API_KEY;
    const [qrUrl, setQrUrl] = useState("");
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // Generate QR Code khi `amount` hoặc `currentBill` thay đổi
    useEffect(() => {
        if (amount > 0 && currentBill) {
            generateNewQr();
        }
    }, [amount, currentBill]);

    // Hàm tạo mã QR
    const generateNewQr = () => {
        const url = genQrUrl(amount, currentBill);
        if (url) {
            setQrUrl(url);
            if (!transactionCode) {
                setPaymentSuccess(false); // Reset trạng thái thanh toán khi tạo QR mới
            }
            setTimeout(() => setQrUrl(""), 300000); // Xóa QR sau 5 phút
        } else {
            setQrUrl("");
        }
    };

    // Bắt đầu kiểm tra giao dịch sau khi tạo QR, dừng khi `paymentSuccess = true`
    useEffect(() => {
        if (!paymentSuccess) {
            const intervalId = setInterval(() => {
                console.log("Checking transactions...");
                fetchTransactions();
            }, 6500);

            return () => clearInterval(intervalId); // Cleanup interval khi component unmount hoặc paymentSuccess thay đổi
        }
    }, [paymentSuccess]);

    // Hàm lấy danh sách giao dịch
    const fetchTransactions = async () => {
        console.log("Fetching transactions...");
        try {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            const formatDate = (date) => date.toISOString().split("T")[0];
            const response = await axios.get("/userapi/transactions/list", {
                params: {
                    transaction_date_min: formatDate(today),
                    transaction_date_max: formatDate(tomorrow),
                },
                headers: {
                    Authorization: `Bearer ${tokenSePay}`,
                },
            });

            const billTransaction = response.data.transactions.find(t => t.transaction_content.split(" ")[0] === currentBill);

            // const billTransaction = {
            //     amount_in  : amount,
            //     reference_number : "ok 1321323"
            // }

            if (billTransaction) {
                console.log("billTransaction",amount)
                handleBankCustomerMoneyChange(billTransaction.amount_in, billTransaction.reference_number);
                setPaymentSuccess(true);
                toast.success("Thanh toán thành công!");
            }
        } catch (err) {
            console.error("Lỗi khi lấy dữ liệu  giao dịch", err);
        }
    };

    return qrUrl ? <Image width={150} height={150} src={qrUrl} alt="QR Code"/> : null;
};

export default PaymentQrComponent;

