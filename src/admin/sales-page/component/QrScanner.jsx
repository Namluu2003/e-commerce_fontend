import React, { useEffect, useRef } from 'react';
import { BrowserQRCodeReader } from '@zxing/library';
import { toast } from 'react-toastify';

const QrScanner = ({ delay, onError, onScan, style }) => {
    const videoRef = React.useRef(null);

    useEffect(() => {
        const codeReader = new BrowserQRCodeReader();
        let isMounted = true;

        const startScan = async () => {
            try {
                const result = await codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
                    if (result && isMounted) {
                        onScan(result.getText());
                    }
                    if (err && !(err instanceof NotFoundException)) {
                        onError(err);
                    }
                });
            } catch (error) {
                onError(error);
            }
        };

        startScan();

        return () => {
            isMounted = false;
            codeReader.reset();
        };
    }, [onError, onScan]);

    return (
        <div style={style}>
            <video ref={videoRef} style={{ width: '100%' }} />
        </div>
    );
};

export default QrScanner;