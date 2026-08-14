import React, { useState } from "react";
import { Upload, message, Button } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";

// Cấu hình Cloudinary
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dieyhvcou/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "uploaddatn";

const UploadImage = () => {
  const [fileList, setFileList] = useState([]);
  
  const handleUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await axios.post(CLOUDINARY_URL, formData);
      const imageUrl = response.data.secure_url;
      const publicId = response.data.public_id;

      const newImage = {
        uid: publicId, // ID của ảnh
        name: file.name,
        status: "done",
        url: imageUrl,
      };

      setFileList([...fileList, newImage]);
      message.success("Upload thành công!");
    } catch (error) {
      console.error("Lỗi upload:", error);
      message.error("Upload thất bại!");
    }
  };

  // ✅ 2️⃣ Xóa ảnh khỏi Cloudinary
  const handleDelete = async (file) => {
    const publicId = file.uid;
    const CLOUDINARY_DELETE_URL = `https://api.cloudinary.com/v1_1/dieyhvcou/delete_by_token`;

    try {
      await axios.post(CLOUDINARY_DELETE_URL, { public_id: publicId });
      setFileList(fileList.filter((item) => item.uid !== publicId));
      message.success("Ảnh đã được xóa!");
    } catch (error) {
      console.error("Lỗi khi xóa ảnh:", error);
      message.error("Xóa ảnh thất bại!");
    }
  };

  return (
    <div>
      <Upload
        customRequest={handleUpload} // Gửi ảnh lên Cloudinary
        listType="picture-card"
        fileList={fileList}
        onRemove={handleDelete} // Xóa ảnh
      >
        {fileList.length < 5 && (
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Tải lên</div>
          </div>
        )}
      </Upload>

      {fileList.length > 0 && (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => setFileList([])}
          style={{ marginTop: 10 }}
        >
          Xóa tất cả ảnh
        </Button>
      )}
    </div>
  );
};

export default UploadImage;
