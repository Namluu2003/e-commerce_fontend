import React, { useState } from "react";
import useAuthStore from "../auth/useAuthStore";
import {useNavigate} from "react-router";



const LoginPage = () => {

    const login = useAuthStore((state) => state.login);
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();


    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (username === "admin" && password === "password123") {
            login({ name: "John Doe", role: "admin" });
            navigate("/admin")
        } else if (username === "client" && password === "password123") {
            login({ name: "John Doe", role: "client" });
            navigate("/user")
        } else {
            setError("Sai tên đăng nhập hoặc mật khẩu!");
        }
    };

    return (
        <div>
            <h2>Đăng Nhập</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Tên đăng nhập:
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Mật khẩu:
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </label>
                </div>
                <button type="submit">Đăng nhập</button>
            </form>
        </div>
    );
};

export default LoginPage;
