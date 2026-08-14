import React from "react";
import TextArea from "antd/es/input/TextArea.js";

const ModalConfirmUpdateStatusBill = ({
  notesUpdateStatusBillInput,
  onChangeNotesUpdateStatusBillInput,
}) => {
  return (
    <div>
      <div className={"mb-4 w"}>
        <h3>Ghi chú</h3>
      </div>
      <TextArea
        value={notesUpdateStatusBillInput}
        onChange={onChangeNotesUpdateStatusBillInput}
        placeholder="Nhập ghi chú"
        autoSize={{ minRows: 3, maxRows: 5 }}
      />
    </div>
  );
};

export default ModalConfirmUpdateStatusBill;
