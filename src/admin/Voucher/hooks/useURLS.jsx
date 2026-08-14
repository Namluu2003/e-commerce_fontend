import { useMemo } from 'react';

const useUrlBuilders = (baseUrl, activeTab, pagination, searchParams) => {
    return useMemo(() => {
        let url = `${baseUrl}?page=${pagination.page}&size=${pagination.size}`;

        // Thêm tab (statusBill)
        // if (activeTab !== 'all') {
        //     url += `&statusBill=${activeTab}`;
        // }

        // Thêm tham số tìm kiếm
        const { search, voucherCode,discountValue,quantity,status, startDate, endDate } = searchParams;

        if (search) {
            url += `&search=${search}`;
        }
        if (voucherCode && voucherCode !== "null") {
            url += `&voucherCode=${voucherCode}`;
        }
        if (discountValue && discountValue !== "null") {
            url += `&discountValue=${discountValue}`;
        }
        if (quantity && quantity !== "null") {
            url += `&quantity=${quantity}`;
        }
        if (status && status !== "null") {
            url += `&status=${status}`;
        }
        if (startDate) {
            url += `&startDate=${startDate.format('DD-MM-YYYY')}`;
        }
        if (endDate) {
            url += `&endDate=${endDate.format('DD-MM-YYYY')}`;
        }

        return url;
    }, [baseUrl, activeTab, pagination.page, pagination.size, searchParams]);
};

export default useUrlBuilders;
