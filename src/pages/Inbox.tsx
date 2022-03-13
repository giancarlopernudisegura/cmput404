import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import DrawerMenu from "../components/sidemenu-components/Drawer";
import { getPosts, get_author_id, inboxCall } from '../utils/apiCalls';

type notiProps = { path: string };

function Inbox({ path }: notiProps) {
  const [ posts, setPosts ] = useState();
  const [ likes, setLikes ] = useState();
  const [ follow, setFollow ] = useState();
  const [ errMsg, setErrMsg ] = useState("");

  useEffect(() => {
    function getPostsFromAPI() {
      console.log("Getting posts from API...");
      get_author_id()
          .then(author_id => {
              const response = inboxCall(author_id, "GET");
              response
                  .then(data => {
                      // TODO: temp, only use posts from inbox for now
                      setPosts(data.items.filter((item: any) => item.type == "post"));
                  })
                  .catch(err => {
                      setErrMsg(err.message);
                  });
          })
          .catch(console.error);
  }
  getPostsFromAPI();
  }, []);

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
