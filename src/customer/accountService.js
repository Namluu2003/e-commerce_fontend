export const genStringAccountStatus = (status) => {
    if (status === 0) {
        return "Hoạt động"
    }
    if (status === 1) {
        return "Đã khóa"
    }
    if (status === 2) {
        return "Chưa kích hoạt"
    }
    return "Chưa kích hoạt"
}