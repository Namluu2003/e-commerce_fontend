import React, { useState } from 'react';
import { Form, Input, Button, message, Spin } from 'antd';
import { MailOutlined, LoadingOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import axios from 'axios';

const ForgotPasswordAdmin = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/auth/forgot-password?email=${encodeURIComponent(values.email)}`);
      
      console.log('Password reset request response:', response.data);
      message.success('Password reset link sent to your email!');
      setIsSubmitted(true);
    } catch (error) {
      console.error('Password reset request error:', error);
      if (error.response) {
        message.error(error.response.data.message || 'Failed to send reset link. Please try again.');
      } else {
        message.error('Failed to send reset link. Please check your network connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Reset Password</h2>
        <Form
          form={form}
          name="passwordResetRequest"
          onFinish={onFinish}
          layout="vertical"
          className="space-y-4"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email address' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" className="rounded-md" disabled={isSubmitted} />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 border-0 rounded-md h-10 font-semibold text-lg"
              disabled={loading || isSubmitted}
            >
              {loading ? <Spin indicator={antIcon} /> : 'Send Reset Link'}
            </Button>
          </Form.Item>
        </Form>
        <div className="text-center mt-3">
          <Link to="/auth/login-admin" className="text-sm text-purple-600 hover:text-purple-800 transition-colors duration-300">
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordAdmin;

