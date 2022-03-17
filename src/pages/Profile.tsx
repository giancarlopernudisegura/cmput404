import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import DrawerMenu from '../components/sidemenu-components/Drawer'
import { Alert, CircularProgress, Dialog } from "@mui/material";

import { 
  getCurrentAuthor, 
  getPosts, 
  deletePost,
  getFollowers
} from "../utils/apiCalls";

import PostList from "../components/PostList";
import AuthorInfo from "../components/profile/AuthorInfo";

type profileProps = {path: string}

function Profile({path}: profileProps) {
  const [errMsg, setErrMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // get author data 
  const [author, setAuthor] = useState(Object());

  const [myPosts, setMyPosts] = useState(Array());

  // TODO: get author's followers and friends 
  const [followers, setFollowers] = useState(Array());
  const [friends, setFriends] = useState(Array());


  useEffect(() => {

    // Get the author data
    var authorPromise = getCurrentAuthor()
      .then(data => { 
        setAuthor(data)
        return data.id;
      });

    // Set the author's posts
    var postsPromise = authorPromise.then(authorId => { return getPosts(authorId.toString()); });
    postsPromise.then(posts => {
      setMyPosts(posts);
      setIsLoading(false);
    })

    // Get the author's followers and friends
    var followersPromise = authorPromise.then(authorId => {   
      return getFollowers(authorId); 
    });

    followersPromise.then(followers => {
      setFollowers(followers.items);
    });

  }, []);

  function handleRemove(postId: number) {
    // open the modal to make sure
    var message = "Delete this post?";
    // <Dialog />

    const newList = myPosts.filter(post => post.id !== postId);
    setMyPosts(newList);

    function removePost(postId: number, authorId: number) {
      // call api to delete post
      deletePost(postId, authorId)
      .catch(err => {setErrMsg(err.message);});
    }

    removePost(author.id, postId);
  }


  function handleEdit() {
    // TODO
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
                followers={followers}
                friends={friends}
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
