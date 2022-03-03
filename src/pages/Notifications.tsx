import { h } from "preact";
import DrawerMenu from "../components/sidemenu-components/Drawer";

type notiProps = { path: string };

function Notifications({ path }: notiProps) {
  return (
    <div>
      <DrawerMenu
      pageName="Notifications"
      >
      </DrawerMenu>
    </div>
  );
}

export default Notifications;
