import React from "react";
import {Navigate} from "react-router-dom";
import Dashboard from "../admin/dashboard/Dashboard.jsx";

import VoucheList from "../admin/Voucher/VoucheList.jsx";
import PromotionList from "../admin/Voucher/PromotionList.jsx";
import DetailPromotion from "../admin/Voucher/DetailPromotion.jsx";
import UpdatePromotion from "../admin/Voucher/UpdatePromotion.jsx";
import AddPromotion from "../admin/Voucher/AddPromotion.jsx";
import AddVoucher from "../admin/Voucher/AddVoucher.jsx";
import UpdateVoucher from "../admin/Voucher/UpdateVoucher.jsx";
import DetailVoucher from "../admin/Voucher/DetailVoucher.jsx";
import Admin from "../admin/Admin.jsx";
import SalesPage from "../admin/sales-page/Sales-page.jsx";
import Statistical from "../admin/statistical/Statistical.jsx";
import Category from "../admin/product/Category.jsx";
import Staff from "../admin/staff/Staff.jsx";
import BillDetail from "../admin/bill/BillDetail.jsx";
import BillList from "../admin/bill/BillList.jsx";
import CustomerTest from "../customer/CustomerTest.jsx";
// router
import Brand from "../admin/product/Brand/Brand.jsx";
import Color from "../admin/product/Color/Color.jsx";
import Material from "../admin/product/Material/Material.jsx";
import Size from "../admin/product/Size/Size.jsx";
import Sole from "../admin/product/Sole/Sole.jsx";
import Type from "../admin/product/Type/Type.jsx";
import ProductDetail from "../admin/product/ProductDetail/ProductDetail.jsx";
import Product from "../admin/product/Product/Product.jsx";
import Gender from "../admin/product/Gender/Gender.jsx";
import GetProductDetail from "../admin/product/Product/GetProductDetail.jsx";
import AddComponet from "../admin/product/ProductDetail/AddComponent.jsx";
import Detail from "../admin/product/ProductDetail/Detail.jsx";

import AddCustomer from "../customer/AddCustomer.jsx";
import UpdateCustomer from "../customer/UpdateCustomer.jsx";
import AddStaff from "../admin/staff/AddStaff.jsx";
import EditStaff from "../admin/staff/EditStaff.jsx";
import AddProductDetail from "../admin/product/ProductDetail/AddProductDetail.jsx";
import {getRole} from "../helpers/Helpers.js";
import Comments from "../admin/comments/Comments.jsx";
import FreeShipSetting from "../admin/FreeShipSetting.jsx";
// import AddPromotion from "../admin/Voucher/AddPromotion.jsx";



const PrivateRoute = ({element, allowedRoles}) => {
    const role = getRole();
    console.log(role)
    if (["ROLE_ADMIN", "ROLE_STAFF", "ROLE_MANAGER"].includes(role)) {
        if (allowedRoles.includes(role)) {
            return element;
        }
        return <Navigate to="/forbidden" replace/>;
    }
    return <Navigate to="/forbidden" replace/>;
};

const RoleRedirect = () => {
    const role = getRole();
    console.log("Có chạy vào đây", role)
    if (role === "ROLE_ADMIN" || role === "ROLE_MANAGER") {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (role === "ROLE_STAFF") {
        return <Navigate to="/admin/sales-page" replace />;
    }

    return <Navigate to="/forbidden" replace />;
};


const AdminRouters = {
    path: "/admin",
    element: <PrivateRoute element={<Admin/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_STAFF"]}/>,
    children: [
        {
            index: true,
            element: <RoleRedirect />
        },
        {
            path: "dashboard",
            element: <PrivateRoute element={<Dashboard/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER"]}/>,
        },
        {
            path: "sales-page",
            element: <PrivateRoute element={<SalesPage/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "statistical",
            element: <PrivateRoute element={<Statistical/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "category",
            element: <PrivateRoute element={<Category/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "brand",
            element: <PrivateRoute element={<Brand/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "color",
            element: <PrivateRoute element={<Color/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "material",
            element: <PrivateRoute element={<Material/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "type",
            element: <PrivateRoute element={<Type/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "product",
            element: <PrivateRoute element={<Product/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "size",
            element: <PrivateRoute element={<Size/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "sole",
            element: <PrivateRoute element={<Sole/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "gender",
            element: <PrivateRoute element={<Gender/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "productdetail",
            element: <PrivateRoute element={<ProductDetail/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "product/productdetail",
            element: <PrivateRoute element={<ProductDetail/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "product/productdetail/:id",
            element: <PrivateRoute element={<Detail/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "product/get-product-detail/:id/:id",
            element: <PrivateRoute element={<Detail/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        
        {
            path: "product/get-product-detail/:id",
            element: <PrivateRoute element={<GetProductDetail/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "product/add",
            element: <PrivateRoute element={<AddComponet/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {

            element: <PrivateRoute element={<Dashboard/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {

            element: <PrivateRoute element={<Dashboard/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        }, {

            element: <PrivateRoute element={<Dashboard/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        }, {

            element: <PrivateRoute element={<Dashboard/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },

        // {
        //   index: true,
        //   element: <PrivateRoute element={<BillList />} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]} />,
        // },

        {
            path: "bill",
            element: <PrivateRoute element={<BillList/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "bill/bill-detail/:id",
            element: <PrivateRoute element={<BillDetail/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "vouchelist",
            element: <PrivateRoute element={<VoucheList/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "PromotionList",
            element: <PrivateRoute element={<PromotionList/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "promotion/add",
            element: <PrivateRoute element={<AddPromotion/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "promotion/update/:id",
            element: <PrivateRoute element={<UpdatePromotion/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "promotion/detail/:id",
            element: <PrivateRoute element={<DetailPromotion/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "voucher/add",
            element: <PrivateRoute element={<AddVoucher/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "voucher/update/:id",
            element: <PrivateRoute element={<UpdateVoucher/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "voucher/detail/:id",
            element: <PrivateRoute element={<DetailVoucher/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "staff",
            element: <PrivateRoute element={<Staff/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "customer",
            element: <PrivateRoute element={<CustomerTest/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "customer-create",
            element: <PrivateRoute element={<AddCustomer/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "customer-update/:id",
            element: <PrivateRoute element={<UpdateCustomer/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "add-staff",
            element: <PrivateRoute element={<AddStaff/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "edit-staff/:id",
            element: <PrivateRoute element={<EditStaff/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },

        {
            path: "comments",
            element: <PrivateRoute element={<Comments/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER","ROLE_STAFF"]}/>,
        },
        {
            path: "freeship-setting",
            element: <PrivateRoute element={<FreeShipSetting/>} allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER"]}/>,
        },
    

    ],
};

export default AdminRouters;
