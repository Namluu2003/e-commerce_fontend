import React, { useState } from "react";
import { Button, Carousel } from "antd";
import Title from "antd/es/skeleton/Title";
import Paragraph from "antd/es/typography/Paragraph";

// Định nghĩa style cho ảnh
const contentStyle = {
  margin: 0,
  height: "600px",
  width: "100%",
  objectFit: "cover",
};

// Dữ liệu mẫu banners
const banners = [
  {
    id: 1,
    title: "Hot Nhất Hè 2025",
    subtitle: "Khám phá ưu đãi mùa hè cực hot!",
    link: "#",
    image: "https://file.hstatic.net/1000230642/file/1920x750__16__master.jpg",
  },
  {
    id: 1,
    title: "Hot Nhất Hè 2025",
    subtitle: "Khám phá ưu đãi mùa hè cực hot!",
    link: "#",
    image: "https://file.hstatic.net/1000230642/file/1920x750__11__db44dc06716d42ba8f2af2629649eba7_master.jpg",
  },
  {
    id: 2,
    title: "Khuyến Mãi Đặc Biệt",
    subtitle: "Giảm giá sốc cho mùa mới",
    link: "#",
    image: "/src/assets/img/images/carousel/carousel2.jpg",
  },
  {
    id: 3, // Sửa ID để không trùng lặp
    title: "Sản Phẩm Mới",
    subtitle: "Trải nghiệm công nghệ tiên tiến",
    link: "#",
    image: "/src/assets/img/images/carousel/carousel3.jpg",
  },
  {
    id: 4, // Sửa ID để không trùng lặp
    title: "Ưu Đãi Cuối Mùa",
    subtitle: "Mua sắm ngay trước khi hết hàng",
    link: "#",
    image: "/src/assets/img/images/carousel/carousel5.jpg",
  },
];

const HomeCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0); // Theo dõi slide hiện tại

  // Hàm xử lý khi slide thay đổi
  const handleAfterChange = (current) => {
    setCurrentSlide(current);
  };

  return (
    <div style={{ position: "relative" }}>
      <Carousel
        arrows
        infinite={true}
        autoplay={true}
        speed={500}
        pauseOnHover={true}
        afterChange={handleAfterChange} // Cập nhật slide hiện tại sau mỗi lần chuyển
      >
        {banners.map((banner) => (
          <div key={banner.id}>
            <img
              style={contentStyle}
              src={banner.image}
              alt={banner.title}
            />
          </div>
        ))}
      </Carousel>

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50px",
          transform: "translateY(-50%)",
          maxWidth: 500,
          color: "white",
          zIndex: 10,
        }}
      >
        <Title
          level={2}
          style={{
            color: "white",
            marginBottom: 10,
            textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
          }}
        >
          {banners[currentSlide].title} {/* Hiển thị title của slide hiện tại */}
        </Title>
        <Paragraph
          style={{
            color: "white",
            fontSize: 18,
            marginBottom: 20,
            textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
          }}
        >
          {banners[currentSlide].subtitle} {/* Hiển thị subtitle của slide hiện tại */}
        </Paragraph>
        <Button
          type="primary"
          size="large"
          style={{ backgroundColor: "#ff6600", borderColor: "#ff6600" }}
          href={banners[currentSlide].link} 
        >
          Xem ngay
        </Button>
      </div>
    </div>
  );
};

export default HomeCarousel;