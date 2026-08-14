import React from 'react';
import {Input} from "antd";

const FilterComponent = ({
                             child, label
                         }) => {
    return (
        <div className={"col-md-4"}>
            <div className={"d-flex gap-3"}>
                <div className={"w-25"}>
                    <label>{label}</label>
                </div>
                <div className={"w-75"}>
                    {child}
                </div>

            </div>
        </div>
    );
};

export default FilterComponent;