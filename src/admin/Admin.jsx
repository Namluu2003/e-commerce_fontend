import {
  Button,
  Layout,
  theme,
  Card,
  Input,
  Avatar,
  Popover,
  List,
  Modal,
  Form,
} from "antd";

// import MenuList from "../component/sidebar/MenuList";
import React, { useEffect, useState } from "react";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { Content } from "antd/es/layout/layout";
import MenuList from "./dashboard/MenuList.jsx";
import BillList from "./bill/BillList.jsx";
import img from "./../../public/img/thehands.png";
import { COLORS } from "../constants/constants.js";
import ChatWidget from "../client/component/Chat/ChatWidget.jsx";
import { useWebSocket } from "../client/componetC/Socket.js";
import { toast } from "react-toastify";
import axios from "axios";
import axiosInstance from "../utils/axiosInstance.js";

const { Header, Sider } = Layout;

function Admin() {
  const [darkTheme, setDarkTheme] = useState(false);
  const [collapse, setCollapse] = useState(false);
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user"))
  );
  console.log("dây la use nè ", user);

  const toggleTheme = () => {
    setDarkTheme(!darkTheme);
  };
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const navigate = useNavigate();

  useEffect(() => {
    const handleUserChange = () => {
      setUser(JSON.parse(localStorage.getItem("user")));
    };
    window.addEventListener("storage", handleUserChange);
    return () => {
      window.removeEventListener("storage", handleUserChange);
    };
  }, []);

  const handleLogout = async () => {
    await axiosInstance.get("/api/admin/staff/logout-status/" + `${user.id}`);
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login-admin");
  };
  const [messages, setMessages] = useState([]);

  // Hàm xử lý tin nhắn từ WebSocket
  const handleNewMessage = (newMsg) => {
    console.log("📨 Nhận tin nhắn bên ngoài:", newMsg);
    setMessages((prev) => [...prev, newMsg]);
  };
  const { connectWS, disconnectWS } = useWebSocket(
    "/topic/anou",
    handleNewMessage
  );

  useEffect(() => {
    connectWS(); // Kết nối WebSocket khi component mount

    return () => {
      disconnectWS(); // Ngắt kết nối khi component unmount
    };
  }, []);

  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [form] = Form.useForm();

  const handleChangePassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      const res = await axiosInstance.put("/api/admin/auth/change-password", {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      if (res.status === 200) {
        toast.success("Đổi mật khẩu thành công");
        setOpenChangePassword(false);
        form.resetFields();
      } else {
        const data = await res.json();
        toast.error(data.message || "Đổi mật khẩu thất bại");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi kết nối máy chủ");
    }
  };

  useEffect(() => {
    // const interval = setInterval(async () => {
    //     console.log("jheolele")
    //     await axiosInstance.put('/api/admin/staff/ping');
    // }, 10000); // Ping mỗi 10s
    // return () => clearInterval(interval);
    handleLoginStatus();
    return () => {
      handleLogoutStatus();
    };
  }, []);

  const handleLoginStatus = async () => {
    await axiosInstance.get("/api/admin/staff/login-status/" + `${user.id}`);
  };
  const handleLogoutStatus = async () => {
    await axiosInstance.get("/api/admin/staff/logout-status/" + `${user.id}`);
  };

  const isValidUrl = (url) => {
    if (!url) return false;

    // Check if the URL is a string and has a minimum length
    if (typeof url !== 'string' || url.length < 5) return false;

    // Simple check if it starts with http:// or https:// or data:
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:');
  };

  // Generate avatar initials from name
  const getInitials = (name) => {
    if (!name) return '?';

    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length-1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <Layout>
      <Sider
        width={230}
        collapsed={collapse}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'sticky',
          insetInlineStart: 0,
          top: 0,
          bottom: 0,
          scrollbarWidth: 'thin',
          scrollbarGutter: 'stable',
        }}
        collapsible
        trigger={null}
        theme={darkTheme ? "dark" : "light"}
        className="sidebar min-vh-100"
      >
        <div className={"d-flex justify-content-center mt-5"}>
          <img
            width={collapse ? 50 : 200}
            src={img}
            alt=""
            style={{
              transition: "width 0.3s ease",
              objectFit: "contain",
            }}
          />
        </div>
        <MenuList darkTheme={darkTheme} />
        {/*<ToggleThemeButton darkTheme={darkTheme} toggleTheme={toggleTheme} />*/}
      </Sider>
      <Layout>
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            width: '100%',
            padding: "0 10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#fff",
            boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Button
            type="text"
            className="toggle"
            onClick={() => setCollapse(!collapse)}
            icon={collapse ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          />

          <div style={{ display: "flex", alignItems: "center" }}>
            {user ? (
              <>
                <div
                  style={{
                    textAlign: "right",

                    lineHeight: "1.5",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "16px",
                      display: "block",
                    }}
                  >
                    {user.fullName}
                  </span>
                  <span style={{ color: "#888", fontSize: "14px" }}>
                    {user.role === "ROLE_ADMIN"
                      ? "Chủ cửa hàng"
                      : user.role === "ROLE_MANAGER"
                      ? "Quản lý"
                      : user.role === "ROLE_STAFF_SALE"
                      ? "Nhân viên bán hàng"
                      : "Nhân viên"}
                  </span>
                </div>
                <Popover
                  content={
                    <List>
                      <Modal
                        title="Đổi mật khẩu"
                        open={openChangePassword}
                        onCancel={() => setOpenChangePassword(false)}
                        onOk={() => form.submit()}
                        okText="Xác nhận"
                        cancelText="Hủy"
                      >
                        <Form
                          layout="vertical"
                          form={form}
                          onFinish={handleChangePassword}
                        >
                          <Form.Item
                            label="Mật khẩu hiện tại"
                            name="oldPassword"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập mật khẩu hiện tại",
                              },
                            ]}
                          >
                            <Input.Password />
                          </Form.Item>
                          <Form.Item
                            label="Mật khẩu mới"
                            name="newPassword"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập mật khẩu mới",
                              },
                            ]}
                          >
                            <Input.Password />
                          </Form.Item>
                          <Form.Item
                            label="Xác nhận mật khẩu mới"
                            name="confirmPassword"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng xác nhận mật khẩu",
                              },
                            ]}
                          >
                            <Input.Password />
                          </Form.Item>
                        </Form>
                      </Modal>

                      <List.Item
                        onClick={() => setOpenChangePassword(true)}
                        style={{ cursor: "pointer" }}
                      >
                        Đổi mật khẩu
                      </List.Item>
                      <List.Item
                        onClick={handleLogout}
                        style={{ cursor: "pointer" }}
                      >
                        Đăng xuất
                      </List.Item>
                    </List>
                  }
                  trigger="click"
                >
                  {/*<Avatar*/}
                  {/*  size={40}*/}
                  {/*  src={*/}
                  {/*    user.avatar ??*/}
                  {/*    "https://t4.ftcdn.net/jpg/02/27/45/09/360_F_227450952_KQCMShHPOPebUXklULsKsROk5AvN6H1H.jpg"*/}
                  {/*  }*/}
                  {/*  style={{ cursor: "pointer" }}*/}
                  {/*/>*/}

                  <Avatar
                      src={isValidUrl(user.avatar) ? user.avatar : null}
                      style={{
                        backgroundColor: !isValidUrl(user.avatar) ? '#1890ff' : 'transparent',
                        color: '#fff',
                        fontSize: '16px',
                        border: '1px solid #f0f0f0',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                      size={40}
                      alt={user.fullName}
                  >
                    {!isValidUrl(user.avatar) && getInitials(user.fullName)}
                  </Avatar>

                </Popover>
              </>
            ) : (
              <Link to="/login">
                <Button
                  type="primary"
                  style={{ backgroundColor: "#F37021", borderColor: "#F37021" }}
                >
                  Đăng nhập
                </Button>
              </Link>
            )}
          </div>
        </Header>
        <Content >
          <div style={{ padding: "20px" }}>
            <Outlet />
            <ChatWidget
              staffId={user?.id}
              senderType={"STAFF"}
              anou={messages}
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default Admin;
