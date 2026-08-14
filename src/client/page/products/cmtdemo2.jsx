import { baseUrl, wsBaseUrl } from "../../../helpers/Helpers.js";
import React, { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import {
  Input,
  Button,
  List,
  Card,
  Space,
  Typography,
  Avatar,
  Col,
  Row,
} from "antd";

const { Title } = Typography;

const CommentSection = ({ id }) => {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user"))
  );
  const [comments, setComments] = useState([]);
  const [productId, setProductId] = useState(id);
  const [customerId, setCustomerId] = useState(user?.id);
  const [comment, setComment] = useState("");
  const stompClient = useRef(null);
  const commentsRef = useRef(null);
  
  useEffect(() => {
    setProductId(id);
  }, [id]);
  
 useEffect(() => {
    connectWebSocket(); // Gọi hàm connectWebSocket để kết nối
    return () => {
        if (stompClient.current) {
            stompClient.current.deactivate(); // Đảm bảo đóng kết nối khi không sử dụng
        }
    };
}, [productId]);
  
  const fetchComments = async () => {
    try {
        const response = await fetch(`${baseUrl}/comments/${productId}`);
        if (!response.ok) throw new Error("Lỗi khi tải bình luận");

        const data = await response.json();
        console.log("Dữ liệu bình luận từ API:", data);

        setComments(data.map(comment => ({
            ...comment,
            replies: comment.replies || [], // Đảm bảo replies luôn là mảng
        })));
    } catch (error) {
        console.error("Lỗi khi lấy bình luận:", error);
    }
};

const connectWebSocket = () => {
  const socket = new WebSocket(`${wsBaseUrl}/ws`);
  stompClient.current = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    onConnect: (frame) => {
      console.log("✅ WebSocket Connected:", frame);
      stompClient.current.subscribe(`/topic/comments/${productId}`, (message) => {
        const newComment = JSON.parse(message.body);
        
        // Kiểm tra xem có phải là phản hồi hay không
        if (newComment.parentId) {
          // Nếu là phản hồi, tìm bình luận gốc và gắn vào
          setComments((prevComments) => {
            const parentIndex = prevComments.findIndex(
              (comment) => comment.id === newComment.parentId
            );
            
            if (parentIndex !== -1) {
              // Tạo bản sao của mảng comments
              const updatedComments = [...prevComments];
              // Thêm phản hồi vào bình luận gốc
              updatedComments[parentIndex] = {
                ...updatedComments[parentIndex],
                replies: [
                  ...(updatedComments[parentIndex].replies || []),
                  newComment
                ]
              };
              return updatedComments;
            }
            return prevComments;
          });
        } else {
          // Nếu là bình luận gốc, thêm vào bình luận mới
          setComments((prevComments) => [
            ...prevComments,
            { ...newComment, replies: [] }, // Tạo mới bình luận và khởi tạo mảng replies
          ]);
        }
      });
      
      // Thêm subscription riêng cho việc nhận phản hồi admin
      stompClient.current.subscribe(`/topic/admin-replies`, (message) => {
        const adminReply = JSON.parse(message.body);
        fetchComments(); // Gọi lại API để đảm bảo dữ liệu cập nhật đúng sau reload
    });
    
    },
    onStompError: (frame) => console.error("❌ STOMP Error:", frame.headers["message"]),
    onWebSocketClose: (event) => console.warn("⚠️ WebSocket Closed:", event),
    debug: (str) => console.log("🛠 WebSocket Debug:", str),
  });

  try {
    stompClient.current.activate();
  } catch (error) {
    console.error("❌ WebSocket Activation Error:", error);
  }
};

  useEffect(() => {
    // Scroll to the latest comment
    if (commentsRef.current) {
      commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
    }
  }, [comments]);

  const sendComment = () => {
    if (comment.trim() && stompClient.current && stompClient.current.connected) {
        const message = {
            customerId,
            comment,
            createdAt: new Date().toISOString(), // Lấy thời gian chuẩn UTC
        };

        stompClient.current.publish({
            destination: `/app/comment/${productId}`,
            body: JSON.stringify(message),
        });

        setComment(""); 
    } else {
        console.warn("Không thể gửi bình luận: STOMP client chưa kết nối");
    }
  };

  const formatTime = (timeString) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleString("vi-VN");
    } catch (error) {
      return timeString;
    }
  };

  return (
    <div style={{ padding: "20px", margin: "0 auto" }}>
      <Card style={{ marginTop: "20px" }}>
        <div
          ref={commentsRef}
          style={{ maxHeight: "300px", overflowY: "auto", padding: "10px" }}
        >
 <List
    dataSource={comments.filter(comment => comment.replies && comment.replies.length > 0)} // Only show comments with replies
    renderItem={(item) => (
        <List.Item>
            <List.Item.Meta
                title={
                    <Row>
                        <Col span={1}><Avatar src={user?.avatar || 'https://via.placeholder.com/40'} /></Col>
                        <Col span={23}>
                            <strong>{item.fullName}</strong>
                            <span style={{ color: "#888" }}> ({formatTime(item.createdAt)})</span>
                        </Col>
                        <Col span={24}>{item.comment}</Col>

                        {/* Hiển thị phản hồi của admin nếu có */}
                        {item.replies?.length > 0 && (
                            <Col span={24} style={{ paddingLeft: "20px", borderLeft: "2px solid #ddd", marginTop: "10px" }}>
                                {item.replies.map(reply => (
                                    <Row key={reply.id} style={{ marginBottom: "10px" }}>
                                        <Col span={1}><Avatar style={{ backgroundColor: "#ff4d4f" }}>A</Avatar></Col>
                                        <Col span={23}>
                                            <strong style={{ color: "#ff4d4f" }}>Admin</strong>
                                            <span style={{ color: "#888" }}> ({formatTime(reply.createdAt)})</span>
                                            <div>{reply.comment}</div>
                                        </Col>
                                    </Row>
                                ))}
                            </Col>
                        )}
                    </Row>
                }
            />
        </List.Item>
    )}
/>

          {user?.id && (
            <Space style={{ width: "100%" }}>
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Nội dung"
                maxLength={500}
                onPressEnter={sendComment}
                style={{
                  minWidth: "400px",
                }}
              />
              <Button type="primary" onClick={sendComment}>
                Bình luận
              </Button>
            </Space>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CommentSection;

import React, { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { Input, Button, List, Card, Space, Typography, Avatar, Col, Row, message, Select } from "antd";
import { Rate } from "antd";
import { EditOutlined, FilterOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

const CommentSection = ({ id }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));
  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [productId, setProductId] = useState(id);
  const [customerId, setCustomerId] = useState(user?.id);
  const [comment, setComment] = useState("");
  const stompClient = useRef(null);
  const commentsRef = useRef(null);
  const [hasCommented, setHasCommented] = useState(false);
  const [rate, setRate] = useState(5);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState("");
  const [editRate, setEditRate] = useState(5);
  const [starFilter, setStarFilter] = useState(0); // 0 means show all comments
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setProductId(id);
  }, [id]);

  useEffect(() => {
    fetchComments();
    connectWebSocket();
    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [productId]);

  useEffect(() => {
    // Filter comments when starFilter or comments change
    if (starFilter === 0) {
      setFilteredComments(comments);
    } else {
      setFilteredComments(comments.filter(comment => comment.rate === starFilter));
    }
  }, [starFilter, comments]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/admin/comments/all`);
      if (!response.ok) throw new Error(`Lỗi: ${response.status}`);

      const result = await response.json();
      const commentsData = result?.data || result || [];

      if (!Array.isArray(commentsData)) {
        console.error("API không trả về danh sách bình luận:", commentsData);
        message.error("Dữ liệu API không đúng định dạng!");
        return;
      }

      const formattedData = commentsData.map((item, index) => ({
        id: item.id || index + 1,
        fullName: item.fullName || "Khách hàng ẩn danh",
        comment: item.comment || "Không có bình luận",
        productId: item.productId || null,
        customerEmail: item.customerEmail || "Không có tài khoản",
        createdAt: item.createdAt || new Date().toISOString(),
        rate: item.rate || 5,
        replies: item.replies || []
      }));

      setComments(formattedData);
      setFilteredComments(formattedData);

      // Kiểm tra nếu user hiện tại đã bình luận sản phẩm này
      if (customerId) {
        const hasCommented = formattedData.some(comment => comment.customerEmail === user?.email);
        setHasCommented(hasCommented);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu bình luận:", error);
      message.error(`Không thể tải dữ liệu: ${error.message}`);
    }
  };

  const connectWebSocket = () => {
    const socket = new WebSocket(`${wsBaseUrl}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        // Subscribe to the comments topic
        client.subscribe(`/topic/comments/${productId}`, (message) => {
          const updatedComment = JSON.parse(message.body);
          console.log("Received updated comment:", updatedComment);  // Debug to check the data
        
          setComments((prevComments) =>
            prevComments.map((c) =>
              c.id === updatedComment.id ? { ...c, comment: updatedComment.comment, rate: updatedComment.rate } : c
            )
          );
        });
        
        // Subscribe to admin replies (if needed)
        client.subscribe(`/topic/admin-replies`, (message) => {
          const adminReply = JSON.parse(message.body);
          setComments((prevComments) =>
            prevComments.map((comment) =>
              comment.id === adminReply.parentId
                ? {
                  ...comment,
                  replies: comment.replies.some(reply => reply.id === adminReply.id)
                    ? comment.replies
                    : [...comment.replies, adminReply]
                }
                : comment
            )
          );
        });
        
        // Subscribe to new comments topic
        client.subscribe(`/topic/new-comments/${productId}`, (message) => {
          try {
            const newComment = JSON.parse(message.body);
            console.log("Received new comment:", newComment);
            
            if (isSubmitting) {
              message.success("Bình luận đã được gửi thành công!");
              setIsSubmitting(false);
              
              // Thêm bình luận mới vào danh sách
              const commentToAdd = {
                id: newComment.id || Date.now(),
                fullName: user?.fullName || "Khách hàng ẩn danh",
                comment: newComment.comment,
                productId: productId,
                customerEmail: user?.email || "anonymous@example.com",
                createdAt: newComment.createdAt || new Date().toISOString(),
                rate: newComment.rate,
                replies: []
              };
              
              setComments(prevComments => [...prevComments, commentToAdd]);
              setHasCommented(true);
            }
          } catch (error) {
            console.error("Lỗi khi xử lý bình luận mới:", error);
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
        message.error("Có lỗi kết nối với máy chủ bình luận!");
        if (isSubmitting) {
          setIsSubmitting(false);
        }
      }
    });

    client.activate();
    stompClient.current = client;
  };

  useEffect(() => {
    if (commentsRef.current) {
      commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
    }
  }, [filteredComments]);

  const sendComment = () => {
    if (!comment.trim()) {
      message.error("Vui lòng nhập nội dung bình luận!");
      return;
    }
    
    if (stompClient.current && stompClient.current.connected) {
      // Lưu trữ các giá trị hiện tại trước khi reset
      const commentText = comment;
      const rateValue = rate;
      const newCommentId = Date.now(); // Tạo ID tạm thời
      
      // Reset form ngay lập tức để tạo cảm giác phản hồi nhanh
      setComment("");
      setRate(5);
      setIsSubmitting(true);
      
      // Thêm comment mới vào state ngay lập tức để hiển thị
      const optimisticComment = {
        id: newCommentId,
        fullName: user?.fullName || "Khách hàng ẩn danh",
        comment: commentText,
        productId: productId,
        customerEmail: user?.email || "anonymous@example.com",
        createdAt: new Date().toISOString(),
        rate: rateValue,
        replies: [],
        isPending: true // Đánh dấu là đang chờ xác nhận từ server
      };
      
      setComments(prevComments => [...prevComments, optimisticComment]);
      setHasCommented(true);
      
      const commentMessage = {
        customerId,
        comment: commentText,
        rate: rateValue,
        createdAt: new Date().toISOString(),
      };
      
      try {
        stompClient.current.publish({
          destination: `/app/comment/${productId}`,
          body: JSON.stringify(commentMessage),
        });
        
        // Giảm timeout xuống và thêm logic cập nhật comment
        setTimeout(() => {
          if (isSubmitting) {
            setIsSubmitting(false);
            message.success("Bình luận đã được gửi thành công!"); 
            
            // Cập nhật trạng thái isPending nếu không nhận được phản hồi từ server
            setComments(prevComments => 
              prevComments.map(c => 
                c.id === newCommentId ? {...c, isPending: false} : c
              )
            );
          }
        }, 2000); // Giảm từ 5000ms xuống 2000ms
      } catch (error) {
        console.error("Lỗi khi gửi bình luận:", error);
        
        // Xóa comment optimistic nếu gặp lỗi
        setComments(prevComments => prevComments.filter(c => c.id !== newCommentId));
        setHasCommented(false);
        
        message.error("Không thể gửi bình luận: " + error.message);
        setIsSubmitting(false);
      }
    } else {
      console.warn("Không thể gửi bình luận: STOMP client chưa kết nối");
      message.error("Không thể kết nối đến máy chủ bình luận. Vui lòng thử lại sau.");
    }
  };
  const formatTime = (timeString) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleString("vi-VN");
    } catch (error) {
      return timeString;
    }
  };

  const averageRate = comments.length > 0
    ? (comments.reduce((sum, c) => sum + c.rate, 0) / comments.length).toFixed(1)
    : "0";

  const totalReviews = comments.length;

  // Tính số lượng bình luận theo từng mức đánh giá sao
  const starCounts = [0, 0, 0, 0, 0]; // [1 star, 2 stars, 3 stars, 4 stars, 5 stars]
  comments.forEach(comment => {
    if (comment.rate >= 1 && comment.rate <= 5) {
      starCounts[comment.rate - 1]++;
    }
  });

  const editComment = (comment) => {
    setEditingComment(comment.id);
    setEditText(comment.comment);
    setEditRate(comment.rate);
  };

  const saveEditedComment = () => {
    if (!editText.trim()) {
      message.error("Vui lòng nhập nội dung bình luận!");
      return;
    }
    
    if (stompClient.current && stompClient.current.connected) {
      const updatedComment = {
        customerId,
        comment: editText,
        rate: editRate,
        parentId: editingComment, // Send the ID of the comment being updated
      };
  
      // Log to ensure the data being sent is correct
      console.log("Sending updated comment:", updatedComment);
      
      try {
        stompClient.current.publish({
          destination: `/app/update-comment/${productId}`, // Send updated comment via WebSocket
          body: JSON.stringify(updatedComment),
        });
      
        // Update local state directly after sending the update
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === editingComment
              ? { ...comment, comment: editText, rate: editRate } // Update comment with new content
              : comment
          )
        );
      
        setEditingComment(null);
        setEditText("");
        setEditRate(5);
        message.success("Bình luận đã được cập nhật thành công!");
      } catch (error) {
        console.error("Lỗi khi cập nhật bình luận:", error);
        message.error("Không thể cập nhật bình luận: " + error.message);
      }
    } else {
      console.warn("Không thể gửi cập nhật: STOMP client chưa kết nối");
      message.error("Kết nối WebSocket không ổn định!");
    }
  };

  const handleFilterChange = (value) => {
    setStarFilter(Number(value));
  };

  // Tạo biểu tượng sao cho các tùy chọn trong combobox
  const renderStars = (count) => {
    const stars = [];
    for (let i = 0; i < count; i++) {
      stars.push(<span key={i} style={{ color: 'gold' }}>⭐</span>);
    }
    return stars;
  };
  
  return (
    <div style={{ padding: "20px", margin: "0 auto" }}>
      <Card style={{ marginTop: "20px" }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space direction="horizontal">
                <Title level={4}>Đánh giá trung bình: {averageRate}/5⭐</Title>
                <span>({totalReviews} đánh giá)</span>
              </Space>
            </Col>
            <Col>
              <Space>
                <FilterOutlined /> 
                <span>Lọc theo: </span>
                <Select 
                  defaultValue="0" 
                  style={{ width: 160 }} 
                  onChange={handleFilterChange}
                  dropdownMatchSelectWidth={false}
                >
                  <Option value="0">Tất cả ({totalReviews})</Option>
                  <Option value="5">
                    {renderStars(5)} ({starCounts[4]})
                  </Option>
                  <Option value="4">
                    {renderStars(4)} ({starCounts[3]})
                  </Option>
                  <Option value="3">
                    {renderStars(3)} ({starCounts[2]})
                  </Option>
                  <Option value="2">
                    {renderStars(2)} ({starCounts[1]})
                  </Option>
                  <Option value="1">
                    {renderStars(1)} ({starCounts[0]})
                  </Option>
                </Select>
              </Space>
            </Col>
          </Row>

          <div ref={commentsRef} style={{ maxHeight: "300px", overflowY: "auto", padding: "10px" }}>
            <List
              dataSource={filteredComments}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Row>
                        <Col span={1}><Avatar src={user?.avatar || 'https://via.placeholder.com/40'} /></Col>
                        <Col span={23}>
                          <strong>{item.fullName}</strong>
                          <span style={{ color: "#888" }}> ({formatTime(item.createdAt)})</span>
                          <span style={{ color: "gold", marginLeft: "10px" }}>
                            {renderStars(item.rate)}
                          </span>
                        </Col>
                      </Row>
                    }
                    description={
                      <>
                        {editingComment === item.id ? (
                          <Space direction="vertical" style={{ width: "100%", marginTop: "10px" }}>
                            <Rate value={editRate} onChange={setEditRate} />
                            <Input.TextArea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              maxLength={500}
                              rows={4}
                            />
                            <Space>
                              <Button type="primary" onClick={saveEditedComment}>Lưu</Button>
                              <Button onClick={() => setEditingComment(null)}>Hủy</Button>
                            </Space>
                          </Space>
                        ) : (
                          <p>{item.comment}</p>
                        )}
                      </>
                    }
                  />
                  {item.customerEmail === user?.email && (
                    <Button
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => editComment(item)}
                      style={{ float: "right" }}
                    />
                  )}
                </List.Item>
              )}
              locale={{ emptyText: starFilter === 0 ? "Chưa có đánh giá nào" : `Không có đánh giá ${starFilter} sao nào` }}
            />

            {user?.id && !hasCommented && (
              <Space direction="vertical" style={{ width: "100%", marginTop: "20px" }}>
                <Rate value={rate} onChange={setRate} />
                <Input.TextArea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Nhập bình luận..."
                  maxLength={500}
                  rows={3}
                  style={{ minWidth: "400px" }}
                />
                <Button 
                  type="primary" 
                  onClick={sendComment} 
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang gửi..." : "Bình luận"}
                </Button>
              </Space>
            )}

            {hasCommented && <p style={{ color: "red", marginTop: "10px" }}>Bạn đã bình luận sản phẩm này!</p>}
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default CommentSection;