import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Footer from "./component/Footer";
import HeaderNav from "./component/HeaderNav/HeaderNav.jsx";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { Client } from "@stomp/stompjs";
import ChatWidget from "./component/Chat/ChatWidget.jsx";
import { useWebSocket } from "./componetC/Socket.js";
import Nav from "./component/Nav/Nav.jsx";
import { ProductProvider } from "../store/ProductContext";
// import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user"))
  );
  const [messages, setMessages] = useState([]);
  const [messages1, setMessages1] = useState([]);

  // Hàm xử lý tin nhắn từ WebSocket
  const handleNewMessage = (newMsg) => {
    console.log("📨 Nhận tin nhắn bên ngoài:", newMsg);
    setMessages((prev) => [...prev, newMsg]);
  };
  // const handleNewMessage1 = (newMsg) => {
  //   console.log("📨 Nhận tin nhắn bên ngoài:", newMsg);
  //   setMessages((prev) => [...prev, newMsg]);
  // };
  const { connectWS, disconnectWS } = useWebSocket(
    "/topic/anou",
    handleNewMessage
  );
  // const { connectWS1, disconnectWS1 } = useWebSocket(
  //   `/topic/global-notifications/${user?.id}`,
  //   handleNewMessage1
  // );

  useEffect(() => {
    connectWS(); // Kết nối WebSocket khi component mount

    return () => {
      disconnectWS(); // Ngắt kết nối khi component unmount
    };
  }, []);

  return (
    <Layout style={{
      minHeight:"100px"
    }}>
    <Content
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backgroundColor: "white",
        }}
      >
        <HeaderNav />
      </Content>
      <Content>
        <div className="container">
          <Outlet />
          <ChatWidget
            customerId={user?.id}
            senderType={"CUSTOMER"}
            anou={messages}
          />
        </div>
      </Content>
      <Content style={{ backgroundColor: "white" }}>
        <Footer />
      </Content>
    </Layout>
  );
};

export default App;
