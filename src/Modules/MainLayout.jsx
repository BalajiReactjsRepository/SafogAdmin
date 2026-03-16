import React from "react";
import NavbarModule from "./NavbarModule";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div>
      <NavbarModule />
      <Outlet />
    </div>
  );
};

export default MainLayout;
