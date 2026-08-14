import React, { useState } from "react";
import { Modal, Button, Form, Input } from "antd";

const ModalAddProduct = ({ open, onCreate, onCancel, loading }) => {
  const [form] = Form.useForm();
  const [request, setRequest] = useState({
    productName: "",
    status: "HOAT_DONG",
  });

  const handleSubmit = async (values) => {
    // Cắt khoảng trắng ở đầu và cuối trước khi gửi request
    const trimmedValues = {
      ...values,
      productName: values.productName.trim(),
    };
  
    console.log(trimmedValues);
  
    await onCreate(trimmedValues);
    form.resetFields(); // Reset form sau khi submit
  };
  

  return (
    <Modal
      open={open}
      title="Thêm Sản Phẩm"
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()} // Submit the form
        >
          Xác nhận
        </Button>,
      ]}
    >
      <p>Nhập thông tin sản phẩm mới...</p>
      <Form
        form={form}
        onFinish={handleSubmit} // Handle form submission
        layout="vertical"
      >
        <Form.Item
          name="productName"
          label="Tên sản phẩm"
          rules={[
            {
              validator: (_, value) => {
                if (!value || !value.trim()) {
                  return Promise.reject(new Error("Không được để trống hoặc chỉ có khoảng trắng"));
                }
                if (!/^[\p{L}\p{N} ]+$/u.test(value.trim())) {
                  return Promise.reject(new Error(`Tên sản phẩm chỉ chứa chữ và số, không có ký tự đặc biệt`));
                }
                if (value.trim().length > 20) {
                  return Promise.reject(new Error(`Tên sản phẩm tối đa 20 ký tự`));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input placeholder="Nhập tên sản phẩm vào đây!" allowClear />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalAddProduct;
