// import React, {Component} from 'react';
import useAuthStore from "../auth/useAuthStore";

const UserPage = () => {
    const user = useAuthStore((state) => state.user);

    if (!user) {
        return <div>Bạn chưa đăng nhập!</div>;
    }

    return (
        <div>
            <h1>{user.name}</h1>
        </div>
    );
}


export default UserPage;