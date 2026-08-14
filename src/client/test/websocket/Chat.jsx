import React, { useEffect, useState, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState('');
  const [roomId, setRoomId] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null); // Để tự động cuộn xuống tin nhắn mới

  useEffect(() => {
    if (!roomId || !sender) return;

    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
    });

    client.onConnect = (frame) => {
      setIsConnected(true);
      console.log('Connected to room:', roomId);
      client.subscribe(`/room/${roomId}`, (msg) => {
        const messageData = JSON.parse(msg.body);
        console.log('Received:', messageData);
        setMessages((prev) => [...prev, messageData]);
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP Error:', frame);
      setIsConnected(false);
    };

    client.onWebSocketClose = (event) => {
      console.log('WebSocket Closed:', event);
      setIsConnected(false);
    };

    client.activate();
    setStompClient(client);

    return () => {
      if (client) client.deactivate();
    };
  }, [roomId, sender]); // Tái kết nối khi roomId hoặc sender thay đổi

  useEffect(() => {
    // Tự động cuộn xuống tin nhắn mới
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!stompClient || !stompClient.connected) {
      alert('Chưa kết nối tới server!');
      return;
    }
    if (!message || !sender || !roomId) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    const chatMessage = {
      sender: sender,
      content: message,
      roomId: roomId,
    };
    console.log('Sending:', chatMessage);
    stompClient.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(chatMessage),
    });
    setMessage('');
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="chat-container">
      <div className="status">
        Trạng thái: {isConnected ? 'Đã kết nối' : 'Đang kết nối...'}
      </div>
      <div className="input-group">
        <input
          type="text"
          placeholder="Tên của bạn (ví dụ: user1)"
          value={sender}
          onChange={(e) => setSender(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="ID Phòng (ví dụ: room1)"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="input-field"
        />
      </div>
      <div className="message-input">
        <input
          type="text"
          placeholder="Nhập tin nhắn"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          className="input-field message-field"
          disabled={!isConnected}
        />
        <button
          onClick={sendMessage}
          className="send-button"
          disabled={!isConnected}
        >
          Gửi
        </button>
      </div>
      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender === sender ? 'sent' : 'received'}`}
          >
            <span className="sender">{msg.sender}</span>
            <span className="content">{msg.content}</span>
            <span className="timestamp">{formatTimestamp(msg.timestamp)}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default Chat;