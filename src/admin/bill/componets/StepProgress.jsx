import React from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
import {GrCaretNext} from "react-icons/gr";
import BlurBillHistoryComponent from "./BlurBillHistoryComponent.jsx";
import {LuClipboardCheck, LuClipboardPenLine} from "react-icons/lu";
import {FaTruckArrowRight, FaTruckFast} from "react-icons/fa6";
import {LiaAmazonPay} from "react-icons/lia";
import {convertBillStatusToString, convertLongTimestampToDate} from "../../../helpers/Helpers.js";
import {CiBookmarkPlus} from "react-icons/ci";
import {HiOutlineShieldCheck} from "react-icons/hi";
import {FcCancel} from "react-icons/fc";

const StepProgress = ({steps, currentStep, billHistoryList}) => {
    const defaultStep = 6;

    const sizeIcon = 42;

    const genIconStepBySatatus = (step) => {
        switch (step) {
            case "TAO_DON_HANG":
                return <CiBookmarkPlus size={sizeIcon}/>;
            case "CHO_XAC_NHAN":
                return <LuClipboardPenLine size={sizeIcon}/>;
            case "DA_XAC_NHAN":
                return <LuClipboardCheck size={sizeIcon}/>;
            case "CHO_VAN_CHUYEN":
                return <FaTruckArrowRight size={sizeIcon}/>;
            case "DANG_VAN_CHUYEN":
                return <FaTruckFast size={sizeIcon}/>;
            case "DA_GIAO_HANG":
                return <LuClipboardCheck size={sizeIcon}/>;
            case "DA_THANH_TOAN":
                return <LiaAmazonPay size={sizeIcon}/>;
            case "DA_HOAN_THANH":
                return <LuClipboardCheck size={sizeIcon}/>;
            case "DANG_XAC_MINH":
                return <HiOutlineShieldCheck size={sizeIcon}/>;
            case "DA_HUY":
                return <FcCancel  size={sizeIcon}/>;
            default:
                return <CiBookmarkPlus size={sizeIcon}/>;
        }
    }

    const fullBillHistoryList = [...billHistoryList];
    while (fullBillHistoryList.length < defaultStep) {
        fullBillHistoryList.push({
            id: `placeholder-${fullBillHistoryList.length}`,
            status: null,
            createdAt: null,
        });
    }

    return (
        <div className="d-flex align-items-center" style={{overflowX: 'auto', whiteSpace: 'nowrap'}}>
            {fullBillHistoryList.map((step, index) => (
                <div
                    key={step.id}
                    className="text-center position-relative"
                    style={{
                        color: index + 1 <= currentStep ? "#0d6efd" : "#adb5bd",
                        minWidth: '220px',
                        display: 'inline-block'
                    }}
                >
                    {/* Biểu tượng và tiêu đề */}
                    <div
                        className={`rounded-circle mb-4 d-flex justify-content-center align-items-center mx-auto`}
                        style={{
                            width: "80px",
                            height: "80px",
                            zIndex: 10,
                            backgroundColor: index + 1 <= currentStep ? "#0d6efd" : "#adb5bd",
                            color: "white",
                            fontSize: "24px",
                        }}
                    >
                        <div style={{zIndex: 10}}>
                            {genIconStepBySatatus(step.status)}
                        </div>
                    </div>

                    <div className="arrow-container">
                        <div
                            style={{
                                width: 1.2,
                                height: 80,
                                backgroundColor: index + 1 <= currentStep ? "#0d6efd" : "#adb5bd",
                            }}
                            className={"position-absolute bottom-50 text-black"}>

                        </div>
                        <div
                            style={{
                                backgroundColor: index + 1 <= currentStep ? "#0d6efd" : "#adb5bd",
                            }}
                            className="arrow">
                            <div className="circle"></div>
                        </div>
                    </div>
                    <div
                        className={"d-flex gap-2 justify-content-center flex-column "}
                        style={{
                            height: 60,
                        }}>
                        <div className=" m-0 fw-bold ">
                            {fullBillHistoryList.length > 0 ? (convertBillStatusToString(fullBillHistoryList[index]?.status) ??
                                <BlurBillHistoryComponent/>) : <BlurBillHistoryComponent/>
                            }
                        </div>
                        <p className=" fw-bold d-flex flex-column m-0">
                            {fullBillHistoryList.length > 0 ? (convertLongTimestampToDate(fullBillHistoryList[index]?.createdAt) ??
                                <BlurBillHistoryComponent/>) : <BlurBillHistoryComponent/>
                            }
                        </p>
                    </div>

                    <div style={{
                        height: 50
                    }}>

                    </div>

                </div>
            ))}
        </div>
    );
};

export default StepProgress