import axios from "axios";
import {baseUrl} from "../../../helpers/Helpers.js";

export  const printBillService = async (id) => {
    const response = await axios.get(`${baseUrl}/api/admin/bill/print-bill/${id}`, {
        responseType: 'application/pdf'
    });
    return response.data;
}
