import { h } from "preact";
import Sidebar from "../components/sidemenu-components/sidebar";
import SideNav from "../components/sidemenu-components/SideNav";
import DrawerMenu from "../components/sidemenu-components/Drawer";
import { Box } from "@mui/material";
import { Toolbar } from "@mui/material";
import { Typography } from "@mui/material";

const drawerWidth = 240

type ExplorePageProps = { path: string };

function ExplorePageV2({ path }: ExplorePageProps) {
  return (
    <div>
      <DrawerMenu pageName="Explore">
          Hello
      </DrawerMenu>
    </div>
  );
}

export default ExplorePageV2;
