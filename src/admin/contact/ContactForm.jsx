import React, { useState } from 'react';
import styles from './ContactForm.module.css';

function ContactForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState({}); // State để lưu lỗi validation

  // Hàm kiểm tra validation cho form
  const validateForm = () => {
    const newErrors = {};

    // Kiểm tra tên
    if (!name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên.';
    }

    // Kiểm tra số điện thoại (Regex cơ bản cho SĐT Việt Nam)
    if (!phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại.';
    } else if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(phone)) {
       // Regex này kiểm tra: Bắt đầu bằng 0 hoặc +84, tiếp theo là đầu số 3, 5, 7, 8, 9, và sau đó là 8 chữ số.
      newErrors.phone = 'Số điện thoại không hợp lệ (VD: 09xxxxxxxx hoặc +849xxxxxxxx).';
    }

    // Kiểm tra email
    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập email.';
    } else if (!/\S+@\S+\.\S+/.test(email)) { // Regex đơn giản kiểm tra định dạng email
      newErrors.email = 'Địa chỉ email không hợp lệ.';
    }

    // Kiểm tra nội dung
    if (!content.trim()) {
      newErrors.content = 'Nhập nội dung cần gửi.';
    }

    setErrors(newErrors); // Cập nhật state lỗi
    return Object.keys(newErrors).length === 0; // Trả về true nếu không có lỗi
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Cập nhật giá trị cho state tương ứng
    if (name === 'name') setName(value);
    else if (name === 'phone') setPhone(value);
    else if (name === 'email') setEmail(value);
    else if (name === 'content') setContent(value);

    // Xóa lỗi của trường đang nhập khi người dùng thay đổi giá trị
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: null // Hoặc undefined
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = validateForm(); // Thực hiện validation

    if (isValid) {
      // Nếu form hợp lệ
      console.log('Form hợp lệ, chuẩn bị gửi:', { name, phone, email, content });
      // --- Ở đây bạn sẽ thực hiện gửi dữ liệu lên server (API call) ---

      // Reset form sau khi gửi thành công
      setName('');
      setPhone('');
      setEmail('');
      setContent('');
      setErrors({}); // Xóa hết lỗi
      alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.');
    } else {
      // Nếu form không hợp lệ
      console.log('Form có lỗi validation:', errors);
      // Không làm gì thêm, lỗi đã được hiển thị trên UI
    }
  };

  return (
    <div className={styles.contactWrapper}>
      <div className={styles.contactContainer}>
        <div className={styles.storeInfoSection}>
          {/* Phần thông tin cửa hàng giữ nguyên */}
          <div className={styles.storeImageContainer}>
            <img src="https://authentic-shoes.com/wp-content/uploads/2023/04/272082a52d9bd7c58e8a_63946c68e6714d38b63b68c9f6bd1ce6_2048x2048.webp" alt="The Hands Store" className={styles.storeImage} />
          </div>
          <div className={styles.storeDescription}>
            <h3>The Hands international</h3>
            <p>
              Được thành lập từ năm 2015, là chuỗi bán lẻ Sneaker, Streetwear và phụ kiện thời
              trang chính hãng có thị phần số 1 Việt Nam với số lượt truy cập mua hàng tại
              website <a href="https://authentic-shoes.com">TheHands-shoes.com</a> lên tới trên 10.000 lượt mỗi ngày từ khắp 63 tỉnh
              thành trên cả nước.
            </p>
            <h3>TỪ MỘT NHÀ SƯU TẦM SNEAKER</h3>
            <ul>
              <li>
                Biết được nhu cầu của người tiêu dùng Việt Nam luôn tìm kiếm những đôi giày
                chất lượng, nhiều kiểu dáng, màu sắc mang màu sắc riêng và quan trọng nhất
                là chúng phải 100% chính hãng. <span className={styles.brandName}>The Hands</span> đã ra đời.
              </li>
              <li>
                Xuất thân là một cửa hàng Online chuyên Order Sneaker của các thương hiệu
                lớn như <a href="#">Nike</a>, <a href="#">Adidas</a> hay <a href="#">Puma</a>, <a href="#">MLB</a>... trên thế giới từ Mỹ, Anh Quốc, Pháp,
                Nhật... Trải qua 4 năm hình thành và phát triển, <span className={styles.brandName}>The Hands</span> đã giải quyết
                được phần nào mong muốn của người tiêu dùng. Nhưng đương nhiên họ không
                dừng lại ở đó, Sneaker thôi là chưa đủ.
              </li>
            </ul>
          </div>
          <div className={styles.contactInfoSection}>
            <div className={styles.contactDetail}>
              <strong>ĐỊA CHỈ TRỤ SỞ:</strong> Cao đẳng FPT Polytechnich
            </div>
            <div className={styles.contactDetail}>
              <strong>SỐ ĐIỆN THOẠI:</strong> 078 5499555
            </div>
            <div className={styles.contactDetail}>
              <strong>EMAIL:</strong> <a href="mailto:vietne263204@gmail.com">vietne263204@gmail.com</a>
            </div>
            <div className={styles.mapContainer}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.8638558814346!2d105.74459841492961!3d21.038132792834098!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454b991d80fd5%3A0x53cefc99d6b0bf6f!2sFPT%20Polytechnic%20Hanoi!5e0!3m2!1sen!2s!4v1620117061296!5m2!1sen!2s" // Thay src iframe hợp lệ
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" // Thêm referrerpolicy
                title="The Hands location"
              ></iframe>
            </div>
            <div className={styles.additionalInfo}>
              <p>Cao đẳng FPT Polytechnich</p>
              <p>Phone: (098) 491 8486 – Fax: (098) 491 8486</p>
              <p>Tổng đài mua hàng: 0913576123</p>
              <p>Tổng đài CSKH: 0984918486</p>
              <p>Thời gian làm việc tổng đài CSKH: 8:30 – 17h30 (Thứ 2 – Thứ 7)</p>
            </div>
          </div>
        </div>

        <div className={styles.contactFormSection}>
          <div className={styles.formBox}>
            <h2>GỬI THÔNG TIN LIÊN HỆ</h2>
            <p className={styles.formDesc}>Quý khách vui lòng để lại thông tin liên hệ, The Hands sẽ liên hệ với quý khách trong thời gian sớm nhất.</p>

            <form className={styles.contactForm} onSubmit={handleSubmit} noValidate> {/* Thêm noValidate để tắt validation mặc định của trình duyệt */}
              <div className={styles.formGroup}>
                <label htmlFor="name">Họ và tên <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={handleChange}
                  // required // Không cần thiết khi đã có JS validation
                  placeholder="Nhập họ và tên"
                  className={errors.name ? styles.inputError : ''} // Thêm class khi có lỗi
                  aria-invalid={errors.name ? "true" : "false"} // Accessibility
                  aria-describedby={errors.name ? "name-error" : undefined} // Accessibility
                />
                {/* Hiển thị lỗi nếu có */}
                {errors.name && <span id="name-error" className={styles.errorMessage}>{errors.name}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone">Điện thoại <span className={styles.required}>*</span></label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                  className={errors.phone ? styles.inputError : ''}
                  aria-invalid={errors.phone ? "true" : "false"}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                />
                {errors.phone && <span id="phone-error" className={styles.errorMessage}>{errors.phone}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email <span className={styles.required}>*</span></label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ email"
                  className={errors.email ? styles.inputError : ''}
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && <span id="email-error" className={styles.errorMessage}>{errors.email}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="content">Nội dung <span className={styles.required}>*</span></label>
                <textarea
                  id="content"
                  name="content"
                  value={content}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Nhập nội dung liên hệ"
                  className={errors.content ? styles.inputError : ''}
                  aria-invalid={errors.content ? "true" : "false"}
                  aria-describedby={errors.content ? "content-error" : undefined}
                ></textarea>
                {errors.content && <span id="content-error" className={styles.errorMessage}>{errors.content}</span>}
              </div>

              <button type="submit" className={styles.submitButton}>GỬI THÔNG TIN</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactForm;