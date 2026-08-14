// src/App.js
import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

function PhoneAuth() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [message, setMessage] = useState("");
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);

  // Thiết lập reCAPTCHA khi component mount
  useEffect(() => {
    const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible", // reCAPTCHA chạy ngầm
      callback: () => {
        setMessage("reCAPTCHA verified");
      },
    });
    setRecaptchaVerifier(verifier);

    // Cleanup khi component unmount
    return () => {
      verifier.clear();
    };
  }, []);

  // Gửi mã xác minh SMS
  const handleSendCode = async () => {
    try {
      const result = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier
      );
      setConfirmationResult(result);
      setMessage("SMS sent successfully! Please check your phone.");
    } catch (error) {
      setMessage(`Error sending SMS: ${error.message}`);
    }
  };

  // Xác minh mã OTP
  const handleVerifyCode = async () => {
    if (!confirmationResult) {
      setMessage("Please send the verification code first.");
      return;
    }
    try {
      const result = await confirmationResult.confirm(verificationCode);
      setMessage(`Signed in successfully as ${result.user.phoneNumber}`);
    } catch (error) {
      setMessage(`Error verifying code: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Phone Authentication</h1>

      {/* Container cho reCAPTCHA */}
      <div id="recaptcha-container"></div>

      {/* Nhập số điện thoại */}
      <div>
        <input
          type="text"
          placeholder="Phone number (e.g., +84123456789)"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <button onClick={handleSendCode}>Send Code</button>
      </div>

      {/* Nhập mã xác minh */}
      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Verification code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <button onClick={handleVerifyCode}>Verify Code</button>
      </div>

      {/* Hiển thị thông báo */}
      {message && <p style={{ marginTop: "20px" }}>{message}</p>}
    </div>
  );
}

export default PhoneAuth;