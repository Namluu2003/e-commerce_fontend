import React from "react";
import { useLocation, Link } from "react-router-dom";

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <div>
      <nav style={{marginBottom:"1.5rem"}}>
        {pathnames.length > 0 ? (
          <Link style={{color:"black"}} to="/">Trang chủ</Link>
        ) : (
          <span>Admin</span>
        )}
        {pathnames.map((value, index) => {
          const pathTo = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;

          return (
            <span key={pathTo}>
              {" > "}
              {isLast ? (
                <span>{value}</span>
              ) : (
                <Link style={{color:"black"}} to={pathTo}>{value}</Link>
              )}
            </span>
          );
        })}
      </nav>
    </div>
  );
};

export default Breadcrumb;
