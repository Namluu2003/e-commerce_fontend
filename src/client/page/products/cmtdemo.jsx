import React, { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import {
  Input,
  Button,
  Card,
  Space,
  Typography,
  Avatar,
  Rate,
  Divider,
  Tooltip
} from "antd";
import { LikeOutlined, LikeFilled, CommentOutlined, SendOutlined, SmileOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const CommentSection = ({ id }) => {
  // State management
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));
  const [comments, setComments] = useState([]);
  const [productId, setProductId] = useState(id);
  const [customerId, setCustomerId] = useState(user?.id);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [replyingTo, setReplyingTo] = useState(null); // Track which comment is being replied to
  const [likes, setLikes] = useState({}); // Track likes by commentId
  const stompClient = useRef(null);
  const commentsRef = useRef(null);

  // Update productId when id prop changes
  useEffect(() => {
    setProductId(id);
  }, [id]);

  // Initialize data and websocket connection
  useEffect(() => {
    fetchComments();
    connectWebSocket();
    // Cleanup websocket on unmount
    return () => stompClient.current?.deactivate();
  }, [productId]);

  // Fetch comments from the server
  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:8080/comments/${productId}`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data = await response.json();
      setComments(data);
      
      // Initialize likes from localStorage or empty object
      const savedLikes = JSON.parse(localStorage.getItem(`product_${productId}_likes`)) || {};
      setLikes(savedLikes);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // Setup WebSocket connection for real-time updates
  const connectWebSocket = () => {
    const socket = new WebSocket("ws://localhost:8080/ws");
    stompClient.current = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        // Subscribe to comment updates for this product
        stompClient.current.subscribe(`/topic/comments/${productId}`, (message) => {
          const newComment = JSON.parse(message.body);
          setComments((prevComments) => [...prevComments, newComment]);
        });
      },
    });
    stompClient.current.activate();
  };

  // Check if the current user has already rated the product
  const hasRated = () => comments.some((item) => item.customerId === customerId && item.rate > 0);

  // Send a new comment or rating to the server
  const sendComment = (parentId = null) => {
    if ((comment.trim() || rating > 0) && stompClient.current?.connected) {
      const message = {
        customerId,
        comment: comment.trim(),
        rate: hasRated() ? 0 : rating,
        parentId: parentId // Add parent comment reference for replies
      };
      stompClient.current.publish({
        destination: `/app/comment/${productId}`,
        body: JSON.stringify(message),
      });
      setComment("");
      setRating(0);
      setReplyingTo(null); // Reset reply state
    }
  };

  // Toggle like for a comment
  const toggleLike = (commentId) => {
    if (!user?.id) return; // Only logged in users can like
    
    const newLikes = { ...likes };
    newLikes[commentId] = !newLikes[commentId];
    setLikes(newLikes);
    
    // Save to localStorage
    localStorage.setItem(`product_${productId}_likes`, JSON.stringify(newLikes));
  };

  // Check if current user is admin
  const isAdmin = user?.fullName?.toLowerCase() === "admin";
  
  // Organize comments and their replies
  const organizeComments = () => {
    // Clone and sort comments by date
    const sortedComments = [...comments].sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    );
    
    // Group comments by thread
    const commentThreads = {};
    
    // First, identify all root comments (customer initial comments)
    sortedComments.forEach(comment => {
      // If it's a root comment (no parentId) or it's the first comment in a thread
      if (!comment.parentId) {
        if (!commentThreads[comment.id]) {
          commentThreads[comment.id] = {
            rootComment: comment,
            replies: []
          };
        } else {
          commentThreads[comment.id].rootComment = comment;
        }
      } 
      // If it's a reply
      else {
        if (!commentThreads[comment.parentId]) {
          commentThreads[comment.parentId] = {
            rootComment: null,
            replies: [comment]
          };
        } else {
          commentThreads[comment.parentId].replies.push(comment);
        }
      }
    });
    
    // Filter out threads that don't have a root comment (should not happen in practice)
    return Object.values(commentThreads).filter(thread => thread.rootComment);
  };
  
  const commentThreads = organizeComments();
  
  // Calculate average rating
  const averageRating = comments.length 
    ? (comments.reduce((sum, c) => sum + (c.rate || 0), 0) / 
       (comments.filter(c => c.rate > 0).length || 1)).toFixed(1) 
    : 0;

  // Format time (e.g., "3 tuần")
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return `${diffMinutes} phút`;
      }
      return `${diffHours} giờ`;
    } else if (diffDays < 7) {
      return `${diffDays} ngày`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} tuần`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} tháng`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} năm`;
    }
  };

  return (
    <div style={{ padding: "20px", margin: "0 auto" }}>
      <div style={{ marginBottom: "20px" }}>
        <Space style={{ marginBottom: "10px" }}>
          <Title level={4}>Đánh giá trung bình:</Title>
          <Rate disabled value={parseFloat(averageRating)} />
          <Text strong>({averageRating})</Text>
        </Space>
      </div>

      {/* Main comments display area */}
      <div ref={commentsRef} style={{ maxHeight: "600px", overflowY: "auto", padding: "10px" }}>
        {commentThreads.map((thread, threadIndex) => (
          <div key={threadIndex} style={{ marginBottom: "20px", borderBottom: threadIndex < commentThreads.length - 1 ? "1px solid #f0f0f0" : "none" }}>
            {/* Customer original comment */}
            <div style={{ display: "flex", marginBottom: "8px" }}>
              {/* Avatar */}
              <Avatar 
                src={thread.rootComment.avatar || "/path/to/default-avatar.png"} 
                size={40} 
                style={{ marginRight: "10px" }}
              />
              
              {/* Comment content */}
              <div style={{ flex: 1 }}>
                {/* Comment bubble */}
                <div style={{ 
                  backgroundColor: "#f0f2f5", 
                  borderRadius: "18px", 
                  padding: "8px 12px",
                  display: "inline-block",
                  maxWidth: "100%"
                }}>
                  <Text strong style={{ display: "block", marginBottom: "4px" }}>
                    {thread.rootComment.fullName}
                  </Text>
                  {thread.rootComment.rate > 0 && (
                    <div style={{ marginBottom: "6px" }}>
                      <Rate disabled value={thread.rootComment.rate} style={{ fontSize: "14px" }} />
                    </div>
                  )}
                  <div>{thread.rootComment.comment}</div>
                </div>
                
                {/* Like and reply buttons */}
                <div style={{ marginTop: "4px", marginLeft: "12px" }}>
                  <Space size="middle">
                    <Text style={{ fontSize: "13px" }}>{formatTime(thread.rootComment.createdAt)}</Text>
                    <Button 
                      type="text" 
                      size="small"
                      icon={likes[thread.rootComment.id] ? <LikeFilled style={{ color: "#1677ff" }} /> : <LikeOutlined />}
                      onClick={() => toggleLike(thread.rootComment.id)}
                      style={{ padding: "0", height: "auto", fontSize: "13px" }}
                    >
                      Thích
                    </Button>
                    {user?.id && (
                      <Button 
                        type="text" 
                        size="small"
                        onClick={() => setReplyingTo(thread.rootComment.id)}
                        style={{ padding: "0", height: "auto", fontSize: "13px" }}
                      >
                        Phản hồi
                      </Button>
                    )}
                  </Space>
                </div>
              </div>
            </div>
            
            {/* Replies section */}
            {thread.replies.length > 0 && (
              <div style={{ marginLeft: "50px" }}>
                {thread.replies.map((reply, replyIndex) => {
                  const isAdminReply = reply.fullName?.toLowerCase() === "admin" || 
                                     reply.fullName?.toLowerCase() === "trả lời từ người bán";
                  
                  return (
                    <div key={replyIndex} style={{ 
                      display: "flex", 
                      marginBottom: "8px"
                    }}>
                      {/* Avatar */}
                      <Avatar 
                        style={{ 
                          backgroundColor: isAdminReply ? "#f56a00" : "#1890ff",
                          marginRight: "10px"
                        }}
                        size={32}
                      >
                        {isAdminReply ? "A" : reply.fullName?.[0]?.toUpperCase() || "U"}
                      </Avatar>
                      
                      {/* Reply content */}
                      <div style={{ flex: 1 }}>
                        {/* Comment bubble */}
                        <div style={{ 
                          backgroundColor: isAdminReply ? "#e6f7ff" : "#f0f2f5", 
                          borderRadius: "18px", 
                          padding: "8px 12px",
                          display: "inline-block",
                          borderLeft: isAdminReply ? "3px solid #1890ff" : "none",
                          maxWidth: "100%"
                        }}>
                          <Text strong style={{ display: "block", marginBottom: "4px" }}>
                            {isAdminReply ? "Trả lời từ người bán" : reply.fullName}
                          </Text>
                          <div>{reply.comment}</div>
                        </div>
                        
                        {/* Like and reply buttons */}
                        <div style={{ marginTop: "4px", marginLeft: "12px" }}>
                          <Space size="middle">
                            <Text style={{ fontSize: "13px" }}>{formatTime(reply.createdAt)}</Text>
                            <Button 
                              type="text" 
                              size="small"
                              icon={likes[reply.id] ? <LikeFilled style={{ color: "#1677ff" }} /> : <LikeOutlined />}
                              onClick={() => toggleLike(reply.id)}
                              style={{ padding: "0", height: "auto", fontSize: "13px" }}
                            >
                              Thích
                            </Button>
                            {user?.id && !isAdminReply && (
                              <Button 
                                type="text" 
                                size="small"
                                onClick={() => setReplyingTo(thread.rootComment.id)}
                                style={{ padding: "0", height: "auto", fontSize: "13px" }}
                              >
                                Phản hồi
                              </Button>
                            )}
                          </Space>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Reply input area - only shown when reply button is clicked */}
            {replyingTo === thread.rootComment.id && user?.id && (
              <div style={{ 
                display: "flex", 
                marginLeft: "50px", 
                marginTop: "8px",
                marginBottom: "16px"
              }}>
                <Avatar 
                  src={user.avatar || "/path/to/default-avatar.png"}
                  size={32} 
                  style={{ marginRight: "10px" }}
                />
                <div style={{ 
                  flex: 1,
                  display: "flex",
                  backgroundColor: "#f0f2f5",
                  borderRadius: "20px",
                  padding: "4px 12px",
                  alignItems: "center"
                }}>
                  <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={isAdmin ? "Trả lời khách hàng..." : "Viết phản hồi..."}
                    bordered={false}
                    style={{ flex: 1, backgroundColor: "transparent" }}
                    onPressEnter={() => sendComment(thread.rootComment.id)}
                  />
                  <Space>
                    <Tooltip title="Thêm biểu tượng cảm xúc">
                      <Button 
                        type="text" 
                        icon={<SmileOutlined />} 
                        style={{ border: "none" }}
                      />
                    </Tooltip>
                    <Button 
                      type="text" 
                      icon={<SendOutlined />} 
                      onClick={() => sendComment(thread.rootComment.id)}
                      disabled={!comment.trim()}
                      style={{ border: "none" }}
                    />
                  </Space>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New comment input area - only shown for logged-in users */}
      {user?.id && (
        <div style={{ 
          display: "flex", 
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
        }}>
          <Avatar 
            src={user.avatar || "/path/to/default-avatar.png"}
            size={40} 
            style={{ marginRight: "10px" }}
          />
          <div style={{ 
            flex: 1,
            display: "flex",
            backgroundColor: "#f0f2f5",
            borderRadius: "20px",
            padding: "8px 12px",
            alignItems: "center"
          }}>
            {!isAdmin && !hasRated() && (
              <Rate 
                value={rating} 
                onChange={setRating} 
                style={{ marginRight: "10px" }}
              />
            )}
            <Input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={isAdmin ? "Trả lời với tư cách người bán..." : "Viết bình luận..."}
              bordered={false}
              style={{ flex: 1, backgroundColor: "transparent" }}
              onPressEnter={() => sendComment()}
            />
            <Space>
              <Tooltip title="Thêm biểu tượng cảm xúc">
                <Button 
                  type="text" 
                  icon={<SmileOutlined />} 
                  style={{ border: "none" }}
                />
              </Tooltip>
              <Button 
                type="text" 
                icon={<SendOutlined />} 
                onClick={() => sendComment()}
                disabled={!comment.trim() && rating === 0}
                style={{ border: "none" }}
              />
            </Space>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;