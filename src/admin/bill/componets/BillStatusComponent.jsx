import React from 'react';
import {Button} from "antd";
import {COLORS} from "../../../constants/constants.js";
import {convertBillStatusToString} from "../../../helpers/Helpers.js";

const BillStatusComponent = ({
    status, text
                         }) => {
    return (
        <div>

            <Button

                disabled
                style={{
                    borderRadius: '20px',
                    padding: '6px 12px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    backgroundColor: status === 'DANG_HOAT_DONG' ? `${COLORS.success}` : `${COLORS.error}`,
                    color: 'white'
                }}
            >
                {convertBillStatusToString(text)}
            </Button>

        </div>
    );
};

export default BillStatusComponent;