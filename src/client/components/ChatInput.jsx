import React, { useState, useCallback, useRef } from 'react';
import { debounce } from '../utils/debounce';

const ChatInput = ({ onSendMessage }) => {
  const [aiQuestion, setAiQuestion] = useState('');
  
  // Tạo debounced setter với useCallback để tránh tạo lại function
  const debouncedSetAiQuestion = useCallback(
    debounce((value) => {
      setAiQuestion(value);
    }, 300), // 300ms delay
    []
  );

  // Giữ giá trị hiện tại trong ref để hiển thị ngay lập tức trong input
  const inputRef = useRef('');

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Cập nhật ref ngay lập tức để input không bị lag
    inputRef.current = value;
    // Gọi debounced setter
    debouncedSetAiQuestion(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputRef.current.trim()) {
      onSendMessage(inputRef.current);
      // Reset cả ref và state
      inputRef.current = '';
      setAiQuestion('');
      e.target.reset();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="chat-input">
      <input
        type="text"
        placeholder="Nhập câu hỏi..."
        onChange={handleInputChange}
        defaultValue={inputRef.current}
      />
      <button type="submit">Gửi</button>
    </form>
  );
};

export default React.memo(ChatInput); 