import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import DrawerMenu from "../components/sidemenu-components/Drawer";
import { getPosts, get_author_id, inboxCall } from '../utils/apiCalls';

type notiProps = { path: string };

// TODO: finish implementation
function Inbox({ path }: notiProps) {
  const [ posts, setPosts ] = useState();
  const [ likes, setLikes ] = useState();
  const [ follow, setFollow ] = useState();
  const [ errMsg, setErrMsg ] = useState("");

  return (
    <div>
      <DrawerMenu
        pageName="Inbox"
      >
      </DrawerMenu>
    </div>
  );
}

export default Inbox;
