const ForbiddenPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white shadow-xl rounded-lg p-8 max-w-md w-full text-center">
                <div className="flex justify-center mb-6">

                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    403 - Forbidden
                </h1>

                <p className="text-gray-600 mb-6">
                    Bạn không có quyền truy cập trang này.
                </p>

            </div>
        </div>
    );
};

export default ForbiddenPage;