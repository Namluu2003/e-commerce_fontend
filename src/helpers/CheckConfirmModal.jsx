import { Modal } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";

const { confirm } = Modal;

export const checkConfirmModal = ({
                                 title = "Are you sure?",
                                 content = "This action cannot be undone.",
                                 icon = <ExclamationCircleFilled />,
                                 okText = "OK",
                                 cancelText = "Cancel",
                                 okType = "primary",
                             } = {}) => {
    return new Promise((resolve) => {
        confirm({
            title,
            icon,
            content,
            okText,
            cancelText,
            okType,
            onOk: () => resolve(true),
            onCancel: () => resolve(false),
        });
    });
};
