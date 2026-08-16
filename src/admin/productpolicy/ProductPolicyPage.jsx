// ProductPolicyPage.jsx
import React, { useState } from "react";
import styles from "./ProductPolicy.module.css";

const ProductPolicyPage = () => {
  const [activeTab, setActiveTab] = useState("shipping");
  const [expandedFaqs, setExpandedFaqs] = useState({});

  const toggleFaq = (id) => {
    setExpandedFaqs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className={styles.policyContainer}>
      <header className={styles.header}>
        <h1>Chính Sách Sản Phẩm</h1>
        <p>
          Thông tin chi tiết về các chính sách mua hàng, vận chuyển, đổi trả và
          bảo hành sản phẩm
        </p>
      </header>

      <nav className={styles.policyNav}>
        <ul>
          <li className={activeTab === "shipping" ? styles.active : ""}>
            <button onClick={() => setActiveTab("shipping")}>
              Chính sách vận chuyển
            </button>
          </li>
          <li className={activeTab === "return" ? styles.active : ""}>
            <button onClick={() => setActiveTab("return")}>
              Chính sách đổi trả
            </button>
          </li>
          <li className={activeTab === "warranty" ? styles.active : ""}>
            <button onClick={() => setActiveTab("warranty")}>
              Chính sách bảo hành
            </button>
          </li>
          <li className={activeTab === "payment" ? styles.active : ""}>
            <button onClick={() => setActiveTab("payment")}>
              Phương thức thanh toán
            </button>
          </li>
          <li className={activeTab === "faq" ? styles.active : ""}>
            <button onClick={() => setActiveTab("faq")}>
              Câu hỏi thường gặp
            </button>
          </li>
        </ul>
      </nav>

      <section className={styles.policyContent}>
        {activeTab === "shipping" && (
          <div className={styles.policySection}>
            <h2>Chính Sách Vận Chuyển</h2>
            <div className={styles.sectionContent}>
              <h3>Thời gian vận chuyển</h3>
              <p>Chúng tôi cam kết giao hàng trong thời gian:</p>
              <ul>
                <li>Nội thành Hà Nội, TP. HCM: 1-2 ngày làm việc</li>
                <li>Các tỉnh thành khác: 2-5 ngày làm việc</li>
                <li>Khu vực miền núi, hải đảo: 5-7 ngày làm việc</li>
              </ul>

              <h3>Phí vận chuyển</h3>
              <p>
                Phí vận chuyển được tính dựa trên khoảng cách và trọng lượng:
              </p>
              <ul>
                <li>Miễn phí vận chuyển cho đơn hàng từ 500.000đ trở lên</li>
                <li>
                  Đơn hàng dưới 500.000đ: Phí vận chuyển từ 20.000đ - 50.000đ
                  tùy khu vực
                </li>
              </ul>

              <h3>Theo dõi đơn hàng</h3>
              <p>Khách hàng có thể theo dõi tình trạng đơn hàng thông qua:</p>
              <ul>
                <li>Tài khoản cá nhân trên website</li>
                <li>Mã vận đơn được gửi qua SMS hoặc email</li>
                <li>
                  Liên hệ trực tiếp với bộ phận CSKH qua hotline: 0335867600
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "return" && (
          <div className={styles.policySection}>
            <h2>Chính Sách Đổi Trả</h2>
            <div className={styles.sectionContent}>
              <h3>Điều kiện đổi trả</h3>
              <p>Quý khách được quyền đổi/trả sản phẩm trong các trường hợp:</p>
              <ul>
                <li>Sản phẩm bị lỗi kỹ thuật từ nhà sản xuất</li>
                <li>Sản phẩm giao không đúng mẫu mã, loại sản phẩm đã đặt</li>
                <li>Sản phẩm còn nguyên vẹn, chưa qua sử dụng</li>
                <li>Còn đầy đủ tem, nhãn, hộp, bao bì</li>
              </ul>

              <h3>Thời hạn đổi trả</h3>
              <p>Thời gian áp dụng đổi trả:</p>
              <ul>
                <li>Đổi sản phẩm: trong vòng 7 ngày kể từ ngày nhận hàng</li>
                <li>
                  Trả sản phẩm và hoàn tiền: trong vòng 3 ngày kể từ ngày nhận
                  hàng
                </li>
              </ul>

              <h3>Quy trình đổi trả</h3>
              <ol>
                <li>Liên hệ với bộ phận CSKH qua hotline hoặc email</li>
                <li>Cung cấp thông tin đơn hàng và lý do đổi/trả</li>
                <li>Nhận mã đổi/trả và hướng dẫn đóng gói sản phẩm</li>
                <li>Gửi sản phẩm về địa chỉ công ty theo hướng dẫn</li>
                <li>
                  Nhận sản phẩm mới hoặc hoàn tiền trong vòng 7 ngày làm việc
                </li>
              </ol>
            </div>
          </div>
        )}

        {activeTab === "warranty" && (
          <div className={styles.policySection}>
            <h2>Chính Sách Bảo Hành</h2>
            <div className={styles.sectionContent}>
              <h3>Thời hạn bảo hành</h3>
              <p>Thời gian bảo hành tùy thuộc vào từng loại sản phẩm:</p>
              <ul>
                <li>Điện thoại, máy tính: 12 tháng</li>
                <li>Phụ kiện điện tử: 6 tháng</li>
                <li>Thời trang, mỹ phẩm: không áp dụng bảo hành</li>
                <li>Đồ gia dụng: 12-24 tháng tùy sản phẩm</li>
              </ul>

              <h3>Điều kiện bảo hành</h3>
              <p>Sản phẩm được bảo hành miễn phí khi:</p>
              <ul>
                <li>Sản phẩm còn trong thời hạn bảo hành</li>
                <li>Có phiếu bảo hành và hóa đơn mua hàng</li>
                <li>Tem bảo hành còn nguyên vẹn</li>
                <li>Lỗi kỹ thuật được xác nhận bởi trung tâm bảo hành</li>
              </ul>

              <h3>Không bảo hành</h3>
              <p>Sản phẩm không được bảo hành trong các trường hợp:</p>
              <ul>
                <li>Hết thời hạn bảo hành</li>
                <li>Không có phiếu bảo hành hoặc hóa đơn mua hàng</li>
                <li>Tem bảo hành bị rách, vỡ, bị sửa đổi</li>
                <li>Sản phẩm bị hư hỏng do thiên tai, hỏa hoạn</li>
                <li>Sản phẩm bị hư hỏng do sử dụng sai hướng dẫn</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "payment" && (
          <div className={styles.policySection}>
            <h2>Phương Thức Thanh Toán</h2>
            <div className={styles.sectionContent}>
              <h3>Thanh toán khi nhận hàng (COD)</h3>
              <p>
                Khách hàng thanh toán trực tiếp cho nhân viên giao hàng khi nhận
                sản phẩm.
              </p>

              <h3>Chuyển khoản ngân hàng</h3>
              <p>Khách hàng có thể chuyển khoản đến tài khoản công ty:</p>
              <div className={styles.bankInfo}>
                <p>
                  <strong>Ngân hàng:</strong> Vietcombank
                </p>
                <p>
                  <strong>Số tài khoản:</strong> 0123456789
                </p>
                <p>
                  <strong>Chủ tài khoản:</strong> Công ty ABC
                </p>
                <p>
                  <strong>Nội dung:</strong> [Mã đơn hàng] - [Số điện thoại]
                </p>
              </div>

              <h3>Thanh toán online</h3>
              <p>Chúng tôi chấp nhận nhiều hình thức thanh toán online:</p>
              <div className={styles.paymentMethods}>
                <div className={styles.paymentMethod}>
                  <span>Thẻ nội địa (ATM)</span>
                </div>
                <div className={styles.paymentMethod}>
                  <span>Thẻ quốc tế (Visa/Mastercard)</span>
                </div>
                <div className={styles.paymentMethod}>
                  <span>Ví điện tử (Momo, ZaloPay, VNPay)</span>
                </div>
                <div className={styles.paymentMethod}>
                  <span>Trả góp 0% qua thẻ tín dụng</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "faq" && (
          <div className={styles.policySection}>
            <h2>Câu Hỏi Thường Gặp</h2>
            <div className={styles.faqContainer}>
              {faqs.map((faq) => (
                <div key={faq.id} className={styles.faqItem}>
                  <div
                    className={styles.faqQuestion}
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <h3>{faq.question}</h3>
                    <span
                      className={
                        expandedFaqs[faq.id] ? styles.arrowUp : styles.arrowDown
                      }
                    ></span>
                  </div>
                  {expandedFaqs[faq.id] && (
                    <div className={styles.faqAnswer}>
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className={styles.contactInfo}>
        <h3>Bạn cần thêm thông tin?</h3>
        <p>Vui lòng liên hệ với chúng tôi qua:</p>
        <div className={styles.contactMethods}>
          <div className={styles.contactMethod}>
            <span className={styles.icon}>📞</span>
            <span>Hotline: 0335867600 (8:00 - 22:00 hàng ngày)</span>
          </div>
          <div className={styles.contactMethod}>
            <span className={styles.icon}>✉️</span>
            <span>Email: tamdaonui198@gmail.com</span>
          </div>
          <div className={styles.contactMethod}>
            <span className={styles.icon}>💬</span>
            <span>Live chat: Trên website</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dữ liệu câu hỏi thường gặp
const faqs = [
  {
    id: 1,
    question: "Tôi có thể thay đổi địa chỉ giao hàng sau khi đặt hàng không?",
    answer:
      "Bạn có thể thay đổi địa chỉ giao hàng trong vòng 24h sau khi đặt hàng, với điều kiện đơn hàng chưa được xác nhận. Vui lòng liên hệ ngay với bộ phận CSKH để được hỗ trợ.",
  },
  {
    id: 2,
    question: "Làm thế nào để theo dõi tình trạng đơn hàng của tôi?",
    answer:
      "Bạn có thể theo dõi đơn hàng bằng cách đăng nhập vào tài khoản trên website, kiểm tra email xác nhận đơn hàng hoặc sử dụng mã vận đơn được gửi qua SMS sau khi đơn hàng được giao cho đơn vị vận chuyển.",
  },
  {
    id: 3,
    question: "Tôi có thể hủy đơn hàng sau khi đã đặt không?",
    answer:
      "Bạn có thể hủy đơn hàng trong vòng 12h sau khi đặt hàng và đơn hàng chưa được xác nhận. Sau thời gian này, vui lòng liên hệ trực tiếp với bộ phận CSKH để được hỗ trợ tốt nhất.",
  },
  {
    id: 4,
    question: "Nếu sản phẩm hết hàng thì sao?",
    answer:
      "Khi sản phẩm hết hàng, chúng tôi sẽ thông báo cho bạn qua email hoặc điện thoại. Bạn có thể chọn đổi sang sản phẩm tương tự, đặt trước khi có hàng, hoặc hủy đơn và nhận lại tiền.",
  },
  {
    id: 5,
    question: "Tôi cần làm gì khi nhận được sản phẩm bị lỗi?",
    answer:
      "Khi nhận được sản phẩm bị lỗi, bạn cần chụp ảnh sản phẩm và liên hệ ngay với bộ phận CSKH trong vòng 48h. Chúng tôi sẽ hướng dẫn bạn quy trình đổi/trả sản phẩm trong thời gian sớm nhất.",
  },
  {
    id: 6,
    question: "Có thể thanh toán bằng ngoại tệ không?",
    answer:
      "Hiện tại, chúng tôi chỉ chấp nhận thanh toán bằng VND. Đối với thẻ quốc tế, hệ thống sẽ tự động quy đổi sang VND theo tỷ giá hiện hành của ngân hàng phát hành thẻ.",
  },
];

export default ProductPolicyPage;
