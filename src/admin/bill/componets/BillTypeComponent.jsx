import React from 'react';
import {Button, Tag} from "antd";
import {COLORS} from "../../../constants/constants.js";
import {convertBillStatusToString} from "../../../helpers/Helpers.js";

const BillTypeComponent = ({
                               status, text, color = "green"
                           }) => {
    return (
        <div>
            <Tag
                style={{
                    fontSize: 16
                }}
                color={color}>
                {text}
            </Tag>

        </div>
    );
};

export default BillTypeComponent;