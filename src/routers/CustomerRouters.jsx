
import { Navigate } from "react-router-dom";
import HomePage from "../client/page/home/HomePage.jsx";
import Client from "../client/Client.jsx";
import CartPage from "../client/page/cart/CartPage.jsx";
import ProductsPage from "../client/page/products/ProductsPage.jsx";
import Product from "../client/page/products/Product.jsx";
import PurchaseOrder from "../client/PurchaseOrder/PurchaseOrder.jsx";
import SearchBill from "../admin/searchbill/SearchBill.jsx";
import PhoneAuth from "../client/test/SendOtp.jsx";
import About from "../client/page/About/About.jsx";
import Chat from "../client/test/websocket/Chat.jsx";
import Trademark from "../admin/product/Trademark.jsx";
import VoucheList from "../admin/Voucher/VoucheList.jsx";
import PromotionList from "../admin/Voucher/PromotionList.jsx";
import ContactForm from "../admin/contact/ContactForm.jsx";
import CustomerProfile from "../admin/profile/CustomerProfile.jsx";
import ProductPolicyPage from "../admin/productpolicy/ProductPolicyPage.jsx";
import CustomerPolicyPage from "../admin/profile/CustomerPolicyPage.jsx";

import Login from "../auth/auth/Login.jsx";
import Register from "../auth/auth/Register.jsx";
import PayMent from "../client/page/cart/PayMent.jsx";
import { i } from "framer-motion/client";

// luồng bán hàng client
import ProductDetail from "../client/page/products/ProductDetail.jsx";
import { ProductProvider } from "../store/ProductContext.jsx";
import Success from "../client/page/cart/Success.jsx";
import Veritify from "../client/page/verityfy/Veritify.jsx";
import WarningVeritify from "../client/page/verityfy/WarnningVeritify.jsx";

// const getRole = () => {
//   const storedUserInfo = localStorage.getItem("userInfo");
//   if (storedUserInfo) {
//     const parsedUserInfo = JSON.parse(storedUserInfo);
//     return parsedUserInfo?.vaiTro || null;
//   }
//   return null;
// };

console.log(1);
import UserLogin from "../client/UserLogin.jsx";
import React from "react";
import {getRole} from "../helpers/Helpers.js";
import PdfPrint from "../admin/PdfPrint.jsx";
import ForgotPassword from "../auth/auth/ForgotPassword.jsx";




const RoleRedirect = ({ element, allowRole }) => {
  const role = getRole();
  console.log(role)
  if (role === "ROLE_ADMIN" || role === "ROLE_STAFF" || role === "ROLE_MANAGER") {
    return <Navigate to="/admin" replace />;
  }
  if(!allowRole) {
    return element;
  }
  if(allowRole && allowRole !== role) {
    return <Navigate to="/forbidden" replace/>;
  }
  return element;
};

const CustomerRouters = {
  path: "/",
  element: (
    <ProductProvider>
      <Client />
    </ProductProvider>
  ),
  children: [
    {
      index: true,
      element: <RoleRedirect element={<HomePage />} />,
    },
    {
      path: "cart",
      element: <RoleRedirect element={<CartPage />} />,
    },

    {
      path: "products/bestseller",
      element: <RoleRedirect element={<Product />} />,
    },
    {
      path: "payment",
      element: <RoleRedirect element={<PayMent />}  />,
    },
    {
      path: "products",
      element: <RoleRedirect element={<ProductsPage />} />,
    },
    // {
    //   path: "login",
    //   element: <Login />,
    // },
    {
      path: "admin/login",
      element: <RoleRedirect element={<ProductsPage />}  />,
    },
    // {
    //   path: "register",
    //   element: <RoleRedirect element={<Register />} />,
    // },

    {
      path: "admin/trademark",
      element: <RoleRedirect element={<Trademark />} />,
    },

    {
      path: "products/product-detail/:productId",
      element: <RoleRedirect element={<ProductDetail />} />,
    },
    {
      path: "success",
      element: <RoleRedirect element={<Success />} />,
    },
    {
      path: "test/auth-user",
      element: <RoleRedirect element={<UserLogin/>} allowRole={"CUSTOMER"} />,
    },
    {
      path: "contact",
      element: <RoleRedirect element={<ContactForm />} />,
    },
    {
      path: "profile",
      element: <RoleRedirect element={<CustomerProfile />} />,
    },
    {
      path: "productpolicypage",
      element: <RoleRedirect element={<ProductPolicyPage />} />,
    },
    {
      path: "customerpolicypage",
      element: <RoleRedirect element={<CustomerPolicyPage />} />,
    },
    {
      path: "purchaseorder",
      element: <RoleRedirect element={<PurchaseOrder />} />,
    },
    {
      path: "searchbill",
      element: <RoleRedirect element={<SearchBill />} />,
    },
    {
      path: "veritify",
      element: <RoleRedirect element={<Veritify />} />,
    },
    {
      path: "warn-veritify",
      element: <RoleRedirect element={<WarningVeritify />} />,
    },
    {
      path: "otp",
      element: <RoleRedirect element={<PhoneAuth />} />,
    },
    {
      path: "chat",
      element: <RoleRedirect element={<Chat />} />,
    },
    {
      path: "about",
      element: <RoleRedirect element={<About />} />,
    },

 
 

    // {
    //   path: "filter",
    //   element: <RoleRedirect element={<FilterProduct />} />,
    // },
    // {
    //   path: "detail/:id",
    //   element: <RoleRedirect element={<ProductDetail />} />,
    // },
    // {
    //   path: "payment",
    //   element: <RoleRedirect element={<PreCheckout />} />,
    // },
    // {
    //   path: "infor-order",
    //   element: <RoleRedirect element={<OrderConfirmation />} />,
    // },
    // {
    //   path: "invoice-lookup",
    //   element: <RoleRedirect element={<InvoiceLookup />} />,
    // },
    // {
    //   path: "about",
    //   element: <RoleRedirect element={<GioiThieu />} />,
    // },
    // {
    //   path: "failed-pay",
    //   element: <RoleRedirect element={<FailedPay />} />,
    // },
    // {
    //   path: "hanlde-result-payment",
    //   element: <RoleRedirect element={<HandlePayment />} />,
    // },
    // {
    //   path: "profile",
    //   element: <RoleRedirect element={<AccountInfo />} />,
    // },
  ],
};

export default CustomerRouters;
