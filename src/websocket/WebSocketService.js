import {Client} from "@stomp/stompjs";
import SockJS from "sockjs-client";

const SOCKET_URL = "http://localhost:8080/ws";

class WebSocketService {
    constructor() {
        this.client = new Client({
            webSocketFactory: () => new SockJS(SOCKET_URL),
            onConnect: () => {
                console.log("Connected to WebSocket");
                this.client.subscribe("/topic/product-quantity", (message) => {
                    console.log("Received update:", message.body);
                    if (this.onMessageReceived) {
                        this.onMessageReceived(JSON.parse(message.body));
                    }
                });
            },
            onStompError: (frame) => {
                console.error("WebSocket Error: ", frame);
            },
        });

        this.client.activate();
    }

    sendUpdate(productId, newQuantity) {
        if (this.client.connected) {
            this.client.publish({
                destination: "/app/updateQuantity",
                body: JSON.stringify({productId, newQuantity}),
            });
        }
    }

    setOnMessageReceived(callback) {
        this.onMessageReceived = callback;
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;
