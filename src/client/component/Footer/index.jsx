import React, { useState } from "react";
import stype from "../HeaderNav/HeaderNav.module.css";
import clsx from "clsx";

// Importing the most vibrant and modern icons
import { IoLocationSharp } from "react-icons/io5";
import { IoCallSharp } from "react-icons/io5";
import { IoMailOpenSharp } from "react-icons/io5";
import { IoLogoInstagram } from "react-icons/io5";
import { IoLogoFacebook } from "react-icons/io5";
import { IoLogoYoutube } from "react-icons/io5";
import { BsTiktok } from "react-icons/bs";
import { IoArrowForward } from "react-icons/io5";

function Home() {
  const [hoveredLink, setHoveredLink] = useState(null);

  return (
    <>
      <div className={clsx(stype.footer, "border-top border-2 py-4")} style={{background: "white"}}>
        <div className="container">
          <div className="row justify-content-between">
            {/* Company info column */}
            <div className="col-md-5 mb-4">
              <div className="mb-3 d-flex align-items-center">
                <img
                  src="/img/thehands.png"
                  alt="Logo"
                  className="img-fluid logo-icon"
                  style={{ maxHeight: "260px" }}
                />
               
              </div>
              <p className="text-muted mb-4">
                Hộ Kinh Doanh Nghiêm Xuân Huy MST : 01E8027929<br />
                Nhà sưu tầm và phân phối chính hãng các thương hiệu thời trang
                quốc tế hàng đầu Việt Nam
              </p>
              
              <h5 className="text-primary fw-bold mb-3 d-flex align-items-center">
                <span className="gradient-text">HỆ THỐNG CỬA HÀNG</span>
                {/* <div className="animated-line ms-2"></div> */}
              </h5>
              
              <div className="contact-item d-flex align-items-center mb-3">
                <div className="icon-container me-3">
                  <IoLocationSharp className="contact-icon location-icon" size={24} />
                </div>
                <p className="mb-0">
                  Cơ sở 1: Cao đẳng FPT Polytechnich
                </p>
              </div>
              
               <div className="contact-item d-flex align-items-center mb-3">
                <div className="icon-container me-3">
                  <IoCallSharp className="contact-icon" size={24} />
                </div>
                <p className="mb-0">0961302699</p>
              </div>
              
              <div className="contact-item d-flex align-items-center mb-3">
                <div className="icon-container me-3">
                  <IoMailOpenSharp className="contact-icon mail-icon" size={24} />
                </div>
                <p className="mb-0">duycongib192@gmail.com</p>
              </div>
              
              <p className="text-muted small">
                ĐKKD: 01E8027929 - Cấp ngày: 01/06/2019 - Nơi cấp: Hà Nội
              </p>
            </div>

            {/* About Us column */}
            <div className="col-md-3 mb-4">
              <h5 className="text-primary fw-bold mb-3 d-flex align-items-center">
                <span className="gradient-text">VỀ CHÚNG TÔI</span>
                {/* <div className="animated-line ms-2"></div> */}
              </h5>
              
              {["Giới Thiệu", "Tuyển Dụng", "Dịch Vụ Spa, Sửa Giày", "Tin Tức-Sự Kiện"].map((item, index) => (
                <div key={index} className="mb-2">
                  <a 
                    href="#" 
                    className="nav-link-modern"
                    onMouseEnter={() => setHoveredLink(item)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    {item}
                    {hoveredLink === item && (
                      <IoArrowForward className="ms-2 arrow-icon" />
                    )}
                  </a>
                </div>
              ))}
              
              <div className="mt-4">
                <p className="fw-bold mb-2">Kết Nối Với Chúng Tôi</p>
                <div className="social-icons">
                  <a href="#" className="social-icon instagram">
                    <IoLogoInstagram size={24} />
                  </a>
                  <a href="#" className="social-icon facebook">
                    <IoLogoFacebook size={24} />
                  </a>
                  <a href="#" className="social-icon youtube">
                    <IoLogoYoutube size={24} />
                  </a>
                  <a href="#" className="social-icon tiktok">
                    <BsTiktok size={22} />
                  </a>
                </div>
              </div>
              
              <div className="mt-3">
                <img className="img-fluid" style={{maxWidth: "140px"}} src="/img/bocongthuong.png" />
              </div>
            </div>

            {/* Support column */}
            <div className="col-md-3 mb-4">
              <h5 className="text-primary fw-bold mb-3 d-flex align-items-center">
                <span className="gradient-text">HỖ TRỢ KHÁCH HÀNG</span>
                {/* <div className="animated-line ms-2"></div> */}
              </h5>
              
              {[
                "Hướng Dẫn Mua hàng",
                "Chính Sách Đổi Trả Và Bảo Hành",
                "Chính Sách Thanh Toán",
                "Chính Sách Bảo Mật Thông Tin Khách Hàng",
                "Chính Sách Vận Chuyển Và Giao Hàng"
              ].map((item, index) => (
                <div key={index} className="mb-2">
                  <a 
                    href="#" 
                    className="nav-link-modern"
                    onMouseEnter={() => setHoveredLink(item)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    {item}
                    {hoveredLink === item && (
                      <IoArrowForward className="ms-2 arrow-icon" />
                    )}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Modern Gradient Text */
        .gradient-text {
          background: linear-gradient(45deg, #F37021);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          letter-spacing: 0.5px;
        }
        
        /* Animated Line */
        .animated-line {
          height: 2px;
          width: 30px;
          background: linear-gradient(90deg, #f8971d, #ffc107);
          position: relative;
          overflow: hidden;
        }
        
        .animated-line:after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(168, 52, 52, 0.8), transparent);
          animation: shine 2s infinite;
        }
        
        @keyframes shine {
          to {
            left: 100%;
          }
        }
        
        /* Modern Nav Links */
        .nav-link-modern {
          color: #495057;
          text-decoration: none;
          position: relative;
          display: inline-flex;
          align-items: center;
          transition: all 0.3s ease;
          padding: 4px 0;
          font-weight: 500;
        }
        
        .nav-link-modern:hover {
          color: #f8971d;
          transform: translateX(5px);
        }
        
        .arrow-icon {
          animation: bounceRight 0.6s infinite alternate;
        }
        
        @keyframes bounceRight {
          from { transform: translateX(0); }
          to { transform: translateX(3px); }
        }
        
        /* Contact Items */
        .contact-item {
          transition: all 0.3s ease;
        }
        
        .contact-item:hover {
          transform: translateX(5px);
        }
        
        .icon-container {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #ffffff, #e6e6e6);
          box-shadow: 5px 5px 10px #d9d9d9, -5px -5px 10px #ffffff;
          transition: all 0.3s ease;
        }
        
        .contact-item:hover .icon-container {
          box-shadow: inset 5px 5px 10px #d9d9d9, inset -5px -5px 10px #ffffff;
        }
        
        .contact-icon {
          color:#0d6efd;
          transition: all 0.3s ease;
        }
        
        .location-icon {
          color: #dc3545; /* Red color for location icon */
        }
        
        .mail-icon {
          color: #ffc107; /* Yellow color for mail icon */
        }
        
        .contact-item:hover .contact-icon {
          transform: scale(1.2);
        }
        
        /* Social Icons */
        .social-icons {
          display: flex;
          gap: 12px;
        }
        
        .social-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          color: white;
        }
        
        .social-icon.instagram {
          background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%);
          box-shadow: 0 2px 10px rgba(214, 36, 159, 0.3);
        }
        
        .social-icon.facebook {
          background: #1877F2;
          box-shadow: 0 2px 10px rgba(24, 119, 242, 0.3);
        }
        
        .social-icon.youtube {
          background: #FF0000;
          box-shadow: 0 2px 10px rgba(255, 0, 0, 0.3);
        }
        
        .social-icon.tiktok {
          background: #000000;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          position: relative;
          overflow: hidden;
        }
        
        .social-icon.tiktok:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, #25F4EE, #FE2C55, #000000);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }
        
        .social-icon.tiktok:hover:before {
          opacity: 1;
        }
        
        .social-icon:hover {
          transform: translateY(-3px) scale(1.1);
        }
      `}</style>
    </>
  );
}

export default Home;