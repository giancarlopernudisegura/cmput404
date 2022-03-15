import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import DrawerMenu from '../components/sidemenu-components/Drawer'
import { Alert, CircularProgress } from "@mui/material";

import { getCurrentAuthor, getPosts } from "../utils/apiCalls";
import PostList from "../components/PostList";
import AuthorInfo from "../components/profile/AuthorInfo";
import Modal from "../components/Modal";
import SimpleModal from "../components/Modal";

type profileProps = {path: string}

function Profile({path}: profileProps) {
  const [errMsg, setErrMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // get author data 
  const [author, setAuthor] = useState(Object());
  const [myPosts, setMyPosts] = useState(Array());

  // control modal state 


  useEffect(() => {
    function getAuthorAndPosts() {
      getCurrentAuthor() 
        .then(data => { setAuthor(data); 
          return data.id;
        })
        .then(authorId => {
          return getPosts(authorId);
        })
        .then(posts => {
          setMyPosts(posts);
        })
        .catch(err => { setErrMsg(err.message); });
      
    }
    setIsLoading(false);
    getAuthorAndPosts();

  }, []);

  function handleRemove(id: number) {
    // TODO: delete the post to be deleted 
    // open the modal to make sure
    // var message = "Are you sure you want to delete this post?";
    // <SimpleModal message={message} onOpen={true} />

    console.log("Old length:", myPosts.length);
    console.log(myPosts);
    const newList = myPosts.filter(post => post.id !== id);
    setMyPosts(newList);
    console.log("New length:", newList.length);
    alert("Post deleted");
  }

  function handleEdit() {

  }


  return (
    <div id="profile">
      <DrawerMenu
        pageName="My Profile"
      >
        {errMsg && <Alert severity="error">{errMsg}</Alert>}

        {isLoading === true ? 
          <CircularProgress 
            className="grid place-items-center h-screen"/> : (
            <div className="flex flex-col m-auto">
              <AuthorInfo
                author={author}
              />

              <PostList 
                initialPosts={myPosts} 
                currentAuthor={author.displayName} 
                onRemove={handleRemove}
              />
            </div>
        )
      }

      </DrawerMenu>
    </div>
  );
}

export default Profile;
