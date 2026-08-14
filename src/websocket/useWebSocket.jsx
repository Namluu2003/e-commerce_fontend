import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const useWebSocket = () => {
    const [priceUpdate, setPriceUpdate] = useState(null);
    const [connected, setConnected] = useState(false);
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        const socket = new SockJS("http://localhost:8080/ws"); // Kết nối WebSocket server
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000, // Tự động reconnect sau 5s nếu mất kết nối
            onConnect: () => {
                console.log("Connected to WebSocket");
                setConnected(true);

                client.subscribe("/topic/price-update", (message) => {
                    try {
                        const data = JSON.parse(message.body);
                        console.log("Price Update:", data);
                        setPriceUpdate(data);
                    } catch (error) {
                        console.error("Error parsing message:", error);
                    }
                });
            },
            onDisconnect: () => {
                console.log("Disconnected from WebSocket");
                setConnected(false);
            },
            onStompError: (frame) => {
                console.error("Broker error:", frame.headers["message"]);
            }
        });

        client.activate();
        setStompClient(client);

        return () => {
            if (client && client.active) {
                client.deactivate();
            }
        };
    }, []);

    return { priceUpdate, connected };
};

export default useWebSocket;
