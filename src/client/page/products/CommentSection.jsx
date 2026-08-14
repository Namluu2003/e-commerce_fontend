import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Client } from "@stomp/stompjs";
import { Input, Button, List, Card, Space, Typography, Avatar, Col, Row, Select, Tooltip } from "antd";
import { Rate } from "antd";
import { EditOutlined, FilterOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { apiHasBought } from "./api";
import axios from "axios";
import { COLORS } from "../../../constants/constants";

const { Title } = Typography;
const { Option } = Select;

// Tách component AdminReply thành component riêng
const AdminReply = React.memo(({ reply }) => {
  if (!reply || reply === "" || reply === "undefined" || reply === "null") return null;

  return (
    <div style={{
      backgroundColor: '#e6f7ff',
      padding: '10px 15px',
      borderRadius: '8px',
      marginTop: '10px',
      marginBottom: '10px'
    }}>
      <Row>
        <Col span={1}>
          <Avatar style={{ backgroundColor: '#fa8c16' }}>A</Avatar>
        </Col>
        <Col span={23}>
          <div>
            <strong style={{ color: 'black' }}>Trả lời từ người bán</strong>
          </div>
          <div style={{ marginTop: '5px', color: 'black' }}>{reply}</div>
        </Col>
      </Row>
    </div>
  );
});

// Tách component CommentForm thành component riêng
const CommentForm = React.memo(({ 
  user, 
  hasBought, 
  isCheckingPurchase, 
  isSubmitting, 
  rate, 
  comment, 
  onRateChange, 
  onCommentChange, 
  onSubmit 
}) => {
  if (!user?.id) return null;

  return (
    <Space direction="vertical" style={{ width: "100%", marginTop: "20px" }}>
      {isCheckingPurchase ? (
        <div style={{ color: "blue", marginBottom: "10px" }}>
          Đang kiểm tra thông tin mua hàng...
        </div>
      ) : !hasBought ? (
        <div style={{ color: "red", marginBottom: "10px" }}>
          Bạn cần mua sản phẩm trước khi bình luận!
        </div>
      ) : null}
      <Rate value={rate} onChange={onRateChange} />
      <Input.TextArea
        value={comment}
        onChange={onCommentChange}
        placeholder="Nhập bình luận..."
        maxLength={500}
        rows={3}
        style={{ minWidth: "400px" }}
        disabled={!hasBought || isCheckingPurchase}
        onPressEnter={onSubmit}

      />
      <Button
        type="primary"
        onClick={onSubmit}
        loading={isSubmitting || isCheckingPurchase}
        disabled={isSubmitting || !hasBought || isCheckingPurchase}
      >
        {isSubmitting ? "Đang gửi..." : isCheckingPurchase ? "Đang kiểm tra..." : "Bình luận"}
      </Button>
    </Space>
  );
});

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
  const [hasBought, setHasBought] = useState(false);
  const [isCheckingPurchase, setIsCheckingPurchase] = useState(true);
  const [rate, setRate] = useState(5);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState("");
  const [editRate, setEditRate] = useState(5);
  const [starFilter, setStarFilter] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sử dụng useCallback cho các hàm xử lý sự kiện
  const handleRateChange = useCallback((value) => setRate(value), []);
  const handleCommentChange = useCallback((e) => setComment(e.target.value), []);
  const handleEditRateChange = useCallback((value) => setEditRate(value), []);
  const handleEditTextChange = useCallback((e) => setEditText(e.target.value), []);
  const handleFilterChange = useCallback((value) => setStarFilter(Number(value)), []);

  // Thêm hàm editComment
  const editComment = useCallback((item) => {
    setEditingComment(item.id);
    setEditText(item.comment);
    setEditRate(item.rate);
  }, []);

  // Sử dụng useMemo cho các giá trị được tính toán
  const averageRate = useMemo(() => 
    comments.length > 0
      ? (comments.reduce((sum, c) => sum + c.rate, 0) / comments.length).toFixed(1)
      : "0",
    [comments]
  );

  const totalReviews = useMemo(() => comments.length, [comments]);

  const starCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    comments.forEach(comment => {
      if (comment.rate >= 1 && comment.rate <= 5) {
        counts[comment.rate - 1]++;
      }
    });
    return counts;
  }, [comments]);

  // Tối ưu hàm checkUserPurchase
  const checkUserPurchase = useCallback(async () => {
    setIsCheckingPurchase(true);
    if (user?.id) {
      try {
        const response = await apiHasBought(user.id, productId);
        if (response === undefined || response === null) {
          console.error("API returned undefined or null response");
          setHasBought(false);
          return;
        }
        setHasBought(typeof response === 'boolean' ? response : Boolean(response));
      } catch (error) {
        console.error("Lỗi khi kiểm tra mua hàng:", error);
        setHasBought(false);
      } finally {
        setIsCheckingPurchase(false);
      }
    } else {
      setHasBought(false);
      setIsCheckingPurchase(false);
    }
  }, [user?.id, productId]);

  // Tối ưu hàm fetchComments
  const fetchComments = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/admin/comments/product", {
        params: { productId },
      });
      
      const commentsData = response.data?.data || [];

      if (!Array.isArray(commentsData)) {
        console.error("API không trả về danh sách bình luận:", commentsData);
        toast.error("Dữ liệu bình luận không đúng định dạng!");
        return;
      }

      const formattedData = commentsData
        .map((item) => ({
          id: item.id,
          fullName: item.fullName || "Khách hàng ẩn danh",
          comment: item.comment || "Không có bình luận",
          productId: item.productId,
          customerEmail: item.customerEmail || "Không có tài khoản",
          createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : null,
          rate: item.rate || 5,
          adminReply: item.adminReply || "",
          avatar: item.avatar || 'https://via.placeholder.com/40',
          parentId: item.parentId,
          productName: item.productName || "Sản phẩm không xác định"
        }))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setComments(formattedData);
      setFilteredComments(formattedData);

      if (customerId) {
        const hasCommented = formattedData.some(comment => comment.customerEmail === user?.email);
        setHasCommented(hasCommented);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu bình luận:", error);
      toast.error(`Không thể tải bình luận: ${error.response?.data?.message || "Lỗi không xác định"}`);
    }
  }, [productId, customerId, user?.email]);

  // Tối ưu hàm sendComment
  const sendComment = useCallback(async () => {
    if (!user || isCheckingPurchase || !hasBought || !comment.trim() || !stompClient.current?.connected) {
      toast.error("Vui lòng kiểm tra điều kiện trước khi gửi bình luận!");
      return;
    }

    const commentText = comment;
    const rateValue = rate;
    const newCommentId = Date.now();

    setComment("");
    setRate(5);
    setIsSubmitting(true);

    const optimisticComment = {
      id: newCommentId,
      fullName: user.fullName,
      comment: commentText,
      productId: productId,
      customerEmail: user.email,
      createdAt: new Date().toISOString(),
      rate: rateValue,
      adminReply: "",
      avatar: user.avatar || 'https://via.placeholder.com/40',
      isPending: true
    };

    setComments(prev => [...prev, optimisticComment]);
    setHasCommented(true);

    try {
      await stompClient.current.publish({
        destination: `/app/comment/${productId}`,
        body: JSON.stringify({
          action: "create",
          customerId: user.id,
          comment: commentText,
          rate: rateValue,
          createdAt: new Date().toISOString(),
        }),
      });

      setIsSubmitting(false);
      toast.success("Bình luận đã được gửi thành công!");
      setComments(prev =>
        prev.map(c => c.id === newCommentId ? { ...c, isPending: false } : c)
      );
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
      setComments(prev => prev.filter(c => c.id !== newCommentId));
      setHasCommented(false);
      toast.error("Không thể gửi bình luận: " + error.message);
      setIsSubmitting(false);
    }
  }, [user, isCheckingPurchase, hasBought, comment, rate, productId]);

  // Tối ưu hàm saveEditedComment
  const saveEditedComment = useCallback(async () => {
    if (!editText.trim()) {
      toast.error("Vui lòng nhập nội dung bình luận!");
      return;
    }

    if (!stompClient.current?.connected) {
      toast.error("Kết nối WebSocket không ổn định!");
      return;
    }

    try {
      await stompClient.current.publish({
        destination: `/app/comment/${productId}`,
        body: JSON.stringify({
          action: "update",
          customerId,
          comment: editText,
          rate: editRate,
          parentId: editingComment,
          updatedAt: null
        }),
      });

      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === editingComment
            ? { ...comment, comment: editText, rate: editRate }
            : comment
        )
      );

      setEditingComment(null);
      setEditText("");
      setEditRate(5);
      toast.success("Bình luận đã được cập nhật thành công!");
    } catch (error) {
      console.error("Lỗi khi gửi cập nhật:", error);
      toast.error("Không thể cập nhật bình luận: " + error.message);
    }
  }, [customerId, editText, editRate, editingComment, productId]);

  // Tối ưu hàm connectWebSocket
// Tối ưu hàm connectWebSocket
const connectWebSocket = useCallback(() => {
  const socket = new WebSocket("ws://localhost:8080/ws");
  const client = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    onConnect: () => {
      client.subscribe(`/topic/comments/${productId}`, (message) => {
        try {
          // Kiểm tra xem message.body có phải chuỗi hợp lệ không
          if (!message.body || typeof message.body !== 'string') {
            console.error("Invalid WebSocket message body:", message.body);
            return;
          }

          // Thử parse JSON
          const data = JSON.parse(message.body);
          console.log("WebSocket message received:", data);

          // Xử lý dữ liệu JSON hợp lệ
          if (data.customerId && data.customerId !== user?.id||data?.parentId) {
            console.log("Fetching comments for update from another user");
            fetchComments();
          } else {
            console.log("Skipping fetch - comment from current user or invalid data");
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
          // Xử lý trường hợp đặc biệt như "deleted:81"
          if (message.body.startsWith("deleted:")) {
            const deletedId = message.body.split(":")[1];
            console.log(`Comment with ID ${deletedId} was deleted`);
            // setComments(prev => prev.filter(comment => comment.id !== parseInt(deletedId)));
            fetchComments();
          } else {
            toast.error("Dữ liệu từ server không hợp lệ!");
          }
        }
      });
    },
    onStompError: (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
      toast.error("Có lỗi kết nối với máy chủ bình luận!");
      if (isSubmitting) {
        setIsSubmitting(false);
      }
    }
  });

  client.activate();
  stompClient.current = client;
}, [productId, user?.id, fetchComments]);

  // Tối ưu các useEffect
  useEffect(() => {
    setProductId(id);
  }, [id]);

  useEffect(() => {
    fetchComments(); // Chỉ gọi một lần khi component mount hoặc productId thay đổi
    connectWebSocket();
    return () => {
      if (stompClient.current) stompClient.current.deactivate();
    };
  }, [productId, connectWebSocket, fetchComments]);

  useEffect(() => {
    checkUserPurchase();
  }, [user?.id, productId, checkUserPurchase]);

  useEffect(() => {
    if (starFilter === 0) {
      setFilteredComments([...comments]);
    } else {
      setFilteredComments(
        comments
          .filter(comment => comment.rate === starFilter)
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      );
    }
  }, [starFilter, comments]);

  useEffect(() => {
    if (commentsRef.current) {
      commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
    }
  }, [filteredComments]);

  // Tối ưu hàm renderStars
  const renderStars = useCallback((count) => {
    return Array(count).fill(0).map((_, i) => (
      <span key={i} style={{ color: 'gold' }}>⭐</span>
    ));
  }, []);

  // Thêm hàm formatTime
  const formatTime = useCallback((dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'vừa xong';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    }
    
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  return (
    <div style={{ padding: "20px", margin: "0 auto" }}>
      <Card style={{ marginTop: "20px" }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space direction="horizontal">
                <Title level={4}>Đánh giá trung bình: {averageRate}/5⭐</Title>
                <span style={{color:'black'}}>({totalReviews} đánh giá)</span>
              </Space>
            </Col>
            <Col>
              <Space>
                <FilterOutlined />
                <span style={{color:'black'}}>Lọc theo: </span>
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
                        <Col span={1}><Avatar src={item.avatar} /></Col>
                        <Col span={23}>
                          <strong>{item.fullName}</strong>
                          <span style={{ color: "black" }}> ({formatTime(item.createdAt)})</span>
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
                            <Rate value={editRate} onChange={handleEditRateChange} />
                            <Input.TextArea
                              value={editText}
                              onChange={handleEditTextChange}
                              maxLength={500}
                              rows={4}
                            />
                            <Space>
                              <Button type="primary" onClick={saveEditedComment}>Lưu</Button>
                              <Button onClick={() => setEditingComment(null)}>Hủy</Button>
                            </Space>
                          </Space>
                        ) : (
                          <>
                            <p style={{color:'black'}}>{item.comment}</p>
                            <AdminReply reply={item.adminReply} />
                          </>
                        )}
                      </>
                    }
                  />
                  {item.customerEmail === user?.email && (
                   <Tooltip title="Chỉnh sửa bình luận">
                     <Button
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => editComment(item)}
                      style={{ float: "right", color:'white', marginBottom: "130px" ,backgroundColor:`${COLORS.primary}` }}
                      
                    />
                   </Tooltip>
                  )}
                </List.Item>
              )}
              locale={{ emptyText: starFilter === 0 ? "Chưa có đánh giá nào" : `Không có đánh giá ${starFilter} sao nào` }}
            />

            {!hasCommented && (
              <CommentForm
                user={user}
                hasBought={hasBought}
                isCheckingPurchase={isCheckingPurchase}
                isSubmitting={isSubmitting}
                rate={rate}
                comment={comment}
                onRateChange={handleRateChange}
                onCommentChange={handleCommentChange}
                onSubmit={sendComment}
              />
            )}

            {hasCommented && <p style={{ color: "red", marginTop: "10px" }}>Bạn đã bình luận sản phẩm này!</p>}
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default CommentSection;