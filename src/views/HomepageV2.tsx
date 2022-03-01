import { h } from "preact";
import Sidebar from "../components/sidemenu-components/sidebar";
import SideNav from "../components/sidemenu-components/SideNav";
import DrawerMenu from "../components/sidemenu-components/Drawer";
import { Box } from "@mui/material";
import { Toolbar } from "@mui/material";
import { Typography } from "@mui/material";

type HomePageProps = { path: string };

function HomepageV2({path}: HomePageProps) {
  return (
    <div>
        <DrawerMenu
        pageName="Home"
        >
            This is a sample homepage.
        </DrawerMenu>
    </div>
  )
}

export default HomepageV2;