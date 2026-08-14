import { useState, useEffect } from 'react';
import { Button, Spin } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PdfPrint = () => {
    const [pdfBlobUrl, setPdfBlobUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [numPages, setNumPages] = useState(null);

    useEffect(() => {
        try {
            const url = sessionStorage.getItem("pdfBlobUrl");
            if (url) {
                setPdfBlobUrl(url);
                setLoading(false);
            } else {
                setError("Không tìm thấy dữ liệu PDF");
            }
        } catch (err) {
            setError("Lỗi khi đọc dữ liệu PDF: " + err.message);
        }
        
        return () => {
            if (pdfBlobUrl) {
                try {
                    URL.revokeObjectURL(pdfBlobUrl);
                } catch (err) {
                    console.error("Lỗi khi giải phóng Blob URL:", err);
                }
            }
        };
    }, []);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const handlePrint = () => {
        window.print();
    };

    // Thêm CSS để ẩn các phần tử không cần thiết khi in
    useEffect(() => {
        const style = document.createElement("style");
        style.textContent = `
            @media print {
                body * {
                    visibility: hidden;
                }
                .pdf-container, .pdf-container * {
                    visibility: visible;
                }
                .pdf-container {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                }
                .print-button {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    if (loading) {
        return <Spin tip="Đang tải PDF..." />;
    }
    
    if (error) {
        return <div className="error-message">{error}</div>;
    }
    
    return (
        <div className="pdf-viewer-container" style={{ padding: "20px" }}>
            <div className="controls" style={{ marginBottom: "20px", display: "flex", justifyContent: "flex-end" }}>
                <Button 
                    className="print-button" 
                    type="primary" 
                    icon={<PrinterOutlined />} 
                    onClick={handlePrint}>
                    In hóa đơn
                </Button>
            </div>
            
            <div className="pdf-container" style={{ border: "1px solid #eee", height: "80vh", overflow: "auto" }}>
                {pdfBlobUrl ? (
                    <Document
                        file={pdfBlobUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={(err) => {
                            console.error('Lỗi khi tải tài liệu PDF:', err);
                        }}
                    >
                        {Array.from(new Array(numPages), (el, index) => (
                            <Page 
                                key={`page_${index + 1}`} 
                                pageNumber={index + 1} 
                                width={window.innerWidth * 0.8} 
                            />
                        ))}
                    </Document>
                ) : (
                    <p>Không có dữ liệu PDF</p>
                )}
            </div>
        </div>
    );
};

export default PdfPrint;
