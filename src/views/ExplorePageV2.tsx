import { h } from "preact";
import Sidebar from "../components/sidemenu-components/sidebar";
import SideNav from "../components/sidemenu-components/SideNav";
import DrawerMenu from "../components/sidemenu-components/Drawer";
import { Box } from "@mui/material";
import { Toolbar } from "@mui/material";
import { Typography } from "@mui/material";
import MakePost from '../components/Post-Components/MakePost'

const drawerWidth = 240

type ExplorePageProps = { path: string };

function ExplorePageV2({ path }: ExplorePageProps) {
  return (
    <div>
      <DrawerMenu pageName="Explore">
          {/* <Typography variant="h2">Welcome to Explore! Find all the newest posts here.</Typography> */}
          <p class="text-xl pb-4">Welcome to Explore! Find all the newest posts here.</p>
          <MakePost></MakePost>
      </DrawerMenu>
    </div>
  );
}

export default ExplorePageV2;
