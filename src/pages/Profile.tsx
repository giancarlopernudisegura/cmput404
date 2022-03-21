import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import DrawerMenu from '../components/sidemenu-components/Drawer'
import { Alert, CircularProgress, Dialog } from "@mui/material";

import { 
  getCurrentAuthor, 
  getPosts, 
  deletePost,
  getFollowers,
  followerCall
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
  const [followers, setFollowers] = useState(Array());


  useEffect(() => {    
    const authorPromise = getCurrentAuthor()
      .then(data => { 
        setAuthor(data)
        return data.id;
      });

    // Set the author's posts
    var postsPromise = authorPromise.then(authorId => { return getPosts(authorId.toString()); });
    postsPromise.then(posts => {  setMyPosts(posts); });

    // Get the author's followers
    var followersPromise = authorPromise.then(authorId => {   
      return getFollowers(authorId); 
    });

    // Set the followers 
    followersPromise
      .then(result => {
        let followers = result.items;
        setFollowers(followers);
        return followers;
      });
    
    Promise.all([authorPromise, postsPromise, followersPromise])
      .then( (values) => { 
        console.log('Successfully retrieved author, posts, and followers'); 
        setIsLoading(false);
      })
      .catch(err => {
        console.log('Error retrieving author, posts, and followers');
        setErrMsg(err.message);
        setIsLoading(false);
      });


  }, []);

  const [friends, setFriends] = useState(Array());
  useEffect(() => {
    
  }, []);

  function handleRemove(postId: string) {

    // open the modal to make sure
    var message = "Delete this post?";
    // <Dialog />

    const newList = myPosts.filter(post => post.id !== postId);
    setMyPosts(newList);

    function removePost(postId: string, authorId: string) {
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
