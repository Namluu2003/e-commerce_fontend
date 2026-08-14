import React, { useState } from "react";
import { Modal, Button, Table } from "antd";

const SizeChart = ({ onOpen, onCancel }) => {
  const [visible, setVisible] = useState(false);

  const data = [
    { key: "1", sizeEU: "36", footLength: "23.5" },
    { key: "2", sizeEU: "37", footLength: "23.8" },
    { key: "3", sizeEU: "38", footLength: "24.1" },
    { key: "4", sizeEU: "39", footLength: "24.5" },
    { key: "5", sizeEU: "40", footLength: "24.8" },
    { key: "6", sizeEU: "41", footLength: "25.1" },
    { key: "7", sizeEU: "42", footLength: "25.4" },
    { key: "8", sizeEU: "43", footLength: "25.8" },
    { key: "9", sizeEU: "44", footLength: "26.1" },
    { key: "10", sizeEU: "45", footLength: "26.5" },
  ];

  const columns = [
    {
      title: "Size (EU)",
      dataIndex: "sizeEU",
      key: "sizeEU",
    },
    {
      title: "Chiều dài bàn chân (cm)",
      dataIndex: "footLength",
      key: "footLength",
    },
  ];

  return (
    <>
      <Modal
        title="Bảng Quy Đổi Kích Cỡ"
        open={onOpen}
        onCancel={onCancel}
        footer={null} // Remove the default modal buttons
        width={800} // Set custom width for modal
      >
        <Table
          dataSource={data}
          columns={columns}
          pagination={false}
          bordered
        />
      </Modal>
    </>
  );
};

export default SizeChart;
