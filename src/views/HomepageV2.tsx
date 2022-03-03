import { h } from "preact";
import DrawerMenu from "../components/sidemenu-components/Drawer";

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