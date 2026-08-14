import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCzEHrLIXW-ONA1LhRf-ooNYP5UjE4ex0Q",
    authDomain: "appdatn-358be.firebaseapp.com",
    projectId: "appdatn-358be",
    storageBucket: "appdatn-358be.firebasestorage.app",
    messagingSenderId: "696034162539",
    appId: "1:696034162539:web:0eb55437089815fef4be2e",
    measurementId: "G-MGKYML2KW3",
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
