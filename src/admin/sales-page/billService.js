import axios from "axios";
import {baseUrl} from "../../helpers/Helpers.js";

export const postChangeQuantityProduct = async (products) => {
    return await axios.post(`${baseUrl}/api/admin/bill/change-product-quantity`, products);
}