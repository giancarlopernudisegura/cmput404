import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import DrawerMenu from "../components/sidemenu-components/Drawer";
import { getPosts, get_author_id, inboxCall } from '../utils/apiCalls';
import Alert from '@mui/material/Alert';
import Post from '../components/Post';


type notiProps = { path: string };

// TODO: finish implementation
function Inbox({ path }: notiProps) {
  const [ errMsg, setErrMsg ] = useState("");

  const [ inboxData, setInboxData ] = useState(Array());

  useEffect(() => {
    const getInbox = async() => {
      let authorId;
      try {
        authorId = await get_author_id();
      } catch (err) {
        setErrMsg((err as Error).message)
      }

      let inboxResponse;
      try {
        inboxResponse = await inboxCall(authorId as string, "GET");
      } catch (err) {
        setErrMsg((err as Error).message)
      }

      setInboxData(inboxResponse.items);

      let postTemp = Array(), likesTemp = Array(), followTemp = Array();
      inboxResponse.items.forEach((item : any) => {
        const itemType : string = item.type;
        if (itemType === "post") {
          postTemp.push(item);
        } else if (itemType === "likes") {
          likesTemp.push(item);
        } else if (itemType === "follow") {
          followTemp.push(item);
        }
      });

      console.log("INBOX RESPONSES", inboxResponse);

      // update the states
      setPosts(postTemp);
      setLikes(likesTemp);
      setFollow(followTemp);
    }

    getInbox();
  }, []);

  return (
    <div>
      <DrawerMenu
        pageName="Inbox"
      >
        {errMsg && (
          <Alert severity="error">{errMsg}</Alert>
        )}

        {inboxData.map(inbox => {
          const type = inbox.type;
          
          if (type == "post") {
            return (
              <Post
                  id={inbox.id}
                  title={inbox.title}
                  body={inbox.description}
                  author={`${inbox.author.displayName} (${inbox.author.github}) created a ${inbox.visibility} post!`} 
                  currentAuthor={""}
                  contentType={inbox.contentType}
              />
            );
          } else if (type == "Like") {
            return (
              <div className='grid grid-cols-1 gap-y-2'>
                <div className="flex flex-row justify-between">
                  <img src={inbox.author.profileImage} className="rounded-full w-1/5"></img>
                  <span className='font-semibold tracking-wide text-lg'>{inbox.author.github} {inbox.summary}</span>
                </div>
              </div>
            );
          } else if (type == "followers") {
            return (
              <div className='grid grid-cols-1 gap-y-2'>
                <div className="flex flex-row justify-between">
                  <span className='font-semibold tracking-wide text-lg'>{inbox.author.displayName} ({inbox.author.github}) created a {inbox.visibility} post!</span>
                  <img src={inbox.author.profileImage} className="rounded-full w-1/5"></img>
                  <div className='px-3 my-2'>
                    <h3 className='font-semibold text-lg mb-2'>{inbox.title}</h3>
                    {}
                  </div>
                  {/* TODO: post are different for inbox */}
                </div>
              </div>
            );
          } else {
            return (
              <div></div>
            );
          }
        })}

        {/* {posts.length > 0 &&
          <PostList 
            initialPosts={posts} 
          /> 
        } */}

        {/* Like components */}

      </DrawerMenu>
    </div>
  );
}

export default Inbox;
