import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const SOCKET_URL = "http://localhost:8080/ws"; // Đổi thành URL WebSocket của backend

const stompClient = new Client({
    webSocketFactory: () => new SockJS(SOCKET_URL),
    reconnectDelay: 5000, // Tự động reconnect
});

export const connectWebSocket = (onMessageReceived) => {
    stompClient.onConnect = () => {
        console.log("Connected to WebSocket");
        // Lắng nghe sự kiện cập nhật giá
        stompClient.subscribe("/topic/price-update", (message) => {
            console.log()
            const data = JSON.parse(message.body);
            onMessageReceived(data);
        });
    };

    stompClient.activate();
};

export const disconnectWebSocket = () => {
    if (stompClient) stompClient.deactivate();
};
