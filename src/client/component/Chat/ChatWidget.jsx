import React, { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import {
  Button,
  Input,
  List,
  Card,
  Space,
  Modal,
  Avatar,
  Typography,
  Flex,
  Badge,
} from "antd";
import { MessageOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import axios from "axios";
import { COLORS } from "../../../constants/constants";
import { apiRead } from "./apiChat";
import { toast } from "react-toastify";

const { Text } = Typography;

const ChatWidget = ({ customerId, staffId, senderType, anou }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({}); // Count riêng cho từng cuộc trò chuyện hoặc nhân viên
  const [totalUnread, setTotalUnread] = useState(0); // Count tổng
  const [user, setUser] = useState(localStorage.getItem("user"));

  const stompClient = useRef(null);
  const messagesRef = useRef(null);
  useEffect(() => {
    const handleCartChange = () => setIsChatOpen(true);
    window.addEventListener("openChat", handleCartChange);
    return () => window.removeEventListener("openChat", handleCartChange);
  }, []);
  // Lấy danh sách cuộc trò chuyện hoặc staff và khởi tạo unread counts
  useEffect(() => {
    if (conversationId != null && showMessages) return;
    fetchData();
  }, [isChatOpen, customerId, staffId, senderType, anou]);

  const fetchData = async () => {
    try {
      if (senderType === "STAFF") {
        const response = await axios.get(
          `http://localhost:8080/api/conversations/staff/${staffId}`
        );
        const convs = response.data;
        setConversations(convs);
        console.log("dsufdsufdsfusdudsf 3");

        // Khởi tạo unread counts từ backend hoặc tính từ tin nhắn SENT
        const counts = {};
        let total = 0;
        for (const conv of convs) {
          const msgResponse = await axios.get(
            `http://localhost:8080/api/messages/${conv.id}`
          );
          const sentCount = msgResponse.data.filter(
            (msg) => msg.status === "SENT" && msg.senderType !== senderType
          ).length;
          counts[conv.id] = sentCount;
          total += sentCount;
        }
        setUnreadCounts(counts);
        setTotalUnread(total);
        console.log("Danh sách cuộc trò chuyện của staff:", convs);
      } else {
        const response = await axios.get(
          "http://localhost:8080/api/conversations/staff"
        );
        const staff = response.data;
        setStaffList(staff);
        // Khởi tạo unread counts cho từng staff
        const counts = {};
        let total = 0;
        for (const s of staff) {
          const convResponse = await axios.post(
            "http://localhost:8080/api/conversations",
            { customerId, staffId: s.id }
          );
          const convId = convResponse.data.id;
          const msgResponse = await axios.get(
            `http://localhost:8080/api/messages/${convId}`
          );
          const sentCount = msgResponse.data.filter(
            (msg) => msg.status === "SENT" && msg.senderType !== senderType
          ).length;
          console.log("ádsdsadsadadad", msgResponse + "ấdsa" + sentCount);

          counts[s.id] = sentCount;
          total += sentCount;
        }
        setUnreadCounts(counts);
        setTotalUnread(total);
        console.log("Danh sách staff:", staff);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };
  // Kết nối WebSocket và xử lý tin nhắn
  useEffect(() => {
    if (!conversationId) return;
    if (showMessages && conversationId != null) {
      apiRead(conversationId);
    }
    // Lấy lịch sử tin nhắn
    axios
      .get(`http://localhost:8080/api/messages/${conversationId}`)
      .then((response) => {
        setMessages(response.data);
      })
      .catch((error) => console.error("Lỗi khi lấy tin nhắn:", error));

    // Kết nối WebSocket
    connectWS();

    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [
    conversationId,
    isChatOpen,
    showMessages,
    customerId,
    staffId,
    senderType,
  ]);

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);
  // connec
  const connectWS = () => {
    const socket = new WebSocket("ws://localhost:8080/ws");
    stompClient.current = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: (frame) => {
        console.log("✅ WebSocket Connected:", frame);
        stompClient.current.subscribe(
          `/topic/messages/${conversationId}`,
          (message) => {
            const newMsg = JSON.parse(message.body);
            setMessages((prevMessages) => [...prevMessages, newMsg]);
            // xem nếu ko phải ng gửi
            console.log("sdfsdfdsfsdfds", newMsg);
            // khi ở trong hộp thoại nawhsn tin thì xem luôn
            if (newMsg.senderType != senderType) {
              apiRead(newMsg.conversation.id);
            }
            // Cập nhật unread counts nếu tin nhắn từ người khác và status là SENT
            const currentUserId =
              senderType === "CUSTOMER" ? customerId : staffId;
            if (
              newMsg.senderId !== currentUserId &&
              newMsg.status === "SENT" &&
              (!isChatOpen ||
                (showMessages && conversationId !== newMsg.conversationId))
            ) {
              setUnreadCounts((prev) => {
                const newCounts = { ...prev };
                newCounts[conversationId] =
                  (newCounts[conversationId] || 0) + 1;
                return newCounts;
              });
              setTotalUnread((prev) => prev + 1);
            }
          }
        );
      },
      onStompError: (frame) =>
        console.error("❌ STOMP Error:", frame.headers["message"]),
      onWebSocketClose: (event) => console.warn("⚠️ WebSocket Closed:", event),
      debug: (str) => console.log("🛠 WebSocket Debug:", str),
    });

    stompClient.current.activate();
  };
  // Gửi tin nhắn
  const sendMessage = () => {
    if (
      newMessage.trim() &&
      stompClient.current &&
      stompClient.current.connected
    ) {
      const message = {
        conversationId,
        senderType: senderType,
        senderId: senderType === "CUSTOMER" ? customerId : staffId,
        content: newMessage,
        status: "SENT",
      };
      stompClient.current.publish({
        destination: `/app/message/${conversationId}`,
        body: JSON.stringify(message),
      });
      setNewMessage("");
    }
  };

  // Chọn cuộc trò chuyện
  const selectConversation = async (id) => {
    try {
      if (senderType === "STAFF") {
        setConversationId(id);
      } else {
        const response = await axios.post(
          "http://localhost:8080/api/conversations",
          {
            customerId,
            staffId: id,
          }
        );
        setConversationId(response.data.id);
      }
      setShowMessages(true);
      setMessages([]);
      // Reset count cho cuộc trò chuyện/nhân viên được chọn
      setUnreadCounts((prev) => {
        const newCounts = { ...prev };
        newCounts[id] = 0; // Reset count riêng
        return newCounts;
      });
      setTotalUnread((prev) => Math.max(0, prev - (unreadCounts[id] || 0))); // Cập nhật total
    } catch (error) {
      console.error("Lỗi khi chọn/tạo cuộc trò chuyện:", error);
    }
  };

  // Quay lại danh sách
  const goBackToList = () => {
    setShowMessages(false);
    setConversationId(null);
    setMessages([]);
  };

  return (
    <>
      {/* Hình tròn ở góc phải bên dưới với total unread */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          backgroundColor: `${COLORS.primary}`,
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          zIndex: 1000,
        }}
        onClick={() =>{
          if(user){
          setIsChatOpen(true)
          }else{
            toast.warn("Vui lòng đăng nhập để sử dụng chức năng chat")
          } }}
      >
        <Badge count={totalUnread}>
          <MessageOutlined style={{ color: "white", fontSize: "24px" }} />
        </Badge>
      </div>

      {/* Modal */}
      <Modal
        // height={550}
        width={400}
        title={
          showMessages ? (
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={goBackToList}
                style={{ marginRight: "10px" }}
              />
              Hỗ Trợ Khách Hàng
            </Space>
          ) : senderType === "STAFF" ? (
            "Danh Sách Cuộc Trò Chuyện"
          ) : (
            "Danh Sách Nhân Viên Hỗ Trợ"
          )
        }
        open={isChatOpen}
        onCancel={() => {
          setIsChatOpen(false);
          setShowMessages(false);
          setConversationId(null);
          setMessages([]);
        }}
        footer={null}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          top: "auto",
          left: "auto",
          width: "400px",
        }}
        styles={{
          body: { padding: "10px", maxHeight: "400px", overflowY: "auto" },
        }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          {/* Hiển thị danh sách cuộc trò chuyện hoặc staff với count riêng */}
          {!showMessages && (
            <List
              dataSource={senderType === "STAFF" ? conversations : staffList}
              renderItem={(item) => (
                <List.Item
                  onClick={() =>
                    selectConversation(
                      senderType === "STAFF" ? item.id : item.id
                    )
                  }
                  style={{
                    cursor: "pointer",
                    padding: "10px",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <Space>
                    <Avatar>
                      {senderType === "STAFF"
                        ? item.customer?.fullName?.charAt(0)
                        : item.fullName?.charAt(0) || "U"}
                    </Avatar>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {item.isOnline  ? (
                        <div style={{padding: "5px", borderRadius: "50%",fontSize: "20px",backgroundColor: "green", marginRight: "5px" }} />
                      ) : (
                        <div style={{padding: "5px", borderRadius: "50%",fontSize: "20px",backgroundColor: "red", marginRight: "5px" }} />
                      )}
                    <div>
                    <Text strong>
                        {senderType === "STAFF"
                          ? item.customer?.fullName
                          : item.fullName || "Nhân viên"}
                      </Text>
                      <br />
                      {senderType === "STAFF" && (
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {item?.lastMessage?.senderType === senderType
                            ? "tôi:  "
                            : ""}
                          {item?.lastMessage?.lastMesage || "Chưa có tin nhắn"}
                        </Text>
                      )}
                    </div>
                    </div>
                    {(unreadCounts[item.id] || 0) > 0 && (
                      <Badge
                        count={unreadCounts[item.id]}
                        style={{ marginLeft: "10px" }}
                      />
                    )}
                  </Space>
                </List.Item>
              )}
            />
          )}

          {/* Hiển thị danh sách tin nhắn */}
          {showMessages && (
            <>
              <div
                ref={messagesRef}
                style={{
                  flex: 1,
                  maxHeight: "300px",
                  overflowY: "auto",
                  padding: "10px",
                }}
              >
                <List
                  dataSource={messages}
                  renderItem={(msg) => (
                    <List.Item
                      style={{
                        display: "flex",
                        justifyContent:
                          msg.senderType === senderType
                            ? "flex-end"
                            : "flex-start",
                      }}
                    >
                      <Card
                        style={{
                          maxWidth: "70%",
                          backgroundColor:
                            msg.senderType === senderType
                              ? `${COLORS.backgroundcolor2}`
                              : "#f5f5f5",
                          borderRadius: "10px",
                        }}
                      >
                        <p style={{ margin: 0 }}>{msg.content}</p>
                        <span style={{ fontSize: "12px", color: "#888" }}>
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </span>
                      </Card>
                    </List.Item>
                  )}
                />
              </div>

              {/* Ô nhập tin nhắn */}
              <Flex gap={10} style={{ marginTop: "10px", width: "100%" }}>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nhập tin nhắn của bạn"
                  onPressEnter={sendMessage}
                  
                  style={{ width: "100%" }}
                />
                <Button type="primary" onClick={sendMessage}>
                  Gửi
                </Button>
              </Flex>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ChatWidget;
