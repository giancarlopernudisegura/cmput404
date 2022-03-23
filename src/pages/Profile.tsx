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
import useAuthorData from "../components/profile/useAuthorData";

type profileProps = {path: string}

function Profile({path}: profileProps) {
  const [errMsg, setErrMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // get author data 
  // const [author, setAuthor] = useState(Object());
  // const [myPosts, setMyPosts] = useState(Array());
  // const [followers, setFollowers] = useState(Array());
  // const [friends, setFriends] = useState(Array());

  // useEffect(() => {    
  //   const authorPromise = getCurrentAuthor()
  //     .then(data => { 
  //       setAuthor(data)
  //       return data.id;
  //     });

  //   // Set the author's posts
  //   var postsPromise = authorPromise.then(authorId => { return getPosts(authorId); });
  //   postsPromise.then(posts => {  setMyPosts(posts); });

  //   // Get the author's followers
  //   var followersPromise = authorPromise.then(authorId => {   
  //     return getFollowers(authorId); 
  //   });

  //   // Set the followers 
  //   followersPromise
  //     .then(result => {
  //       let followers = result.items;
  //       setFollowers(followers);
  //       return followers;
  //     });
    
    
  //   /**
  //    * Resolves the authors and followers promises to get the author's friends
  //    * @param authorPromise 
  //    * @param followersPromise 
  //    * @returns friendPromise
  //    */
  //   async function getAuthorsFriends(authorPromise: Promise<string>, followersPromise: Promise<any>) {
  //     var authorFollowersPromise = await Promise.all([authorPromise, followersPromise]);
  //     var authorId = authorFollowersPromise[0];
  //     var followers = authorFollowersPromise[1].items;

  //     // Get the author's friends, i.e. bidirectional follow
  //     async function fetchFriends(authorId: string, followers: Array<any>) {
  //       var friendPromises: any[] = [];

  //       // Iterate through the followers and check if the author is following them
  //       followers.forEach((follower) => {
  //         friendPromises.push(followerCall(follower.id, authorId, "GET")
  //         );
  //       });

  //       // Wait for all the follower promises to resolve
  //       var friends = await Promise.all(friendPromises)
  //         .then( (results) => {
  //           let friendList: Array<any> = [];
  //           results.forEach((data) => {
  //             if (data.status === 200) {
  //               friendList.push(...data.items);
  //             }
  //           })
  //           return friendList;
  //         });
        
  //       return friends;
  //     }

  //     return fetchFriends(authorId, followers);

  //   }

  //   var myFriendsPromise = getAuthorsFriends(authorPromise, followersPromise);
  //   if (myFriendsPromise) {
  //     myFriendsPromise.then(friends => { setFriends(friends); });
  //   }

  //   Promise.all([authorPromise, postsPromise, followersPromise, myFriendsPromise])
  //     .then(() => {
  //       console.log('Successfully retrieved author, posts, followers and friends');
  //       setIsLoading(false); 
  //     })
  //     .catch(err => { 
  //       setErrMsg('Error retrieving profile data: ' + err.message); 
  //       setIsLoading(false);
  //     });

  // }, []);

  var author:any, myPosts:any, followers:Array<any>, friends:Array<any>;
  var authorData = useAuthorData();
  try{
    author = authorData.author;
    myPosts = authorData.posts;
    followers = authorData.followers;
    friends = authorData.friends;
  
  } catch(err) {
    setErrMsg((err as Error).message);
    setIsLoading(false);
  } finally {
    setIsLoading(false);
  }



  function handleRemove(postId: string) {

    // open the modal to make sure
    // var message = "Delete this post?";
    // // <Dialog />

    // const newList = myPosts.filter(post => post.id !== postId);
    // setMyPosts(newList);

    // function removePost(postId: string, authorId: string) {
    //   // call api to delete post
    //   deletePost(authorId, postId)
    //   .catch(err => {setErrMsg(err.message);});
    // }

    // removePost(author.id, postId);
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
