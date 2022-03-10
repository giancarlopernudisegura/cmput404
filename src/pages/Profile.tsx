import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import DrawerMenu from '../components/sidemenu-components/Drawer'
import { Alert, CircularProgress } from "@mui/material";

import { getCurrentAuthor, getPosts } from "../utils/apiCalls";
import PostList from "../components/PostList";
import AuthorInfo from "../components/profile/AuthorInfo";

type profileProps = {path: string}

function Profile({path}: profileProps) {
  const [errMsg, setErrMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // get author data 
  const [author, setAuthor] = useState(Object());
  const [myPosts, setMyPosts] = useState(Array());

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
                profileImage={author.profileImage}
                displayName={author.displayName}
                github={author.github}
              />

              <PostList posts={myPosts} />
            </div>
        )
      }

      </DrawerMenu>
    </div>
  );
}

export default Profile;
