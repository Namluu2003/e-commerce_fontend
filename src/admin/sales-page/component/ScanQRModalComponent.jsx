import React, {useEffect, useMemo, useRef, useState} from 'react';
import {message, Modal} from "antd";
import {toast} from "react-toastify";
import * as ZXing from "@zxing/library";
import {BrowserMultiFormatReader} from "@zxing/library";
import axiosInstance from "../../../utils/axiosInstance.js";

const ScanQrModalComponent = ({
                                  isCameraOpen = false,
                                  setIsCameraOpen,
                                  handleOnAddProductToBill
                              }) => {

    const videoRef = useRef(null);
    const codeReader = new BrowserMultiFormatReader();
    const [stream, setStream] = useState(null);
    const [idProduct, setIdProduct] = useState(null);

    useEffect(() => {
        if (isCameraOpen) {
            handleOpenCamera()
        } else {
            stopCamera()
        }

    }, [isCameraOpen]);

    const handleOpenCamera = async () => {
        checkCameraPermission().then(async (hasPermission) => {
            if (hasPermission) {
                try {
                    const mediaStream = await navigator.mediaDevices.getUserMedia({video: true});
                    setStream(mediaStream); // Lưu stream vào state
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                } catch (error) {
                    console.error("Không thể mở camera:", error);
                    toast.warning("Không thể mở camera.");
                }
            } else {
                toast.warning("Không có quyền truy cập camera.");
            }
        });
    };

    // Hàm dừng camera
    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop()); // Dừng camera
            setStream(null); // Xóa stream khỏi state

        }
    };

    // Hàm kiểm tra quyền truy cập camera
    const checkCameraPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({video: true});
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            console.error("Không có quyền truy cập camera:", error);
            return false;
        }
    };

    useEffect(() => {
        if(idProduct ) {
            getProductDetail()
        }
    }, [idProduct]);

    const getProductDetail = async () => {
        try {
            const response = await axiosInstance.get(`/api/admin/productdetail/${idProduct}`)
            handleOnAddProductToBill(response.data.data)
        }catch (e) {
            console.log(e)
        }
    }

    // Xử lý QR code
    useEffect(() => {
        if (isCameraOpen && videoRef.current) {
            const codeReader = new ZXing.BrowserMultiFormatReader();
            codeReader.getVideoInputDevices().then(videoInputDevices => {
                if (videoInputDevices.length > 0) {
                    codeReader.decodeFromInputVideoDevice(videoInputDevices[0].deviceId, videoRef.current)
                        .then(result => {
                            console.log(result)
                            if (result?.text && Number(result?.text)) {
                                console.log(result?.text)
                                setIdProduct(result.text)
                                handleStopCamera()
                            }
                        })
                        .catch(err => {
                            console.error('QR Scan Error:', err);
                            stopCamera();
                        });
                } else {
                    stopCamera();
                }
            }).catch(err => {
                console.error('QR Scan Error:', err);
                stopCamera();
            });
            return () => {
                codeReader.reset();
            };
        }
    }, [isCameraOpen]);

    const handleStopCamera = () => {
        setIsCameraOpen(false)
        stopCamera(stream)
    }

    return (
        <div>
            <Modal
                title="Quét mã sả phẩm"
                visible={isCameraOpen}
                onCancel={handleStopCamera}
                footer={null}
            >
                <div>
                    <video ref={videoRef} id="video" width="100%"
                           style={{display: 'block', margin: '0 auto'}}></video>
                </div>
            </Modal>
        </div>
    );
};

export default ScanQrModalComponent;