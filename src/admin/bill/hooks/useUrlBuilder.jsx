import { useMemo } from 'react';

const useUrlBuilder = (baseUrl, activeTab, pagination, searchParams) => {
    return useMemo(() => {
        let url = `${baseUrl}?page=${pagination.page}&size=${pagination.size}`;

        // Thêm tab (statusBill)
        if (activeTab !== 'all') {
            url += `&statusBill=${activeTab}`;
        }

        // Thêm tham số tìm kiếm
        const { search, typeBill, startDate, endDate } = searchParams;

        if (search) {
            url += `&search=${search}`;
        }
        if (typeBill && typeBill !== "null") {
            url += `&typeBill=${typeBill}`;
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

export default useUrlBuilder;
