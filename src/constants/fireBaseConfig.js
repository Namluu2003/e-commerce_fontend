
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCzEHrLIXW-ONA1LhRf-ooNYP5UjE4ex0Q",
  authDomain: "appdatn-358be.firebaseapp.com",
  projectId: "appdatn-358be",
  storageBucket: "appdatn-358be.firebasestorage.app",
  messagingSenderId: "696034162539",
  appId: "1:696034162539:web:0eb55437089815fef4be2e",
  measurementId: "G-MGKYML2KW3"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Firebase Storage
export const storage = getStorage(app);

// Xuất Analytics nếu cần
export const analytics = getAnalytics(app);