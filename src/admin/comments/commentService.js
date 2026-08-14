import { Client } from "@stomp/stompjs";

const API_BASE_URL = "http://localhost:8080/api/admin/comments";

// Hàm lấy tất cả comments
export const fetchAllComments = async (page = 0, size = 5, sortOrder = "desc") => {
    try {
        const response = await fetch(`${API_BASE_URL}/all?page=${page}&size=${size}&sortOrder=${sortOrder}`);
        if (!response.ok) {
            throw new Error(`Lỗi: ${response.status}`);
        }
        const result = await response.json();
        return {
        content: result.data.content || [],
        totalElements: result.data.totalElements || 0,
        totalPages: result.data.totalPages || 0,
        currentPage: result.data.number || 0,
        pageSize: result.data.size || size,
        }
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu bình luận:", error);
        throw error;
    }
};

// Hàm gửi phản hồi cho comment
export const submitReply = async (commentId, reply) => {
    try {
        const response = await fetch(`${API_BASE_URL}/reply`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                parentId: commentId,
                comment: reply
            }),
        });

        if (!response.ok) {
            throw new Error("Lỗi khi gửi phản hồi");
        }

        return await response.json();
    } catch (error) {
        console.error("Lỗi khi phản hồi:", error);
        throw error;
    }
};

// Hàm xóa comment
export const deleteComment = async (commentId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${commentId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error(`Lỗi API: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error("Lỗi khi xóa bình luận:", error);
        throw error;
    }
};

// Hàm kết nối WebSocket
export const connectWebSocket = (onMessage, onAdminReply) => {
    const socket = new WebSocket("ws://localhost:8080/ws");
    const client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,

        onConnect: () => {
            console.log("WebSocket connected!");
        
            // Nhận các sự kiện chung
            client.subscribe(`/topic/admin/noticomments`, (message) => {
                console.log("WebSocket message received:", message.body);
                onMessage();
            });

        },
        onDisconnect: () => {
            console.log("WebSocket disconnected!");
        },
        onError: (err) => {
            console.error("WebSocket error:", err);
        },
    });

    client.activate();
    return client;
};

// Hàm gửi thông báo qua WebSocket
export const publishWebSocketMessage = (client, destination, message) => {
    if (client && client.connected) {
        client.publish({
            destination,
            body: JSON.stringify(message),
        });
    }
}; 