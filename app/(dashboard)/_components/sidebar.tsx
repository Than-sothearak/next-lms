import React from "react";
import { Logo } from "./logo";
import { SideBarRoute } from "./sidebar-route";


const SideBar = () => {
  return (
    <div
      className="flex flex-col h-full bg-white border-r overflow-y-auto shadow-sm">
      <div className="p-6">
        <Logo />
      </div>
      <div className="flex flex-col w-full">
        <SideBarRoute />
      </div>
    </div>
  );
};

export default SideBar;
