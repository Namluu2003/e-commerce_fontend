// ModalAddNew.jsx
import React, { memo, useEffect, useState } from "react";
import { Modal, Button, Form, Input } from "antd";

const ModalAddNew = ({ open, onCreate, onCancel, loading, title, req }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    // Cắt khoảng trắng ở đầu và cuối trước khi gửi request
    const trimmedValues = {
      ...values,
      [req]: values[req].trim(),
    };
  
    console.log(trimmedValues);
  
    await onCreate(trimmedValues);
    form.resetFields(); // Reset form sau khi submit
  };
  
  useEffect(() => {
    // console.warn("dax chayj vaof ddaya-------------------", title);
  });
  return (
    <Modal
      open={open}
      title={`Thêm ${title}`}
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
      <p>Nhập thông tin {title} mới...</p>
      <Form
        form={form}
        onFinish={handleSubmit} // Handle form submission
        layout="vertical"
      >
        <Form.Item
          name={req}
          label={`Tên ${title}`}
          rules={[
            {
              validator: (_, value) => {
                if (!value || !value.trim()) {
                  return Promise.reject(new Error("Không được để trống hoặc chỉ có khoảng trắng"));
                }
                if (!/^[\p{L}\p{N} ]+$/u.test(value.trim())) {
                  return Promise.reject(new Error(`Tên ${title} chỉ chứa chữ và số, không có ký tự đặc biệt`));
                }
                if (value.trim().length > 20) {
                  return Promise.reject(new Error(`Tên ${title} tối đa 20 ký tự`));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input placeholder="Nhập tên mới vào đây!" allowClear />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default memo(ModalAddNew);
