import React from "react";
import { h } from "preact";
import { Drawer } from "@mui/material";
import { Typography } from "@mui/material";
import ExploreIcon from "@mui/icons-material/Explore";
import Home from "@mui/icons-material/Home";
import Notification from "@mui/icons-material/Notifications";
import Logout from "@mui/icons-material/Logout";
import MyProfile from "@mui/icons-material/Person";
import {
  ProSidebar,
  Menu,
  MenuItem,
  SubMenu,
  SidebarFooter,
} from "react-pro-sidebar";
import "react-pro-sidebar/dist/css/styles.css";

function SideNav() {
  return (
    <div class="h-full">
      <ProSidebar>
        <Menu>
          <MenuItem icon={<Home />}>Home</MenuItem>
          <MenuItem icon={<ExploreIcon />}>Explore</MenuItem>
          <MenuItem icon={<Notification />}>Notifications</MenuItem>
          <SidebarFooter>
            <MenuItem icon={<Logout />}>Logout</MenuItem>
          </SidebarFooter>
        </Menu>
      </ProSidebar>
    </div>
  );
}

export default SideNav;
