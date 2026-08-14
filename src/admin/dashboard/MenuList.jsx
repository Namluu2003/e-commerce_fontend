import { Menu, Modal } from "antd";

import {useEffect, useState} from "react";

import {
  AreaChartOutlined,
  UserOutlined,
  SettingOutlined,
  ProductOutlined,
  BgColorsOutlined, CommentOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa6";
import { MdDashboard, MdLocalShipping } from "react-icons/md";
import { IoExitOutline } from "react-icons/io5";
import { GiConverseShoe } from "react-icons/gi";
import { GiRunningShoe } from "react-icons/gi";
import { MdAutoFixHigh } from "react-icons/md";
import { MdDiscount } from "react-icons/md";
import { MdCategory } from "react-icons/md";
import { TbBrand4Chan } from "react-icons/tb";
import { TbBrandDenodo } from "react-icons/tb";
import { SlSizeFullscreen } from "react-icons/sl";
import { LiaShoePrintsSolid } from "react-icons/lia";
import {FaRegUser, FaShippingFast} from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { BiSolidDiscount } from "react-icons/bi";
import { CiDiscount1 } from "react-icons/ci";
import { FaFileInvoice } from "react-icons/fa";

const MenuList = ({ darkTheme }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null)
  const [userInfo, setUserInfo] = useState(null);
  const { confirm } = Modal;

  const handleLogout = () => {
    confirm({
      title: "Xác nhận đăng xuất",
      content: "Bạn có chắc chắn muốn đăng xuất không?",
      okText: "Đăng xuất",
      cancelText: "Hủy",
      onOk() {
        // Xử lý đăng xuất
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);

        navigate("/auth/login-admin"); // Điều hướng về trang đăng nhập
      },
      onCancel() {
        console.log("Hủy đăng xuất");
      },
    });
  };



  useEffect(() => {
    const storedUserInfo = localStorage.getItem("user");
    if (storedUserInfo) {
      const parsedUserInfo = JSON.parse(storedUserInfo);
      setUserInfo(parsedUserInfo);
    }
  }, []);


  const iconSize = 20;

  return (
    <div>
      <Menu
        theme={darkTheme ? "dark" : "light"}
        mode="inline"
        style={{
          fontWeight: "500", // Làm chữ đậm
        }}
        className="menu-bar "
      >
        {
          ["ROLE_ADMIN", "ROLE_MANAGER"].includes(userInfo?.role) &&
          <Menu.Item key="home" icon={<MdDashboard size={iconSize} />}>
            <Link className={"text-decoration-none"} to={"dashboard"}>
              Tổng quan
            </Link>
          </Menu.Item>
        }

        <Menu.Item key="activity" icon={<MdLocalShipping size={iconSize} />}>
          <Link className={"text-decoration-none"} to={"sales-page"}>
            Bán hàng
          </Link>
        </Menu.Item>

        <Menu.Item
          key="ordermanagement"
          icon={<FaFileInvoice size={iconSize} />}
        >
          <Link to={"bill"}>Danh sách hóa đơn</Link>
        </Menu.Item>

        <Menu.SubMenu
          key="submn1"
          icon={<ProductOutlined size={iconSize} />}
          title="Quản lý sản phẩm"
        >
          <Menu.Item key="sub1-t1" icon={<GiConverseShoe size={iconSize} />}>
            <Link to={"product"}>Sản phẩm</Link>
          </Menu.Item>
          {/* <Menu.Item key="sub1-t2" icon={<GiRunningShoe size={iconSize} />}>
            <Link to={"productdetail"}>Sản phẩm chi tiết</Link>
          </Menu.Item> */}
          <Menu.SubMenu
            key="sub1-t10"
            title="Thuộc tính"
            icon={<MdAutoFixHigh size={iconSize} />}
          >
            <Menu.Item key="sub1-t8" icon={<MdCategory size={iconSize} />}>
              <Link to={"brand"}>Hãng</Link>
            </Menu.Item>
            <Menu.Item
              key="sub1-t9"
              icon={<BgColorsOutlined size={iconSize} />}
            >
              <Link to={"color"}>Màu sắc</Link>
            </Menu.Item>
            <Menu.Item key="sub1-t3" icon={<TbBrandDenodo size={iconSize} />}>
              <Link to={"gender"}>Giới tính</Link>
            </Menu.Item>
            <Menu.Item
              key="sub1-t4"
              icon={<LiaShoePrintsSolid size={iconSize} />}
            >
              <Link to={"material"}>Chất liệu</Link>
            </Menu.Item>
            <Menu.Item
              key="sub1-t5"
              icon={<SlSizeFullscreen size={iconSize} />}
            >
              <Link to={"size"}>Kích cỡ</Link>
            </Menu.Item>

            <Menu.Item key="sub1-t6" icon={<TbBrand4Chan size={iconSize} />}>
              <Link to={"sole"}>Đế giày</Link>
            </Menu.Item>
            <Menu.Item key="sub1-t7" icon={<TbBrand4Chan size={iconSize} />}>
              <Link to={"type"}>Loại giày</Link>
            </Menu.Item>
          </Menu.SubMenu>
        </Menu.SubMenu>

        <Menu.SubMenu
          key="submn2"
          icon={<UserOutlined size={iconSize} />}
          title="Quản lý tài khoản"
        >
          {
              ["ROLE_ADMIN", "ROLE_MANAGER"].includes(userInfo?.role) &&
              <Menu.Item key="sub2-t1" icon={<FaRegUser size={iconSize} />}>
                <Link to={"staff"}>Nhân Viên</Link>
              </Menu.Item>
          }

          <Menu.Item key="sub2-t2" icon={<FaUserCircle size={iconSize} />}>
            <Link to={"customer"}>Khách hàng</Link>
          </Menu.Item>
        </Menu.SubMenu>



        <Menu.Item key="comments" icon={<CommentOutlined size={iconSize} />}>
          <Link to={"comments"}>Quản lý bình luận</Link>
        </Menu.Item>

        <Menu.SubMenu
          key="submn3"
          icon={<BiSolidDiscount size={iconSize} />}
          title="Giảm giá"
        >
          <Menu.Item key="sub3-t1" icon={<MdDiscount size={iconSize} />}>
            <Link to={"VoucheList"}>Phiếu giảm giá</Link>
          </Menu.Item>
          <Menu.Item key="sub3-t2" icon={<CiDiscount1 size={iconSize} />}>
            <Link to={"PromotionList"}>Đợt giảm giá</Link>
          </Menu.Item>
        </Menu.SubMenu>
        {
            ["ROLE_ADMIN", "ROLE_MANAGER"].includes(userInfo?.role) && (
                <Menu.SubMenu
                    key="setting"
                    icon={<SettingOutlined size={iconSize} />}
                    title="Cài đặt"
                >
                  <Menu.Item key="setting-feeship" icon={<FaShippingFast size={iconSize} />}>
                    <Link to={"freeship-setting"}>Cài đặt phí ship</Link>
                  </Menu.Item>

                </Menu.SubMenu>
            )
        }

        <Menu.Item
          key="exit"
          icon={<IoExitOutline size={iconSize} />}
          onClick={handleLogout}
        >
          Đăng xuất
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default MenuList;
