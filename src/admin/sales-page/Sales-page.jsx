import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
    Badge,
    Button,
    Card,
    message, Modal,
    Table,
    Tabs,
} from "antd";
import {toast} from "react-toastify";
import {salesColumns} from "./columns/columns.jsx";
import {fetchProducts} from "../product/ProductDetail/ApiProductDetail.js";
import CustomerSelect from "./component/CustomerSelect.jsx";
import axios from "axios";
import moment from "moment/moment.js";
import SalePaymentInfo from "./component/SalePaymentInfo.jsx";
import {baseUrl, calculateShippingFee, formatVND, generateAddressString} from "../../helpers/Helpers.js";
import {postChangeQuantityProduct} from "./billService.js";
import axiosInstance from "../../utils/axiosInstance.js";
import ProductDetailModal from "./component/ProductDetailModal.jsx";
import {value} from "lodash/seq.js";
import {checkConfirmModal} from "../../helpers/CheckConfirmModal.jsx";
const { confirm } = Modal;

import {Viewer} from "@react-pdf-viewer/core";
import {printPlugin} from "@react-pdf-viewer/print";

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/print/lib/styles/index.css';
import 'pdfjs-dist/build/pdf.worker.entry';
import ScanQrModalComponent from "./component/ScanQRModalComponent.jsx";


const SalesPage = () => {

    const defaultKey = moment().format("HHmmssSSS");

    const [items, setItems] = useState([
        {
            key: defaultKey,
            itemName: ` Hóa đơn ${defaultKey}`,
            label: (
                <span>
                     Hóa đơn {defaultKey} <Badge showZero={true} className={"mb-2"} count={0}
                                                                  offset={[5, -5]}/>
                </span>
            ),
            productList: [],
            isSuccess: false,
            canPayment: false,
            customerInfo: null,
            payInfo: {
                paymentMethods: "cash",
                discount: 0,
                amount: 0,
            },
            closable: true,
            billCode: null,
            isShipping: false,
            isNewShippingInfo: false,
            shippingInfo: null,
            customerAddresses: [],
            addressShipping: null,
            detailAddressShipping: {
                provinceId: null,
                districtId: null,
                wardId: null,
                specificAddress: '',
            },
            recipientName: '',  // Số điện thoại người nhận hàng
            recipientPhoneNumber: '', // Tên ngươi nhận
            shippingFee: 0,
            isCOD: false,
            vouchers: [],
            isFreeShip: false
        },
    ]);

    const onEditTab = (targetKey, action) => {
        if (action === "remove") {
            handleCloseTab(targetKey);
        }
        if (action === "add") {
            handleOnCreateBill();
        }
    };
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5, // Số dòng hiển thị mỗi trang
    });
    const [currentBill, setCurrentBill] = useState() // 1 mảng các sản phẩm
    const [open, setOpen] = useState(false);
    const [vouchers, setVouchers] = useState()
    const [vouchersPublic, setVouchersPublic] = useState()
    const [selectedVouchers, setSelectedVouchers] = useState({});

    const [isScanQr, setIsScanQr] = useState(false)
    const [currentBillData, setCurrentBillData] = useState(null)
    const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);
    const [freeShipData, setFreeShipData] = useState()

    const currentBillDataMemo =
        useMemo(() => items.find(item => item.key === currentBill) || {}, [items, currentBill]);
// e cong soket
const [showApp,setShowApp]= useState(false)

  useEffect(() => {
 
  

     if(currentBillData) {
        axiosInstance.post('/api/test-ws', currentBillData).then(res => {
            console.log("res", res)
        })
     }

  }, [currentBill, currentBillData]);
  
    const fetchFreeShipOrder = async () => {
        try {
            const res = await axiosInstance.get('/api/admin/freeship-order');
            setFreeShipData(res.data);

        } catch (error) {
            toast.error('Không thể tải dữ liệu freeship');
        } finally {

        }
    };


    useEffect(() => {
        setCurrentBillData(currentBillDataMemo)
    }, [currentBillDataMemo])

    const showModal = () => {
        setOpen(true);
    };
    const handleOk = () => {
        setOpen(false);
    };
    const handleCancel = () => {
        setOpen(false);
    };

    useEffect(() => {
        setCurrentBill(defaultKey)
        getAllVoucher()
        getCurrentUserLogin()
        fetchFreeShipOrder()
    }, []);

    const getCurrentUserLogin = async () => {
        const response = await axiosInstance.get("/api/authentication/user-info")
        console.log("response", response)
    }

    const handleCustomerMoneyChange = (e) => {
        const value = parseFloat(e.target.value) || 0;
        setItems(prevItems =>
            prevItems.map(item =>
                item.key === currentBill
                    ? {
                        ...item,
                        payInfo: {
                            ...item.payInfo,
                            customerMoney: value,
                            change: value - (item.payInfo.amount || 0)
                        }
                    }
                    : item
            )
        );
    };



    // const handleCashCustomerMoneyChange = (e) => {
    //     const value = parseInt(e.target.value) || 0;
    //     setItems(prevItems =>
    //         prevItems.map(item => {
    //             if (  item.key === currentBill) {
    //                 console.log("cashCustomerMoney", value + (item.payInfo?.bankCustomerMoney || 0))
    //                 return {
    //                     ...item,
    //                     payInfo: {
    //                         ...item.payInfo,
    //                         cashCustomerMoney: value,
    //                         customerMoney: value + (item.payInfo?.bankCustomerMoney || 0),
    //                         change: (value + (item.payInfo?.bankCustomerMoney || 0)) - (item.payInfo?.amount || 0) - (item.shippingFee || 0)
    //                     }
    //                 }
    //             }
    //             return item
    //         }
    //         )
    //     );
    // };
    //
    //
    // const handleBankCustomerMoneyChange = (value, transactionCode) => {
    //
    //     setItems(prevItems =>
    //         prevItems.map(item => {
    //             if(  item.key === currentBill) {
    //                 console.log("item.payInfo.cashCustomerMoney", value + (item.payInfo?.bankCustomerMoney || 0))
    //                 console.log("item.payInfo.cashCustomerMoney", value + (item.payInfo?.customerMoney || 0))
    //                 return {
    //                     ...item,
    //                     payInfo: {
    //                         ...item.payInfo,
    //                         bankCustomerMoney: value,
    //                         transactionCode: transactionCode ?? null,
    //                         customerMoney: value + (item.payInfo?.cashCustomerMoney || 0),
    //                         change: (value + (item.payInfo?.cashCustomerMoney || 0)) -
    //                             (item.payInfo?.amount || 0) -
    //                             (item.payInfo?.discount || 0)
    //                     }
    //                 }
    //             }
    //             return item;
    //         }
    //         )
    //     );
    // };

    const handleCashCustomerMoneyChange = (e) => {
        const value = parseInt(e.target.value) || 0;
        updatePayInfo({ cash: value });
    };

    const handleBankCustomerMoneyChange = (value, transactionCode) => {
        updatePayInfo({ bank: value, transactionCode });
    };



    const updatePayInfo = ({ cash = null, bank = null, transactionCode = null }) => {
        setItems(prevItems =>
            prevItems.map(item => {
                if (item.key !== currentBill) return item;

                const prevPayInfo = item.payInfo || {};
                const cashCustomerMoney = cash !== null ? cash : (prevPayInfo.cashCustomerMoney || 0);
                const bankCustomerMoney = bank !== null ? bank : (prevPayInfo.bankCustomerMoney || 0);

                const customerMoney = Number(cashCustomerMoney) + Number(bankCustomerMoney);
                const amount = prevPayInfo.amount || 0;
                const discount = prevPayInfo.discount || 0;
                const shippingFee = item.shippingFee ? parseInt(item.shippingFee) : 0;
                const isFreeShip = item.isFreeShip


                return {
                    ...item,
                    payInfo: {
                        ...prevPayInfo,
                        cashCustomerMoney,
                        bankCustomerMoney,
                        customerMoney,
                        transactionCode: transactionCode ?? prevPayInfo.transactionCode ?? null,
                        change: customerMoney - amount - (isFreeShip ? 0 : shippingFee)
                    }
                };
            })
        );
    };


    const itemsRef = useRef([]);
    useEffect(() => {
        setItems(prevItems => {
            const newItems = prevItems.map(item => {
                const totalAmount = item.payInfo?.amount || 0;
                const customerMoney = item.payInfo?.customerMoney || 0;
                const isShippingInfoComplete = item.isShipping
                    ? item.detailAddressShipping?.provinceId &&
                      item.detailAddressShipping?.districtId &&
                      item.detailAddressShipping?.wardId &&
                      item.detailAddressShipping?.specificAddress
                    : true;
                const canPay = totalAmount > 0 && customerMoney >= totalAmount && !item.isSuccess && isShippingInfoComplete;

                return {
                    ...item,
                    canPayment: canPay
                };
            });
            const isSame = prevItems.every((item, index) => item.canPayment === newItems[index].canPayment);
            return isSame ? prevItems : newItems;
        });
        itemsRef.current = items;
    }, [items]);

    useEffect(() => {
        return () => {
            (async () => {
                await restoreAllProducts(itemsRef.current);
            })();
        };
    }, []);


    const handleOnCreateBill = () => {
        if (items?.length >= 10) {
            toast.warning("Đạt giới hạn hóa đơn");
            return;
        }
        const newKey = moment().format("HHmmssSSS");
        const newItem = {
            key: newKey,
            itemName: ` Hóa đơn ${newKey}`,
            label: (
                <span>
                     Hóa đơn {newKey} <Badge showZero={true} className={"mb-2"} count={0} offset={[5, -5]}/>
                </span>
            ),
            productList: [],
            isSuccess: false,
            canPayment: false,
            customerInfo: null,
            payInfo: {
                paymentMethods: "cash",
                discount: 0,
                amount: 0,
            },
            closable: true,
            billCode: null,
            isShipping: false,
            isNewShippingInfo: false,
            shippingInfo: null,
            customerAddresses: [],
            addressShipping: null,
            detailAddressShipping: {
                provinceId: null,
                districtId: null,
                wardId: null,
                specificAddress: '',
            },
            recipientName: '',  // Số điện thoại người nhận hàng
            recipientPhoneNumber: '', // Tên ngươi nhận
            shippingFee: 0,
            vouchers: vouchersPublic
        };
        setItems([...items, newItem]);
        if(items.length === 0) {
            setCurrentBill(newKey);
        }
        setPdfUrl(null); // Clear the blob URL when creating a new bill
    };

    const findBestVoucher = (totalAmount) => {
        if (!vouchers || vouchers?.length === 0) return null;

        let bestVoucher = null;
        let maxDiscount = 0;
        let suggestions = [];

        // Lọc các voucher có thể áp dụng với đơn hàng hiện tại
        const applicableVouchers = vouchers.filter(voucher =>
            voucher.quantity > 0 && // Thêm điều kiện kiểm tra số lượng
            totalAmount >= (voucher.billMinValue || 0)
        );

        // Tìm voucher tốt nhất trong các voucher có thể áp dụng
        applicableVouchers.forEach(voucher => {
            const discount = voucher.discountType === "PERCENT"
                ? Math.min((totalAmount * voucher.discountValue) / 100, voucher.discountMaxValue || Infinity)
                : voucher.discountValue;

            if (discount > maxDiscount) {
                maxDiscount = discount;
                bestVoucher = voucher;
            }
        });

        // Tìm các voucher tiềm năng tốt hơn
        vouchers.forEach(voucher => {
            if (totalAmount < (voucher.billMinValue || 0)) {
                const amountNeeded = voucher.billMinValue - totalAmount;
                const potentialDiscount = voucher.discountType === "PERCENT"
                    ? Math.min((voucher.billMinValue * voucher.discountValue) / 100, voucher.discountMaxValue || Infinity)
                    : voucher.discountValue;

                // Chỉ đề xuất nếu voucher này có thể mang lại lợi ích tốt hơn
                if (potentialDiscount > maxDiscount) {
                    suggestions.push({
                        voucher: voucher,
                        amountNeeded: amountNeeded,
                        potentialDiscount: potentialDiscount,
                        additionalBenefit: potentialDiscount - maxDiscount
                    });
                }
            }
        });

        // Sắp xếp đề xuất theo lợi ích bổ sung (từ cao xuống thấp)
        suggestions.sort((a, b) => b.additionalBenefit - a.additionalBenefit);

        // Chỉ giữ lại 3 đề xuất tốt nhất
        suggestions = suggestions.slice(0, 3);

        return {
            bestVoucher: bestVoucher,
            currentDiscount: maxDiscount,
            suggestions: suggestions.map(s => ({
                voucherName: s.voucher.voucherName,
                amountNeeded: s.amountNeeded,
                additionalBenefit: s.additionalBenefit
            }))
        };
    };

    const updateProductList = (currentBill, product, quantityChange, isRestore = false, isDeleteProduct = false) => {
        setItems(prevItems =>
            prevItems.map(item => {
                if (item.key === currentBill) {
                    // Tìm sản phẩm theo id và price
                    const existingProduct = item.productList.find(p => p.id === product.id && p.price === product.price);
                    let updatedProductList;

                    if (existingProduct) {
                        if (isDeleteProduct) {
                            // Nếu xóa sản phẩm, loại bỏ sản phẩm có id và price khớp
                            updatedProductList = item.productList.filter(p => !(p.id === product.id && p.price === product.price));
                        } else {
                            if (product.price !== existingProduct.price) {
                                // Nếu giá thay đổi, tạo một bản sao mới với giá mới
                                updatedProductList = [
                                    ...item.productList.filter(p => !(p.id === product.id && p.price === existingProduct.price)),
                                    { ...existingProduct, quantityInCart: existingProduct.quantityInCart }, // Giữ sản phẩm cũ với giá cũ
                                    { ...product, quantityInCart: quantityChange, key: `${product.id}-${product.price}` } // Thêm sản phẩm mới với giá mới
                                ];
                            } else {
                                // Nếu giá không thay đổi, cập nhật số lượng
                                updatedProductList = item.productList.map(p =>
                                    p.id === product.id && p.price === product.price
                                        ? { ...p, quantityInCart: isRestore ? p.quantityInCart - quantityChange : p.quantityInCart + quantityChange }
                                        : p
                                );
                            }
                        }
                    } else {
                        // Nếu sản phẩm chưa có trong danh sách, thêm mới
                        updatedProductList = [...(item.productList || []), { ...product, quantityInCart: quantityChange, key: `${product.id}-${product.price}` }];
                    }

                    // Tính tổng tiền mới với giảm giá nếu có
                    const newTotalAmount = updatedProductList.reduce((total, p) => {
                        const hasPromotion = p.promotionResponse?.discountValue;
                        const discountValue = hasPromotion ? p.promotionResponse.discountValue : 0;
                        const effectivePrice = p.price * (1 - discountValue / 100);
                        return total + effectivePrice * (p.quantityInCart || 1);
                    }, 0);

                    // Tìm voucher tốt nhất dựa trên tổng tiền sau giảm giá
                    const voucherResult = findBestVoucher(newTotalAmount);
                    const discountAmount = voucherResult?.currentDiscount || 0;
                    const newTotalAfterDiscount = Math.max(0, newTotalAmount - discountAmount);

                    // Cập nhật selectedVouchers
                    setSelectedVouchers(prev => ({
                        ...prev,
                        [currentBill]: voucherResult
                    }));

                    // Tính tổng số lượng sản phẩm trong giỏ
                    const count = updatedProductList.reduce((total, p) => total + (p.quantityInCart || 0), 0);

                    let isFreeShip = false;
                    if(freeShipData != null) {
                        isFreeShip =  newTotalAmount >= freeShipData?.minOrderValue
                    }

                    return {
                        ...item,
                        label: (
                            <span>
                            {item.itemName} <Badge showZero={true} className={"mb-2"} count={count} />
                        </span>
                        ),
                        productList: updatedProductList,
                        isFreeShip: isFreeShip,
                        payInfo: {
                            ...item.payInfo,
                            amount: newTotalAfterDiscount,
                            discount: discountAmount,
                            change: ((item.payInfo?.cashCustomerMoney || 0) + (item.payInfo?.bankCustomerMoney || 0)) - newTotalAfterDiscount
                        }
                    };
                }
                return item;
            })
        );
    };


    const fetchProductDetailLatest = async (id) => {
        try {
            const response = await axiosInstance.get(`/api/admin/productdetail/${id}`);
            return response.data?.data || null; // Tránh lỗi khi dữ liệu null
        } catch (error) {
            console.error("Lỗi khi lấy thông tin sản phẩm:", error);
            return null;
        }
    };

    const handleQuantityChange = async (value, productBill) => {
        const product = await fetchProductDetailLatest(productBill.id);

        if (value < productBill.quantityInCart) {
            const soLuongRestore = productBill.quantityInCart - value;
            updateProductList(currentBill, productBill, soLuongRestore, true);
            handleOnChangeQuantityProduct(product, soLuongRestore, true);
            return;
        }

        if (value > product.quantity) {
            if((value  ) < product.quantity + productBill.quantityInCart) {
                const soLuongTru = value - productBill.quantityInCart;
                updateProductList(currentBill, product, soLuongTru);
                handleOnChangeQuantityProduct(product, soLuongTru, false);
                return
            }
            handleOnChangeQuantityProduct(product, product.quantity, false);
            updateProductList(currentBill, product, product.quantity);
            toast.warning(`Số lượng sản phẩm đạt tôi đa!`);
            return;
        }

        if (value > productBill.quantityInCart) {
            const soLuongTru = value - productBill.quantityInCart;
            updateProductList(currentBill, product, soLuongTru);
            handleOnChangeQuantityProduct(product, soLuongTru, false);
            return;
        }
    };


    const handleRemoveProduct = async (product) => {
        const restoreQuantityPayload = [
            {
                id: product.id,
                quantity: product.quantityInCart || 0,
                isRestoreQuantity: true
            }
        ]
        await axiosInstance.post('/api/admin/bill/restore-quantity', restoreQuantityPayload);
        updateProductList(currentBill, product, -product.quantityInCart, true, true);
    };

    const handleOnAddProductToBill = (record) => {
        console.log("record", record)
        if (!currentBill) {
            toast.warning("Vui lòng chọn hóa đơn trước khi thêm sản phẩm");
            return;
        }
        if (record.quantity <= 0) {
            toast.warning("Sản phẩm đã hết hàng");
            return;
        }
        if (record.status === "NGUNG_HOAT_DONG") {
            toast.warning("Sản phẩm đã ngừng bán hàng!");
            return;
        }
        handleOnChangeQuantityProduct(record,1, false)
        updateProductList(currentBill, record, 1);
    };



    const handleOnChangeQuantityProduct = async (product, quantity, isRestore) => {
        const restoreQuantityPayload = [
            {
                id: product.id,
                quantity: quantity,
                isRestoreQuantity : isRestore ?? true
            }
        ]
        await axiosInstance.post('/api/admin/bill/restore-quantity', restoreQuantityPayload);
    }

    const onCustomerSelect = async (customer) => {
        // Nếu customer là null (trường hợp xóa selection)

        if (!customer) {

            setItems((prevItems) =>
                prevItems.map((item) => {
                    if (item.key === currentBill) {
                        return {
                            ...item,
                            customerInfo: null,
                            customerAddresses: [],
                            recipientName: '',
                            recipientPhoneNumber: '',
                            addressShipping: null,
                            detailAddressShipping: {
                                provinceId: null,
                                districtId: null,
                                wardId: null,
                                specificAddress: ''
                            },
                            isNewShippingInfo: false,
                            feeShipping: 0,

                        };
                    }
                    return item;
                })
            );
            return;
        }


        // Trường hợp chọn khách hàng
        try {
            let customerAddresses = await Promise.all(
                (customer.addresses?.length > 0
                    ? [customer.addresses.find(addr => addr.isDefault) || customer.addresses[0]]
                    : []
                ).map(async (ca) => {
                    const addressString = await generateAddressString(
                        ca.provinceId,
                        ca.districtId,
                        ca.wardId,
                        ca.specificAddress
                    );
                    return {
                        value: ca.id,
                        label: addressString,
                        details: ca
                    };
                })
            );

            // Thêm option "Khác" vào cuối danh sách địa chỉ
            customerAddresses.push({
                value: "other",
                label: "Địa chỉ khác"
            });
            const  response = await axiosInstance.get(`/api/admin/bill/vouchers/${customer.id}`)
            const customerVouchers = response.data

            setItems((prevItems) =>
                prevItems.map((item) => {
                    if (item.key === currentBill) {
                        return {
                            ...item,
                            customerInfo: customer,
                            customerAddresses: customerAddresses,
                            recipientName: customer.fullName || '',
                            recipientPhoneNumber: customer.phoneNumber || '',
                            // Nếu khách hàng có địa chỉ, set địa chỉ đầu tiên làm mặc định
                            addressShipping: customer.addresses?.[0]?.id || null,
                            detailAddressShipping: customer.addresses?.[0] ? {
                                provinceId: customer.addresses[0].provinceId,
                                districtId: customer.addresses[0].districtId,
                                wardId: customer.addresses[0].wardId,
                                specificAddress: customer.addresses[0].specificAddress
                            } : {
                                provinceId: null,
                                districtId: null,
                                wardId: null,
                                specificAddress: ''
                            },
                            isNewShippingInfo: false,
                            vouchers: customerVouchers
                        };
                    }
                    return item;
                })
            );
        } catch (error) {
            console.error("Lỗi khi xử lý địa chỉ khách hàng:", error);
            // Có thể thêm thông báo lỗi cho người dùng ở đây
            toast.error("Có lỗi xảy ra khi tải thông tin địa chỉ khách hàng");
        }
    };

    const showAllCustomerAddresses = async (customer) => {
        console.log("showAllCustomerAddresses")
        if (!customer || !customer.addresses?.length) {
            return [];
        }

        try {
            let customerAddresses = await Promise.all(
                customer.addresses.map(async (ca) => {
                    const addressString = await generateAddressString(
                        ca.provinceId,
                        ca.districtId,
                        ca.wardId,
                        ca.specificAddress
                    );
                    return {
                        value: ca.id,
                        label: addressString,
                        details: ca
                    };
                })
            );

            // Thêm option "Khác" vào cuối danh sách địa chỉ
            customerAddresses.push({
                value: "other",
                label: "Địa chỉ khác"
            });

            setItems((prevItems) =>
                prevItems.map((item) => {
                    if (item.key === currentBill) {
                        return {
                            ...item,
                            customerInfo: customer,
                            customerAddresses: customerAddresses,
                            recipientName: customer.fullName || '',
                            recipientPhoneNumber: customer.phoneNumber || '',
                            // Nếu khách hàng có địa chỉ, set địa chỉ đầu tiên làm mặc định
                            addressShipping: customer.addresses?.[0]?.id || null,
                            detailAddressShipping: customer.addresses?.[0] ? {
                                provinceId: customer.addresses[0].provinceId,
                                districtId: customer.addresses[0].districtId,
                                wardId: customer.addresses[0].wardId,
                                specificAddress: customer.addresses[0].specificAddress
                            } : {
                                provinceId: null,
                                districtId: null,
                                wardId: null,
                                specificAddress: ''
                            },
                            isNewShippingInfo: false
                        };
                    }
                    return item;
                })
            );
        } catch (error) {
            console.error("Lỗi khi xử lý địa chỉ khách hàng:", error);
            message.error("Có lỗi xảy ra khi tải thông tin địa chỉ khách hàng");
            return [];
        }
    };


    // Hàm tính tổng tiền giỏ hàng
    const calculateTotalAmount = (bill) => {
        return bill.productList.reduce((total, product) => {
            const hasPromotion = product.promotionResponse?.discountValue;
            const discountValue = hasPromotion ? product.promotionResponse.discountValue : 0;
            const effectivePrice = product.price * (1 - discountValue / 100);
            return total + (effectivePrice * (product.quantityInCart || 1));
        }, 0);
    };
    const getAllVoucher = () => {
        axiosInstance.get(`${baseUrl}/api/admin/bill/vouchers`).then((res) => {
            setVouchers(res.data)
            console.log(res.data)
            setVouchersPublic(res.data)
            setItems(prevItems =>
                prevItems.map(item => {
                        return {
                            ...item,
                            vouchers: res.data
                        };

                })
            );

        })
    }


    const handleOnSelectedVoucher = (voucher) => {
        const originalTotal = calculateTotalAmount(items.find(item => item.key === currentBill));
        const voucherResult = findBestVoucher(originalTotal);

        setItems(prevItems =>
            prevItems.map(item => {
                if (item.key === currentBill) {
                    // Kiểm tra xem voucher hiện tại có phải voucher đã chọn không
                    if (selectedVouchers[currentBill]?.bestVoucher?.id === voucher.id) {
                        toast.warning("Voucher này đã được chọn!");
                        return item;
                    }

                    // Tính giá trị giảm giá dựa trên tổng số tiền gốc
                    const discountAmount = voucher.discountType === "PERCENT"
                        ? Math.min((originalTotal * voucher.discountValue) / 100, voucher.discountMaxValue || Infinity)
                        : voucher.discountValue;

                    // Tính số tiền mới sau khi áp dụng voucher
                    const newTotal = Math.max(0, originalTotal - discountAmount);
                    return {
                        ...item,
                        payInfo: {
                            ...item.payInfo,
                            amount: newTotal,
                            discount: discountAmount,
                            change: ((item.payInfo?.cashCustomerMoney || 0) + (item.payInfo?.bankCustomerMoney || 0)) - newTotal
                        }
                    };
                }
                return item;
            })
        );

        // Cập nhật voucher đã chọn cho hóa đơn hiện tại với đầy đủ thông tin
        setSelectedVouchers(prev => ({
            ...prev,
            [currentBill]: {
                bestVoucher: voucher,
                currentDiscount: voucher.discountType === "PERCENT"
                    ? Math.min((originalTotal * voucher.discountValue) / 100, voucher.discountMaxValue || Infinity)
                    : voucher.discountValue,
                suggestions: voucherResult.suggestions
            }
        }));
    };


    const handleCheckIsCOD = (e) => {
        const isChecked = e.target.checked;
        setItems(prevItems =>
            prevItems.map(item => {
                if (item.key === currentBill) {
                    return {
                        ...item,
                        isCOD: isChecked,
                        isShipping: true,
                        payInfo: {
                            ...item.payInfo,
                            customerMoney: 0,
                            cashCustomerMoney: 0,
                            bankCustomerMoney: 0,
                            change: 0
                        }
                    };
                }
                return item;
            })
        );
    }

    const handleCheckIsShipping = (e) => {
        const isChecked = e.target.checked;
        setItems(prevItems =>
            prevItems.map(item => {
                if (item.key === currentBill) {
                    return {
                        ...item,
                        isShipping: isChecked,
                        shippingFee: 0
                    };
                }
                return item;
            })
        );
    }


    const handleChangePaymentMethod = (value) => {
        setItems(prevItems =>
            prevItems.map(item => {
                if (item.key === currentBill) {

                    return {
                        ...item,
                        payInfo: {
                            ...item.payInfo,
                            paymentMethods: value,
                            customerMoney: 0,
                            cashCustomerMoney: 0,
                            bankCustomerMoney: 0,
                            change: 0
                        }
                    };
                }
                return item;
            })
        );
    }

    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);

    const handleOnPayment = async () => {
        const isConfirmed = await checkConfirmModal({
            title: "Xác nhận tạo hóa đơn",
            content: "Bạn có chắc chắn muốn tiếp tục ?",
            okText: "Đồng ý",
            cancelText: "Hủy",
        });

        if (!isConfirmed) return;

        const bill = items.find(item => item.key === currentBill);
        if (!bill) {
            toast.error("Không tìm thấy hóa đơn hiện tại.");
            return;
        }

        if (bill.isShipping) {
            const { provinceId, districtId, wardId, specificAddress } = bill.detailAddressShipping;
            const { recipientName, recipientPhoneNumber } = bill;

            if (!provinceId || !districtId || !wardId || !specificAddress) {
                toast.error("Vui lòng nhập đầy đủ thông tin địa chỉ giao hàng.");
                return;
            }

            if (recipientPhoneNumber) {
                const isValidPhone = /^0\d{9}$/.test(recipientPhoneNumber);
                if(!isValidPhone) {
                    toast.error("Số điện thoại không hợp lệ!")
                    return;
                }
            }

            if (!recipientName || !recipientPhoneNumber) {
                toast.error("Vui lòng nhập tên và số điện thoại người nhận.");
                return;
            }
        }

        try {
            const payload = {
                customerId: bill.customerInfo?.id || null,
                customerMoney: bill.payInfo?.customerMoney || 0,  // Tền khách đưa
                cashCustomerMoney: bill.payInfo?.cashCustomerMoney || 0, // Tiền mặt khách đưa
                bankCustomerMoney: bill.payInfo?.bankCustomerMoney || 0, // Tiền khách chuyển khoản
                isCashAndBank: !!(bill.payInfo?.cashCustomerMoney && bill.payInfo?.bankCustomerMoney),
                discountMoney: bill.payInfo?.discount || 0, // Số tiền được giảm
                shipMoney: bill.isShipping ? bill.shippingFee || 0 : 0,
                totalMoney: bill.payInfo?.amount || 0, // Tiền
                moneyAfter: (bill.payInfo?.amount || 0) - (bill.payInfo?.discount || 0),
                moneyBeforeDiscount: (bill.payInfo?.amount || 0) + (bill.payInfo?.discount || 0),
                completeDate: null,
                confirmDate: new Date().toISOString(),
                desiredDateOfReceipt: null,
                shipDate: null,
                shippingAddressId: bill.addressShipping?.id || bill.customerInfo?.addresses?.[0]?.id || null,
                numberPhone: bill.recipientPhoneNumber || bill.customerInfo?.phoneNumber || "",
                email: bill.customerInfo?.email || "",
                typeBill: "OFFLINE",
                notes: "",
                status: "DA_HOAN_THANH",
                voucherId: selectedVouchers[currentBill]?.bestVoucher?.id || null,
                isShipping: bill.isShipping || false,
                recipientName: bill.recipientName || "",
                recipientPhoneNumber: bill.recipientPhoneNumber || "",
                shippingFee: bill.shippingFee || 0,
                isCOD: bill.isCOD ?? false,
                transactionCode: bill.payInfo.transactionCode || "",
                isFreeShip: bill.isFreeShip,
                address: {
                    provinceId: bill.detailAddressShipping?.provinceId || null,
                    districtId: bill.detailAddressShipping?.districtId || null,
                    wardId: bill.detailAddressShipping?.wardId || null,
                    specificAddress: bill.detailAddressShipping?.specificAddress || "",
                },
                billDetailRequests: bill.productList.map(product => ({
                    price: product.price * (1 - (product.promotionResponse?.discountValue || 0) / 100),
                    productDetailId: product.id,
                    quantity: product.quantityInCart
                }))
            };

            const response = await axiosInstance.post(`/api/admin/bill/create`, payload);
            if (response.status === 200) {
                setItems(prevItems =>
                    prevItems.map(item => {
                        if (item.key === currentBill) {
                            return {
                                ...item,
                                isSuccess: true,
                                billCode: response.data?.billCode
                            };
                        }
                        return item;
                    })
                );
                toast.success("Tạo hóa đơn thành công!");
                getAllVoucher();
                // Show modal with options
                setIsPaymentModalVisible(true);
            } else {
                toast.error("Tạo hóa đơn thất bại!");
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi tạo hóa đơn.");
        }
    };

    const [pdfUrl, setPdfUrl] = useState(null);
    const printPluginInstance = printPlugin();
    const { print } = printPluginInstance;

    useEffect(() => {
        if (pdfUrl && isDocumentLoaded) {
            print();
        }
    }, [pdfUrl, isDocumentLoaded]);

    const handleOnPrintBill = async () => {
        // console.log("item, currentBill", items, currentBill)
        try {
            const id = items.find((item) => item.key === currentBill)?.billCode;

            if (!id) {
                toast.error("Không tìm thấy mã hóa đơn");
                return;
            }
            // Lấy dữ liệu PDF từ API với responseType là 'blob'
            const response = await axios.get(`http://localhost:8080/api/admin/bill/print-bill/${id}`, {
                responseType: 'blob'
            });

            // Tạo URL cho blob
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(blob);
            setPdfUrl(blobUrl)
            setIsDocumentLoaded(false)
        } catch (error) {
            console.error("Lỗi tải PDF:", error);
        }
    };

    const onAddressChange = async (selectedProvince, selectedDistrict, selectedWard, specificAddress) => {
        let totalFee = items.find((item) => item.key === currentBill).shippingFee ?? 0
        const isCurrentWard = !!items.find((item) => item.key === currentBill && item.detailAddressShipping.wardId === selectedWard);
        console.log("isCurrentWard", isCurrentWard); // true hoặc false
        if (selectedWard && !isCurrentWard) {
            const total =
                await calculateShippingFee({
                toWardCode: String(selectedWard),
                toDistrictId: selectedDistrict
            });
            console.log(total)
            totalFee = total
        }
        setItems((prevItems) =>
            prevItems.map((item) => {
                    if (item.key === currentBill) {
                        return {
                            ...item,
                            detailAddressShipping: {
                                provinceId: selectedProvince,
                                districtId: selectedDistrict,
                                wardId: selectedWard,
                                specificAddress: specificAddress ?? "",
                            },
                            shippingFee: totalFee
                        }
                    }
                    return item // Các mục khác giữ nguyên
                }
            )
        );
    }

    const onAddressSelected = async (e) => {
        const addressId = e.target.value
        let detailAddress = null;
        let feeShipping = 0;
        // tìm customer
        // lấy ra địa chỉ nè
        const customer = items.find((item) => item.key === currentBill)?.customerInfo
        if (customer && customer?.addresses) {
            const address = customer.addresses.find((ads) => ads.id === addressId)
            detailAddress = {
                provinceId: address?.provinceId,
                districtId: address?.districtId,
                wardId: address?.wardId,
                specificAddress: address?.specificAddress,
            }
        }

        if(detailAddress?.wardId && detailAddress?.districtId){
             feeShipping = await calculateShippingFee({
                toWardCode: String(detailAddress?.wardId),
                toDistrictId: Number(detailAddress?.districtId)
            })
        }

        setItems(prevItems =>
            prevItems.map(item => {
                if (item.key === currentBill) {
                    return {
                        ...item,
                        addressShipping: addressId,
                        isNewShippingInfo: addressId === "other",
                        detailAddressShipping: detailAddress,
                        shippingFee: feeShipping
                    };
                }
                return item;
            })
        );
    }

    const handleOnChangerRecipientPhoneNumber = (e) => {
        const value = e.target.value;
        const numericValue = value.replace(/\D/g, ""); // Chỉ giữ lại số

        setItems(prevItems =>
            prevItems.map(item => {
                if (item.key === currentBill) {
                    // Validate: phải bắt đầu bằng 0 và có đúng 10 chữ số
                    const isValidPhone = /^0\d{9}$/.test(numericValue);
                    const errorMsg = isValidPhone
                        ? ""
                        : "Số điện thoại không hợp lệ!";

                    return {
                        ...item,
                        recipientPhoneNumber: numericValue,
                        phoneError: errorMsg
                    };
                }
                return item;
            })
        );
    };


    const handleOnChangerRecipientName = (e) => {
        setItems(prevItems =>
            prevItems.map(item => {
                if (item.key === currentBill) {
                    return {
                        ...item,
                        recipientName: e.target.value
                    };
                }
                return item;
            })
        );
    }

    const handleOnChangeShippingFee = (e) => {
        setItems(prevItems =>
            prevItems.map(item => {
                if (item.key === currentBill) {
                    return {
                        ...item,
                        shippingFee: e.target.value
                    };
                }
                return item;
            })
        );
    }

    const  eventProductDetailChange = (value) => {
        setItems(prevItems =>
            prevItems.map(item => {
                // Kiểm tra trong từng hóa đơn
                const existingProductIndex = item.productList.findIndex(p => p.id === value.id);
                console.log("existingProductIndex", existingProductIndex)
                if (existingProductIndex !== -1) {
                    // Nếu sản phẩm đã tồn tại trong hóa đơn
                    const updatedProductList = [...item.productList];
                    updatedProductList[existingProductIndex] = {
                        ...value,
                        quantityInCart: item.productList[existingProductIndex].quantityInCart
                    };
                    toast.success("Sản phẩm vừa được cập nhật")
                    // Tính lại tổng tiền
                    const newTotalAmount = calculateTotalAmount({productList: updatedProductList});

                    // Tìm và áp dụng lại voucher nếu có
                    const bestVoucher = findBestVoucher(newTotalAmount);
                    const discountAmount = bestVoucher
                        ? bestVoucher.currentDiscount
                        : 0;

                    const newTotalAfterDiscount = Math.max(0, newTotalAmount - discountAmount);

                    return {
                        ...item,
                        productList: updatedProductList,
                        payInfo: {
                            ...item.payInfo,
                            amount: newTotalAfterDiscount,
                            discount: discountAmount,
                            change: ((item.payInfo?.cashCustomerMoney || 0) + (item.payInfo?.bankCustomerMoney || 0)) - newTotalAfterDiscount
                        }
                    };
                }
                return item;
            })
        );
    }


    // Hàm xóa sản phẩm trong giỏ hàng
    const resStoreQuantity = async (billRestore) => {
        const restoreQuantityPayload = billRestore.productList.map(product => ({
            id: product.id,
            quantity: product.quantityInCart || 0,
            isRestoreQuantity : true
        }));
        await axiosInstance.post('/api/admin/bill/restore-quantity', restoreQuantityPayload);
    }



    const restoreAllProducts = async (bills) => {
        try {
            for (const bill of bills) {
                if (!bill.isSuccess && bill.productList?.length > 0) {
                    const restoreQuantityPayload = bill.productList.map(product => ({
                        id: product.id,
                        quantity: product.quantityInCart || 0,
                        isRestoreQuantity: true
                    }));
                    await axiosInstance.post('/api/admin/bill/restore-quantity', restoreQuantityPayload);
                }
            }
        } catch (error) {
            console.error("Error while restoring products on unmount:", error);
        }
    };

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            const bills = itemsRef.current;
            const hasUnpaidBills = bills?.some(
                bill => !bill.isSuccess && bill.productList?.length > 0
            );

            if (hasUnpaidBills) {
                navigator.sendBeacon && restoreAllProductsWithBeacon();

                // Ngăn người dùng thoát khi còn bill chưa thanh toán
                event.preventDefault();
                event.returnValue = ''; // Kích hoạt popup xác nhận trên một số trình duyệt
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);



    const restoreAllProductsWithBeacon = () => {
        const bills = itemsRef.current;

        for (const bill of bills) {
            if (!bill.isSuccess && bill.productList?.length > 0) {
                const restoreQuantityPayload = bill.productList.map(product => ({
                    id: product.id,
                    quantity: product.quantityInCart || 0,
                    isRestoreQuantity: true
                }));

                const blob = new Blob([JSON.stringify(restoreQuantityPayload)], {
                    type: 'application/json'
                });

                navigator.sendBeacon(`${baseUrl}/api/bill/restore-quantity`, blob);
            }
        }
    };



    const handleCloseTab = async (targetKey) => {
        try {
            const closingBill = items.find(item => item.key === targetKey);

            if (!closingBill) return;

            if (!closingBill.isSuccess && closingBill.productList?.length > 0) {
                await resStoreQuantity(closingBill)
            }

            const updatedItems = items.filter(item => item.key !== targetKey);
            setItems(updatedItems);

            // Cập nhật currentBill sau khi xóa
            if (updatedItems.length > 0) {
                if(updatedItems.length > 1) {
                    setCurrentBill(updatedItems[(items.length - 2)].key);
                }else {
                    setCurrentBill(updatedItems[0].key);
                }
            } else {
                setCurrentBill(null); // Không còn hóa đơn nào
            }

        } catch (error) {
            console.error("Error when closing bill:", error);
            toast.error("Có lỗi xảy ra khi đóng hóa đơn");
        }
    };

    const resetCurrentBill = () => {
        const newKey = moment().format("HHmmssSSS");
        setItems(prevItems =>
            prevItems.map(item =>
                item.key === currentBill
                    ? {
                        ...item,
                        key: newKey,
                        itemName: ` Hóa đơn ${newKey}`,
                        label: (
                            <span>
                                Hóa đơn {newKey} <Badge showZero={true} className={"mb-2"} count={0} offset={[5, -5]}/>
                            </span>
                        ),
                        productList: [],
                        isSuccess: false,
                        canPayment: false,
                        customerInfo: null,
                        payInfo: {
                            paymentMethods: "cash",
                            discount: 0,
                            amount: 0,
                        },
                        closable: true,
                        billCode: null,
                        isShipping: false,
                        isNewShippingInfo: false,
                        shippingInfo: null,
                        customerAddresses: [],
                        addressShipping: null,
                        detailAddressShipping: {
                            provinceId: null,
                            districtId: null,
                            wardId: null,
                            specificAddress: '',
                        },
                        recipientName: '',
                        recipientPhoneNumber: '',
                        shippingFee: 0
                    }
                    : item
            )
        );
        setCurrentBill(newKey);
        setPdfUrl(null); // Clear the blob URL when creating a new bill
        requestAnimationFrame(() => window.scrollTo(0, 0));
    };

    return (
        <div className={"d-flex flex-column gap-3"}>

            <Modal
                open={open}
                width={"75%"}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <ProductDetailModal
                    handleOnAddProductToBill={handleOnAddProductToBill}
                    products={products}
                    setProducts={setProducts}
                />
            </Modal>
            <div className={"d-flex justify-content-between"}>
                <Button
                    type={"primary"}
                    onClick={handleOnCreateBill}>
                    Tạo hóa đơn
                </Button>

                {/*<Button*/}
                {/*    onClick={() => {*/}
                {/*        resetCurrentBill();*/}
                {/*        setIsPaymentModalVisible(false);*/}
                {/*    }}>*/}
                {/*    Hóa đơn mới*/}
                {/*</Button>*/}
            </div>

            <Card>
                <div className={"d-flex justify-content-between"}>
                    <h3>Danh sách hóa đơn</h3>

                    <div className={"d-flex gap-3"}>
                        <Button
                            type={"primary"}
                            onClick={() => setIsScanQr(true)}>
                            QR Code
                        </Button>

                        <Button
                            type={"primary"}
                            onClick={showModal}>
                            Thêm sản phẩm
                        </Button>
                        {!showApp? <Button
                            type={"primary"} 
                            onClick={()=>{
                                axiosInstance.post('/api/test-ws', true).then(res => {
                                    setShowApp(true)
                                })
                            }}>
                            Hiển thị app bật
                        </Button>: <Button
                            type={"primary"} 
                            onClick={()=>{
                                axiosInstance.post('/api/test-ws', false).then(res => {
                                    setShowApp(false)
                                })

                            }}>
                            Hiển thị app tắt
                            </Button>}
                       
                    </div>

                </div>
                <hr/>
                <Tabs
                    defaultActiveKey={defaultKey}
                    type="editable-card"
                    onEdit={onEditTab}
                    items={items}
                    onChange={(key) => setCurrentBill(key)}
                    className="custom-tabs"
                />
                <Table
                    dataSource={items.find(item => item.key === currentBill)?.productList || []}
                    columns={salesColumns(handleRemoveProduct, handleQuantityChange)}/>
            </Card>
            <CustomerSelect
                            customer={currentBillData?.customerInfo || null}
                            onCustomerSelect={onCustomerSelect}/>
            <div>
            </div>
            <SalePaymentInfo
                vouchers={currentBillData?.vouchers}
                handleOnSelectedVoucher={handleOnSelectedVoucher}
                amount={currentBillData?.payInfo?.amount || 0}
                isShipping={currentBillData?.isShipping || false}
                change={currentBillData?.payInfo?.change || 0}
                customerMoney={currentBillData?.payInfo?.customerMoney || 0}
                handleCustomerMoneyChange={handleCustomerMoneyChange}
                selectedVouchers={selectedVouchers[currentBill]}
                discount={currentBillData?.payInfo?.discount || 0}
                handleCheckIsShipping={handleCheckIsShipping}
                paymentMethods={currentBillData?.payInfo?.paymentMethods || "bank"}
                handleChangePaymentMethod={handleChangePaymentMethod}
                handleCashCustomerMoneyChange={handleCashCustomerMoneyChange}
                handleBankCustomerMoneyChange={handleBankCustomerMoneyChange}
                bankCustomerMoney={currentBillData?.payInfo?.bankCustomerMoney || 0}
                cashCustomerMoney={currentBillData?.payInfo?.cashCustomerMoney || 0}
                transactionCode={currentBillData?.payInfo?.transactionCode || null}
                handleOnPayment={handleOnPayment}
                isSuccess={currentBillData?.isSuccess}
                handleOnPrintBill={handleOnPrintBill}
                canPayment={currentBillData?.canPayment}
                addressShipping={currentBillData?.addressShipping}
                onAddressChange={onAddressChange}
                customerAddresses={currentBillData?.customerAddresses}
                onAddressSelected={onAddressSelected}
                recipientPhoneNumber={currentBillData?.recipientPhoneNumber}
                recipientName={currentBillData?.recipientName}
                isNewShippingInfo={currentBillData?.isNewShippingInfo}
                detailAddressShipping={currentBillData?.detailAddressShipping}
                customerInfo={currentBillData?.customerInfo}
                shippingFee={currentBillData?.shippingFee}
                isFreeShip={currentBillData?.isFreeShip}
                phoneError={currentBillData?.phoneError}
                handleOnChangeShippingFee={handleOnChangeShippingFee}
                handleOnChangerRecipientName={handleOnChangerRecipientName}
                handleOnChangerRecipientPhoneNumber={handleOnChangerRecipientPhoneNumber}
                currentBill={currentBill}
                isCOD={currentBillData?.isCOD}
                handleCheckIsCOD={handleCheckIsCOD}
                showAllCustomerAddresses={showAllCustomerAddresses}
                freeShipData={freeShipData}
            />
            {pdfUrl ?
                <div >
                    <Viewer fileUrl={pdfUrl} plugins={[printPluginInstance]}
                            onDocumentLoad={() => setIsDocumentLoaded(true)} // Khi tài liệu load xong
                    />
                </div>
                : <p></p>}

            <Modal
                visible={isPaymentModalVisible}
                title="Thanh toán thành công"
                footer={null}
                closable={false}
                maskClosable={false}
                style={{ borderRadius: '8px', overflow: 'hidden' }}
                bodyStyle={{ padding: '20px', textAlign: 'center' }}
            >
                <p style={{ fontSize: '16px', marginBottom: '20px' }}>Bạn muốn làm gì tiếp theo?</p>
                <Button type="primary" style={{ marginRight: '10px' }} onClick={() => {
                    handleOnPrintBill();
                }}>
                    In hóa đơn
                </Button>
                <Button onClick={() => {
                      resetCurrentBill();
                    setIsPaymentModalVisible(false);
                }}>
                    Hóa đơn mới
                </Button>
            </Modal>
            <ScanQrModalComponent
                isCameraOpen={isScanQr}
                setIsCameraOpen={setIsScanQr}
                handleOnAddProductToBill={handleOnAddProductToBill}
            />


        </div>
    );
};
export default SalesPage;
