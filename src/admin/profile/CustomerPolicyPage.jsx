import React, { useState } from 'react';
import styles from './CustomerPolicyPage.module.css';

const CustomerPolicyPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [expandedFaqs, setExpandedFaqs] = useState({});
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const toggleFaq = (faqId) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [faqId]: !prev[faqId]
    }));
  };

  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedbackForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const submitFeedback = (e) => {
    e.preventDefault();
    console.log('Feedback submitted:', feedbackForm);
    setFeedbackSubmitted(true);
    setFeedbackForm({
      name: '',
      email: '',
      message: ''
    });
    
    setTimeout(() => {
      setFeedbackSubmitted(false);
    }, 3000);
  };

  const policies = {
    general: {
      title: 'Chính Sách Chung',
      content: (
        <>
          <h3>Giới thiệu về chúng tôi</h3>
          <p>Chúng tôi cam kết mang đến cho khách hàng những sản phẩm chất lượng cao với dịch vụ tốt nhất. Mục tiêu của chúng tôi là đảm bảo sự hài lòng của khách hàng và xây dựng mối quan hệ lâu dài trên sự tin cậy và minh bạch.</p>
          
          <h3>Điều khoản sử dụng</h3>
          <p>Bằng việc sử dụng trang web của chúng tôi, quý khách đồng ý với các điều khoản và điều kiện được quy định. Chúng tôi có quyền thay đổi các điều khoản này vào bất kỳ thời điểm nào mà không cần thông báo trước.</p>
          
          <h3>Quy định về sản phẩm</h3>
          <p>Tất cả sản phẩm được bán trên trang web của chúng tôi đều được mô tả chính xác nhất có thể. Tuy nhiên, chúng tôi không thể đảm bảo rằng tất cả các thông tin đều hoàn toàn chính xác, và màu sắc thực tế của sản phẩm có thể khác một chút so với hình ảnh hiển thị do cài đặt màn hình.</p>
        </>
      )
    },
    shipping: {
      title: 'Chính Sách Vận Chuyển',
      content: (
        <>
          <h3>Phạm vi giao hàng</h3>
          <p>Chúng tôi cung cấp dịch vụ giao hàng trên toàn quốc. Thời gian giao hàng dự kiến từ 2-5 ngày làm việc tùy thuộc vào khu vực.</p>
          
          <h3>Phí vận chuyển</h3>
          <p>Phí vận chuyển được tính dựa trên khoảng cách và trọng lượng của đơn hàng. Khách hàng sẽ được thông báo chi phí vận chuyển trước khi xác nhận đơn hàng.</p>
          
          <h3>Miễn phí vận chuyển</h3>
          <p>Đơn hàng có giá trị từ 500.000đ trở lên sẽ được miễn phí vận chuyển trong phạm vi 20km tính từ cửa hàng gần nhất. Chúng tôi thường xuyên có các chương trình khuyến mãi miễn phí vận chuyển, vui lòng theo dõi website để không bỏ lỡ!</p>
          
          <h3>Theo dõi đơn hàng</h3>
          <p>Sau khi đơn hàng được gửi đi, quý khách sẽ nhận được email xác nhận kèm theo mã vận đơn để theo dõi tiến trình giao hàng trên trang web của chúng tôi hoặc đối tác vận chuyển.</p>
        </>
      )
    },
    returns: {
      title: 'Chính Sách Đổi Trả',
      content: (
        <>
          <h3>Điều kiện đổi trả</h3>
          <p>Quý khách có thể yêu cầu đổi trả hàng trong vòng 7 ngày kể từ ngày nhận được sản phẩm nếu:</p>
          <ul>
            <li>Sản phẩm bị lỗi sản xuất</li>
            <li>Sản phẩm không đúng mô tả hoặc không đúng mẫu mã</li>
            <li>Sản phẩm bị hư hỏng trong quá trình vận chuyển</li>
          </ul>
          
          <h3>Quy trình đổi trả</h3>
          <p>Để yêu cầu đổi trả, quý khách vui lòng liên hệ với bộ phận chăm sóc khách hàng của chúng tôi qua email hoặc hotline. Quý khách cần cung cấp hình ảnh sản phẩm lỗi và mã đơn hàng để chúng tôi xử lý nhanh chóng.</p>
          
          <h3>Chi phí đổi trả</h3>
          <p>Trong trường hợp sản phẩm bị lỗi từ nhà sản xuất hoặc không đúng với mô tả, chúng tôi sẽ chịu toàn bộ chi phí đổi trả. Nếu quý khách đổi trả vì lý do cá nhân (không thích, không vừa size), quý khách sẽ chịu phí vận chuyển hai chiều.</p>
          
          <h3>Hoàn tiền</h3>
          <p>Thời gian hoàn tiền dự kiến từ 3-7 ngày làm việc kể từ khi chúng tôi nhận được sản phẩm trả về. Tùy vào phương thức thanh toán ban đầu, chúng tôi sẽ hoàn tiền qua cùng phương thức hoặc chuyển khoản ngân hàng theo thông tin quý khách cung cấp.</p>
        </>
      )
    },
    payment: {
      title: 'Chính Sách Thanh Toán',
      content: (
        <>
          <h3>Phương thức thanh toán</h3>
          <p>Chúng tôi chấp nhận nhiều phương thức thanh toán khác nhau để tạo thuận lợi cho quý khách:</p>
          <ul>
            <li>Thanh toán khi nhận hàng (COD)</li>
            <li>Chuyển khoản ngân hàng</li>
            <li>Thanh toán qua thẻ tín dụng/ghi nợ</li>
            <li>Ví điện tử (MoMo, ZaloPay, VNPay)</li>
          </ul>
          
          <h3>Bảo mật thanh toán</h3>
          <p>Tất cả thông tin thanh toán của quý khách đều được bảo mật và mã hóa theo tiêu chuẩn quốc tế SSL. Chúng tôi không lưu trữ thông tin thẻ tín dụng của khách hàng trên hệ thống của mình.</p>
          
          <h3>Xác nhận đơn hàng</h3>
          <p>Sau khi đặt hàng thành công, quý khách sẽ nhận được email xác nhận đơn hàng kèm theo thông tin thanh toán chi tiết. Đơn hàng chỉ được xử lý sau khi chúng tôi xác nhận thanh toán thành công.</p>
        </>
      )
    },
    privacy: {
      title: 'Chính Sách Bảo Mật',
      content: (
        <>
          <h3>Thu thập thông tin</h3>
          <p>Chúng tôi chỉ thu thập những thông tin cần thiết để xử lý đơn hàng và cải thiện trải nghiệm mua sắm của quý khách, bao gồm:</p>
          <ul>
            <li>Thông tin cá nhân: tên, địa chỉ, số điện thoại, email</li>
            <li>Thông tin đơn hàng: sản phẩm đã mua, ngày mua, phương thức thanh toán</li>
            <li>Thông tin truy cập: IP, loại thiết bị, trình duyệt</li>
          </ul>
          
          <h3>Sử dụng thông tin</h3>
          <p>Thông tin của quý khách sẽ được sử dụng để:</p>
          <ul>
            <li>Xử lý và giao đơn hàng</li>
            <li>Liên hệ khi cần thiết về đơn hàng</li>
            <li>Gửi thông báo về chương trình khuyến mãi (nếu quý khách đồng ý)</li>
            <li>Cải thiện chất lượng dịch vụ và sản phẩm</li>
          </ul>
          
          <h3>Bảo vệ thông tin</h3>
          <p>Chúng tôi cam kết bảo vệ thông tin cá nhân của quý khách bằng các biện pháp bảo mật tiên tiến nhất. Chúng tôi không chia sẻ thông tin của quý khách với bất kỳ bên thứ ba nào ngoại trừ đối tác vận chuyển để thực hiện giao hàng.</p>
          
          <h3>Quyền của khách hàng</h3>
          <p>Quý khách có quyền yêu cầu truy cập, sửa đổi hoặc xóa thông tin cá nhân của mình bất kỳ lúc nào bằng cách liên hệ với bộ phận chăm sóc khách hàng của chúng tôi.</p>
        </>
      )
    },
    warranty: {
      title: 'Chính Sách Bảo Hành',
      content: (
        <>
          <h3>Thời hạn bảo hành</h3>
          <p>Tất cả sản phẩm được bán trên trang web của chúng tôi đều có thời hạn bảo hành tối thiểu 12 tháng tính từ ngày mua. Một số sản phẩm có thể có thời hạn bảo hành dài hơn, được ghi rõ trong mô tả sản phẩm.</p>
          
          <h3>Phạm vi bảo hành</h3>
          <p>Chính sách bảo hành của chúng tôi chỉ áp dụng cho các lỗi từ nhà sản xuất và không bao gồm những hư hỏng do sử dụng không đúng cách, tai nạn, hoặc hao mòn thông thường.</p>
          
          <h3>Quy trình bảo hành</h3>
          <p>Để yêu cầu bảo hành, quý khách vui lòng liên hệ với bộ phận chăm sóc khách hàng và cung cấp:</p>
          <ul>
            <li>Hóa đơn mua hàng hoặc mã đơn hàng</li>
            <li>Mô tả chi tiết về lỗi sản phẩm</li>
            <li>Hình ảnh hoặc video về lỗi (nếu có thể)</li>
          </ul>
          
          <h3>Trung tâm bảo hành</h3>
          <p>Chúng tôi có các trung tâm bảo hành ủy quyền tại các thành phố lớn. Quý khách có thể mang sản phẩm trực tiếp đến trung tâm hoặc gửi qua đường bưu điện trong trường hợp không có trung tâm gần khu vực của quý khách.</p>
        </>
      )
    }
  };

  const faqs = [
    {
      id: 1,
      question: 'Tôi có thể theo dõi đơn hàng của mình như thế nào?',
      answer: 'Quý khách có thể theo dõi đơn hàng bằng cách đăng nhập vào tài khoản, vào mục "Đơn hàng của tôi" và nhấp vào đơn hàng cần theo dõi. Ngoài ra, quý khách cũng có thể theo dõi thông qua liên kết được gửi trong email xác nhận đơn hàng.'
    },
    {
      id: 2,
      question: 'Tôi có thể hủy đơn hàng sau khi đã đặt không?',
      answer: 'Có, quý khách có thể hủy đơn hàng trong vòng 24 giờ sau khi đặt hàng và trước khi đơn hàng được giao cho đơn vị vận chuyển. Để hủy đơn hàng, vui lòng liên hệ ngay với bộ phận chăm sóc khách hàng qua hotline hoặc email.'
    },
    {
      id: 3,
      question: 'Làm thế nào để tôi đổi size hoặc màu sắc sản phẩm?',
      answer: 'Quý khách có thể yêu cầu đổi size hoặc màu sắc trong vòng 7 ngày kể từ ngày nhận hàng, với điều kiện sản phẩm chưa qua sử dụng và còn nguyên tem, nhãn, hộp đựng. Vui lòng liên hệ với bộ phận chăm sóc khách hàng để được hướng dẫn quy trình đổi hàng.'
    },
    {
      id: 4,
      question: 'Tôi có thể thanh toán bằng ngoại tệ không?',
      answer: 'Hiện tại, chúng tôi chỉ chấp nhận thanh toán bằng VNĐ. Nếu quý khách sử dụng thẻ tín dụng quốc tế, ngân hàng của quý khách sẽ tự động quy đổi sang VNĐ theo tỷ giá hiện hành và có thể áp dụng phí chuyển đổi ngoại tệ.'
    },
    {
      id: 5,
      question: 'Làm thế nào để tôi biết size nào phù hợp với mình?',
      answer: 'Chúng tôi cung cấp bảng kích thước chi tiết cho từng loại sản phẩm. Quý khách có thể tham khảo bảng kích thước này trong phần mô tả sản phẩm. Nếu quý khách vẫn không chắc chắn, vui lòng liên hệ với bộ phận tư vấn của chúng tôi để được hỗ trợ.'
    }
  ];

  return (
    <div className={styles.policyContainer}>
      <div className={styles.policyHeader}>
        <h1>Chính Sách Khách Hàng</h1>
        <p>Chúng tôi luôn đặt khách hàng làm trọng tâm trong mọi hoạt động</p>
      </div>

      <div className={styles.policyWrapper}>
        <aside className={styles.policySidebar}>
          <nav className={styles.policyNav}>
            {Object.keys(policies).map(policyKey => (
              <button 
                key={policyKey}
                className={activeTab === policyKey ? styles.activeTab : ''}
                onClick={() => handleTabClick(policyKey)}
              >
                {policies[policyKey].title}
              </button>
            ))}
          </nav>
        </aside>

        <main className={styles.policyMain}>
          <section className={styles.policyContent}>
            <h2>{policies[activeTab].title}</h2>
            <div className={styles.policyText}>
              {policies[activeTab].content}
            </div>
          </section>

          <section className={styles.faqSection}>
            <h2>Câu Hỏi Thường Gặp</h2>
            <div className={styles.faqList}>
              {faqs.map(faq => (
                <details 
                  key={faq.id} 
                  className={styles.faqItem}
                  open={expandedFaqs[faq.id]}
                  onClick={(e) => {
                    if (e.target.tagName !== 'SUMMARY') return;
                    e.preventDefault();
                    toggleFaq(faq.id);
                  }}
                >
                  <summary className={styles.faqQuestion}>
                    {faq.question}
                  </summary>
                  <div className={styles.faqAnswer}>
                    <p>{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section className={styles.feedbackSection}>
            <h2>Góp Ý Chính Sách</h2>
            <p>Chúng tôi luôn lắng nghe ý kiến đóng góp từ khách hàng để cải thiện chính sách và dịch vụ.</p>
            
            {feedbackSubmitted ? (
              <div className={styles.successMessage}>
                <p>Cảm ơn quý khách đã gửi góp ý. Chúng tôi sẽ xem xét và phản hồi trong thời gian sớm nhất!</p>
              </div>
            ) : (
              <form className={styles.feedbackForm} onSubmit={submitFeedback}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">Họ tên</label>
                    <input 
                      type="text" 
                      id="name"
                      name="name"
                      value={feedbackForm.name}
                      onChange={handleFeedbackChange}
                      required 
                      placeholder="Nhập họ tên của bạn"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email</label>
                    <input 
                      type="email" 
                      id="email"
                      name="email"
                      value={feedbackForm.email}
                      onChange={handleFeedbackChange}
                      required 
                      placeholder="Nhập email của bạn"
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="message">Nội dung góp ý</label>
                  <textarea 
                    id="message"
                    name="message"
                    value={feedbackForm.message}
                    onChange={handleFeedbackChange}
                    rows="4"
                    required
                    placeholder="Nhập nội dung góp ý của bạn"
                  ></textarea>
                </div>
                
                <button type="submit" className={styles.submitBtn}>Gửi góp ý</button>
              </form>
            )}
          </section>
        </main>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerInfo}>
            <div className={styles.companyInfo}>
              <h3>StoreName</h3>
              <p>Địa chỉ: 123 Đường ABC, Quận XYZ</p>
              <p>TP. Hồ Chí Minh, Việt Nam</p>
              <p>Email: support@storename.com</p>
              <p>Hotline: 1900 1234 567</p>
            </div>
            
            <div className={styles.footerLinks}>
              <div className={styles.linkGroup}>
                <h4>Về Chúng Tôi</h4>
                <ul>
                  <li><a href="#about">Giới thiệu</a></li>
                  <li><a href="#blog">Blog</a></li>
                  <li><a href="#careers">Tuyển dụng</a></li>
                </ul>
              </div>
              
              <div className={styles.linkGroup}>
                <h4>Hỗ Trợ</h4>
                <ul>
                  <li><a href="#contact">Liên hệ</a></li>
                  <li><a href="#faq">FAQ</a></li>
                  <li><a href="#returns">Đổi trả</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className={styles.newsletter}>
            <h4>Đăng Ký Nhận Tin</h4>
            <p>Nhận thông tin về sản phẩm mới và khuyến mãi</p>
            <div className={styles.subscribeForm}>
              <input type="email" placeholder="Email của bạn" />
              <button>Đăng ký</button>
            </div>
          </div>
        </div>
        
        <div className={styles.copyright}>
          <p>&copy; {new Date().getFullYear()} StoreName. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
};

export default CustomerPolicyPage;