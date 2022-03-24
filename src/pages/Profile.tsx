import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import DrawerMenu from "../components/sidemenu-components/Drawer";
import { Alert, CircularProgress } from "@mui/material";

import {
  getCurrentAuthor,
  getPosts,
  deletePost,
  getAllComments,
} from "../utils/apiCalls";

import PostList from "../components/PostList";
import AuthorInfo from "../components/profile/AuthorInfo";


type profileProps = { path: string };

function Profile({ path }: profileProps) {
  const [errMsg, setErrMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // get author data
  const [author, setAuthor] = useState(Object());
  const [myPosts, setMyPosts] = useState(Array());

  useEffect(() => {    
    const authorPromise = getCurrentAuthor()
      .then(data => { 
        setAuthor(data)
        return data.id;
      });

    // Set the author's posts
    var postsPromise = authorPromise.then(authorId => { return getPosts(authorId); });
    postsPromise.then(posts => {  setMyPosts(posts); });

    Promise.all([authorPromise, postsPromise])
      .then(() => {
        console.log('Successfully retrieved author, posts, followers and friends');
        setIsLoading(false); 
      })
      .catch(err => { 
        setErrMsg('Error retrieving profile data: ' + err.message); 
        setIsLoading(false);
      });

  }, []);



  function handleRemove(postId: string) {
    // open the modal to make sure
    // var message = "Delete this post?";
    // // <Dialog />

    const newList = myPosts.filter((post) => post.id !== postId);
    setMyPosts(newList);

    function removePost(authorId: string, postId: string) {
      // call api to delete post
      deletePost(authorId, postId)
      .catch(err => {setErrMsg(err.message);});
    }

    removePost(author.id, postId);
  }

  function handleEdit() {
    // TODO
  }

  return (
    <div id="profile">
      <DrawerMenu pageName="My Profile">
        {errMsg && <Alert severity="error">{errMsg}</Alert>}

        {isLoading === true ? (
          <CircularProgress className="grid place-items-center h-screen" />
        ) : (
          <div className="flex flex-col m-auto">
            <AuthorInfo author={author} />

            <PostList
              initialPosts={myPosts}
              currentAuthor={author.displayName}
              onRemove={handleRemove}
            />
          </div>
        )}
      </DrawerMenu>
    </div>
  );
}

export default Profile;
