import Login from "../auth/auth/Login.jsx";
import Register from "../auth/auth/Register.jsx";
import ForgotPassword from "../auth/auth/ForgotPassword.jsx";
import LoginSuccess from "../auth/auth/LoginSuccess.jsx";
import ResetPassword from "../auth/auth/ResetPassword.jsx";
import LoginAdmin from "../auth/auth/LoginAdmin.jsx";
import ForgotPasswordAdmin from "../auth/auth/ForgotPasswordAdmin.jsx";
import PdfPrint from "../admin/PdfPrint.jsx";
import React from "react";
import ActiveAccount from "../auth/auth/ActiveAccount.jsx";
import ResetAdminPassword from "../auth/auth/ReseAdmintPassword.jsx";


const AuthRouters = {
    path: "/",
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "login-success",
        element: <LoginSuccess />,
      },      
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
      {
        path: "login-admin",
        element: <LoginAdmin />,
      },
      {
        path: "pdf-print",
        element: <PdfPrint  />,
      },
      {
        path: "forgot-password-admin",
        element: <ForgotPasswordAdmin />,
      },
      {
        path: "activate/:token",
        element: <ActiveAccount />,
      },

      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password/:token",
        element: <ResetPassword />,
      },
      {
        path: "reset-admin-password/:token",
        element: <ResetAdminPassword />,
      },

    ],
};

export default AuthRouters;