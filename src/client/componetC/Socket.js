import { wsBaseUrl } from "../../helpers/Helpers.js";
import { useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";

export const useWebSocket = (sub, onMessageReceived) => {
  const stompClient = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10; // Giới hạn số lần thử kết nối lại

  // Hàm kết nối WebSocket
  const connectWS = useCallback(() => {
    if (stompClient.current && stompClient.current.connected) {
      console.warn("⚠️ WebSocket already connected.");
      return;
    }

    if (!sub) {
      console.error("❌ WebSocket Error: Subscription topic is required!");
      return;
    }

    const socket = new WebSocket(`${wsBaseUrl}/ws`);
    stompClient.current = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000, // Thử kết nối lại sau 5 giây nếu mất kết nối
      heartbeatIncoming: 4000, // Gửi heartbeat từ server về client mỗi 4 giây
      heartbeatOutgoing: 4000, // Gửi heartbeat từ client về server mỗi 4 giây
      onConnect: (frame) => {
        console.log("✅ WebSocket Connected in hook:", frame);
        reconnectAttempts.current = 0; // Reset số lần thử khi kết nối thành công

        // Đăng ký vào topic
        stompClient.current.subscribe(sub, (message) => {
          const newMsg = message.body;
          console.log(`📩 New Message from ${sub}:`, newMsg);
          if (onMessageReceived) {
            onMessageReceived(newMsg);
          }
        });
      },
      onStompError: (frame) => {
        console.error("❌ STOMP Error:", frame.headers["message"]);
      },
      onWebSocketClose: (event) => {
        console.warn("⚠️ WebSocket Closed:", event);
        if (reconnectAttempts.current < maxReconnectAttempts) {
          console.log(
            `🔄 Attempting to reconnect (${reconnectAttempts.current + 1}/${maxReconnectAttempts})...`
          );
          reconnectAttempts.current += 1;
        } else {
          console.error("❌ Max reconnect attempts reached. Giving up.");
        }
      },
      onWebSocketError: (error) => {
        console.error("❌ WebSocket Error:", error);
      },
      debug: (str) => console.log("🛠 WebSocket Debug:", str),
    });

    // Kích hoạt kết nối
    stompClient.current.activate();

    // Cleanup khi component unmount
    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [sub, onMessageReceived]); // Dependencies để useCallback hoạt động đúng

  // Hàm ngắt kết nối thủ công
  const disconnectWS = useCallback(() => {
    if (stompClient.current) {
      stompClient.current.deactivate();
      stompClient.current = null;
      console.log("❎ WebSocket Disconnected");
    }
  }, []);

  // Hàm kiểm tra trạng thái kết nối
  const isConnected = () => {
    return stompClient.current && stompClient.current.connected;
  };

  return { connectWS, disconnectWS, isConnected };
};