import React from "react";
import { Button, Carousel, Collapse } from "antd";
import {
  ShoppingOutlined,
  SafetyOutlined,
  RocketOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { FaRunning, FaDumbbell, FaBolt, FaTrophy } from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const { Panel } = Collapse;

// Reusable components
const FeatureCard = ({ icon, title, description }) => (
  <motion.div 
    whileHover={{ scale: 1.05, y: -5 }}
    className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-all duration-300 border border-gray-100"
  >
    <div className="mb-6 text-indigo-600">{icon}</div>
    <h3 className="text-xl font-bold mb-3 text-gray-800">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </motion.div>
);

const TestimonialCard = ({ name, comment }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
  >
    <p className="text-gray-600 mb-6 leading-relaxed">"{comment}"</p>
    <p className="font-bold text-indigo-600">{name}</p>
  </motion.div>
);

const CollectionCard = ({ icon, title, description }) => (
  <motion.div 
    whileHover={{ scale: 1.05, y: -5 }}
    className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-all duration-300 border border-gray-100"
  >
    <div className="mb-6 text-indigo-600">{icon}</div>
    <h3 className="text-xl font-bold mb-3 text-gray-800">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </motion.div>
);

const GioiThieu = () => {
  return (
    <main className="bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-24"
      >
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Bước vào Tương lai với 3HST
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl mb-8 text-indigo-100"
            >
              Trải nghiệm sự thoải mái và phong cách với giày 3HST.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link to={"/filter"}>
                <Button
                  type="primary"
                  size="large"
                  className="bg-white text-indigo-600 hover:bg-indigo-50 h-12 px-8 text-lg font-semibold rounded-lg"
                >
                  Mua sắm ngay
                </Button>
              </Link>
            </motion.div>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="md:w-1/2"
          >
            <img
              src="/images/product/Adidas_Forum_Low_Core_Black.png"
              alt="Giày 3HST nổi bật"
              className="rounded-xl shadow-2xl w-full h-auto transform hover:scale-105 transition-transform duration-300"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Collections Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-24"
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-center mb-12 text-gray-800"
          >
            Bộ sưu tập của chúng tôi
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <CollectionCard
              icon={<FaRunning className="w-12 h-12 mx-auto" />}
              title="Giày Chạy Bộ"
              description="Thoải mái và hỗ trợ cho mọi bước chạy của bạn."
            />
            <CollectionCard
              icon={<FaDumbbell className="w-12 h-12 mx-auto" />}
              title="Giày Tập Luyện"
              description="Đa năng cho mọi bài tập của bạn tại phòng gym."
            />
            <CollectionCard
              icon={<FaBolt className="w-12 h-12 mx-auto" />}
              title="Giày Thể Thao"
              description="Phong cách và thoải mái cho cuộc sống hàng ngày."
            />
            <CollectionCard
              icon={<FaTrophy className="w-12 h-12 mx-auto" />}
              title="Giày Thi Đấu"
              description="Hiệu suất cao cho các vận động viên chuyên nghiệp."
            />
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link to={"/filter"}>
              <Button
                type="primary"
                size="large"
                className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 text-lg font-semibold rounded-lg"
              >
                Xem tất cả sản phẩm
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-24 bg-gray-50"
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-center mb-12 text-gray-800"
          >
            Tại sao chọn 3HST?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<ShoppingOutlined className="text-4xl" />}
              title="Đa dạng lựa chọn"
              description="Tìm đôi giày hoàn hảo từ bộ sưu tập đa dạng của chúng tôi."
            />
            <FeatureCard
              icon={<SafetyOutlined className="text-4xl" />}
              title="Chất lượng cao cấp"
              description="Được chế tác từ các vật liệu cao cấp để đảm bảo độ bền và thoải mái."
            />
            <FeatureCard
              icon={<RocketOutlined className="text-4xl" />}
              title="Giao hàng nhanh chóng"
              description="Nhận đôi giày yêu thích của bạn nhanh chóng tại nhà."
            />
            <FeatureCard
              icon={<HeartOutlined className="text-4xl" />}
              title="Hài lòng khách hàng"
              description="Ưu tiên hàng đầu của chúng tôi là đảm bảo bạn yêu thích đôi giày mới."
            />
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-24"
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-center mb-12 text-gray-800"
          >
            Khách hàng nói gì về chúng tôi
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Nguyễn Văn A"
              comment="Giày 3HST là sự kết hợp hoàn hảo giữa phong cách và thoải mái. Tôi không thể ngừng giới thiệu cho bạn bè!"
            />
            <TestimonialCard
              name="Trần Thị B"
              comment="Chất lượng vượt trội và dịch vụ khách hàng tuyệt vời. 3HST đã trở thành thương hiệu giày yêu thích của tôi."
            />
            <TestimonialCard
              name="Lê Văn C"
              comment="Thiết kế hiện đại và độ bền đáng kinh ngạc. Đầu tư vào 3HST là quyết định sáng suốt nhất của tôi."
            />
          </div>
        </div>
      </motion.section>

      {/* Policies Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-24 bg-gray-50"
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-center mb-12 text-gray-800"
          >
            Chính sách của 3HST
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Collapse defaultActiveKey={["1"]} className="bg-white rounded-xl shadow-lg">
              <Panel 
                header="Chính Sách Bán Hàng" 
                key="1"
                className="text-lg font-semibold"
              >
                <h3 className="font-semibold mb-2 text-indigo-600">Giá Cả và Khuyến Mãi:</h3>
                <ul className="list-disc pl-5 mb-4 text-gray-600">
                  <li>Cập nhật thường xuyên giá bán các sản phẩm giày thể thao.</li>
                  <li>Mức giá phải chăng cho mọi người tiêu dùng.</li>
                  <li>Chương trình giảm giá và khuyến mãi vào các dịp đặc biệt.</li>
                  <li>Ưu đãi khuyến mại và giảm giá tùy thuộc vào giá trị đơn hàng và loại sản phẩm.</li>
                </ul>
                <h3 className="font-semibold mb-2 text-indigo-600">Đặt Hàng và Thanh Toán:</h3>
                <ul className="list-disc pl-5 mb-4 text-gray-600">
                  <li>Đặt hàng trực tuyến hoặc trực tiếp tại cửa hàng.</li>
                  <li>Chấp nhận thanh toán khi nhận hàng (COD).</li>
                  <li>Hệ thống thanh toán an toàn, bảo mật.</li>
                </ul>
                <h3 className="font-semibold mb-2 text-indigo-600">Quy Định Về Đơn Hàng:</h3>
                <ul className="list-disc pl-5 text-gray-600">
                  <li>Giới hạn tối đa 20 mặt hàng, tổng giá trị không quá 10 triệu đồng.</li>
                  <li>Tối đa 5 sản phẩm cho mỗi mặt hàng.</li>
                  <li>Nếu khách hàng muốn mua số lượng lớn hơn, vui lòng liên hệ chúng tôi qua số điện thoại <b>0374269862</b> để nhận thêm nhiều ưu đãi.</li>
                  <li>Thông báo thông tin đơn hàng về email khi đặt hàng thành công.</li>
                </ul>
              </Panel>
              <Panel 
                header="Chính Sách Giao Hàng" 
                key="2"
                className="text-lg font-semibold"
              >
                <h3 className="font-semibold mb-2 text-indigo-600">Phương Thức Giao Hàng:</h3>
                <ul className="list-disc pl-5 mb-4 text-gray-600">
                  <li>Dịch vụ giao hàng nhanh.</li>
                  <li>Thời gian giao hàng dựa trên địa chỉ khách hàng.</li>
                  <li>Chúng tôi chỉ chấp nhận thanh toán khi nhận hàng (COD). Quý khách sẽ thanh toán trực tiếp cho nhân viên giao hàng khi nhận sản phẩm.</li>
                </ul>
                <h3 className="font-semibold mb-2 text-indigo-600">Phí Giao Hàng:</h3>
                <ul className="list-disc pl-5 text-gray-600">
                  <li>Dưới 40 km: 30,000 VND</li>
                  <li>40 km - dưới 100 km: 50,000 VND</li>
                  <li>100 km - dưới 200 km: 60,000 VND</li>
                  <li>200 km - dưới 400 km: 70,000 VND</li>
                </ul>
              </Panel>
            </Collapse>
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
};

export default GioiThieu;
