import React, { useState } from 'react';
import { Form, Input, Button, message, Spin, Typography } from 'antd';
import { MailOutlined, LoadingOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from "./Login.module.css";
import {toast} from "react-toastify";

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.get(
          `http://localhost:8080/api/authentication/forgot-password/${encodeURIComponent(values.email)}`
      );
      console.log('Password reset request response:', response.data);
      toast.success('Vui lòng kiểm tra email để khôi phục mật khẩu!');
      setIsSubmitted(true);
    } catch (error) {
      console.error('Password reset request error:', error);
      if (error.response) {
        toast.error(error.response.data.message || 'Failed to send reset link. Please try again.');
      } else {
        toast.error('Failed to send reset link. Please check your network connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 20 }} spin />;

  return (
      <div
          className="container d-flex flex-column justify-content-center">
        <img
            src="/img/thehands.png"
            alt="Logo"
            height={80}
            width={100}
        />
        <motion.div
            initial={{opacity: 0, y: -30}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.6}}
            className="bg-white shadow-2xl rounded-2xl p-8 sm:p-10 w-full max-w-md"
        >
          <div>

          </div>
          <Title level={2} className="text-center text-gray-800 mb-6 !text-3xl font-bold">
            Forgot Your Password?
          </Title>
          <Text className="block text-center mb-5 text-gray-600">
            Enter your email below and we’ll send you a link to reset your password.
          </Text>
          <Form
              form={form}
              name="passwordResetRequest"
              layout="vertical"
              onFinish={onFinish}
              className="space-y-4"
          >
            <Form.Item
                name="email"
                label={<span className="font-semibold text-sm text-gray-700">Email Address</span>}
                rules={[
                  {required: true, message: 'Please input your email!'},
                  {type: 'email', message: 'Please enter a valid email address'}
                ]}
            >
              <Input
                  prefix={<MailOutlined className="mr-1"/>}
                  placeholder="example@domain.com"
                  size="large"
                  className="rounded-lg"
                  disabled={isSubmitted}
              />
            </Form.Item>

            <Form.Item>
              <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full h-10 text-lg font-semibold rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-none"
                  disabled={loading || isSubmitted}
                  block
              >
                {loading ? <Spin indicator={antIcon}/> : 'Gửi email kích hoạt'}
              </Button>
            </Form.Item>
          </Form>

          {isSubmitted && (
              <div className="text-center mt-4 text-green-600 font-medium">
                ✅ Reset link has been sent to your email.
              </div>
          )}

          <div className="text-center mt-6">
            <Link
                to="/login"
                className="text-sm text-purple-600 hover:text-purple-800 font-medium transition duration-300"
            >
              &larr; Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
  );
};

export default ForgotPassword;
