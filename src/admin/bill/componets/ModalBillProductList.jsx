import React, {useState} from 'react';
import {Modal, Table} from "antd";
import {columnsBillProductTable} from "../columns/columns.jsx";
import ModalConfirmUpdateStatusBill from "./ModalConfirmUpdateStatusBill.jsx";
import { Radio } from 'antd';
const ModalBillProductList = ({billProductList}) => {


    const [widthModal, setWidthModal] = useState('50%')
    const [open, setOpen] = useState()
    const [currentRecord, setCurrentRecord] = useState({});

    const handleOkModal = () => {

    };

    const handleCancel = () => {

        setOpen(false);
    };


    const handleActionClick = (record) => {
        console.log(record)
        setCurrentRecord(record)
        setOpen(true);

    };

    return (
        <div>
            <div>
                <h3>Danh sách sản phẩm</h3>
            </div>

            <Modal
                width={widthModal}
                open={open}
                onOk={handleOkModal}
                onCancel={handleCancel}
            >
                <div>
                    <div>
                        Số lượng có sẵn : {currentRecord?.totalQuantity}
                    </div>
                    <div>
                        Màu : {currentRecord?.colors?.map((color) => color.colorName)}
                    </div>
                    <div>
                        giới tính : {currentRecord?.genders?.map((gender) => gender.genderName)}
                    </div>
                    <div>
                        material : {currentRecord?.materials?.map((material) => material.materialName)}
                    </div>
                    <div>
                        <h3 style={{ marginTop: "20px" }}>Size:</h3>
                        <Radio.Group
                            buttonStyle="solid"
                        >
                            {currentRecord?.sizes?.map((size) => (
                                <Radio.Button key={size} value={size}>
                                    {size.sizeName}
                                </Radio.Button>
                            ))}
                        </Radio.Group>
                    </div>
                    <div>
                        soles : {currentRecord?.soles?.map((sole) => sole.soleName)}
                    </div>
                    <div>
                        types : {currentRecord?.types?.map((type) => type.typeName)}
                    </div>
                    {currentRecord.id}
                </div>

            </Modal>

            <Table
                className={""}
                pagination={false}
                columns={columnsBillProductTable(handleActionClick)}
                dataSource={billProductList}
            />
        </div>
    );
};

export default ModalBillProductList;