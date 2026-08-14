import {useEffect} from 'react';
import { Form, Input, Button, message } from "antd";
import {useSearchParams, useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import { motion } from 'framer-motion';
import {toast} from "react-toastify";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {token} = useParams();
  useEffect(() => {
    // const token = searchParams.get("token");
    // if (!token || token === "") {
    //   navigate("/auth/login");
    // }
  }, [navigate, searchParams]);

  const onFinish = async (values) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/authentication/reset-password",
        {
          token: token,
          password: values.password.trim()
        }
      );
      toast.success("Mật khẩu thay đổi thành công!");
      navigate("/login");
    } catch (error) {
      console.error("Error during change password:", error);
      if (error.response && error.response.data) {
        const { code, message: errorMessage } = error.response.data;
        if (code !== 1000) {
          toast.error(errorMessage || "Failed to change password. Please try again.");
        } else {
          toast.error("An unexpected error occurred. Please try again.");
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Đặt lại mật khẩu</h2>
        <Form
          name="resetPassword"
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="password"
            label="Mật khẩu mới"
            rules={[
              {
                required: true,
                message: 'Please input your new password!',
              },
              {
                min: 3,
                message: 'Password must be at least 8 characters long!',
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="repassword"
            label="Xác nhận mật khẩu"
            dependencies={['password']}
            rules={[
              {
                required: true,
                message: 'Please confirm your new password!',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="w-full h-10 bg-gradient-to-r from-purple-500 to-pink-500 border-0 rounded-md font-semibold text-lg"
            >
              Đặt lại mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;