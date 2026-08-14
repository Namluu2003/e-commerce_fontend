// App.js
import "./App.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import ForbiddenPage from "./ForbiddenPage.jsx";
import AdminRouters from "./routers/AdminRouters.jsx";
import CustomerRouters from "./routers/CustomerRouters.jsx";
import AuthRouters from "./routers/AuthRouter.jsx";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ConfigProvider } from "antd";
import {GoogleOAuthProvider} from "@react-oauth/google"; // Import CSS của react-toastify
{
  /* <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet"></link> proppins */
}

const router = createBrowserRouter([
  AdminRouters,
  CustomerRouters,
  AuthRouters,
  {
    path: "/forbidden",
    element: <ForbiddenPage />,
  },
]);


const App = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_KEY; // Thay thế với client ID của bạn


    return (
    <>
      {/* ToastContainer được đặt ở đây */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />

      {/* RouterProvider để quản lý các route */}

      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#F37021",
            colorBorderBg: "#F37021",
            fontFamily: "Inter, sans-serif"
            // fontFamily: "'Gidole', sans-serif", // Áp dụng font Gidole cho toàn bộ ứng dụng
        },
        }}
      >
          <GoogleOAuthProvider clientId={clientId}>

        <RouterProvider router={router} />
          </GoogleOAuthProvider>
      </ConfigProvider>
    </>
  );
};

export default App;
