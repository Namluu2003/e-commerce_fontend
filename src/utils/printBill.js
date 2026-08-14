import axios from 'axios';
import { toast } from 'react-toastify';

export const handleGetBlobUrlPrintBill = async (id) => {
    try {
        const response = await axios.get(`http://localhost:8080/api/admin/bill/print-bill/${id}`, {
            responseType: 'blob'
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        return blobUrl
    } catch (error) {
        console.error("Lỗi tải PDF:", error);
        return null;
    }
};