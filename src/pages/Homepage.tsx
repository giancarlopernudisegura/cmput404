import { h, Component, ComponentChild } from 'preact'
import { AppBar, Card, CardContent, Menu, MenuItem } from '@mui/material';
import { useEffect, useState } from 'preact/hooks';
import { Button, CircularProgress } from '@mui/material';
import DrawerMenu from '../components/sidemenu-components/Drawer'

import { getPosts } from '../utils/apiCalls';

import useAuthorId  from '../components/hooks/useAuthorId';  
import useFollowers from '../components/hooks/useFollowers';
import useFriends from '../components/hooks/useFriends';
import PostList from '../components/PostList';

type FeedProps = {
  path: string
};


function Homepage(props : FeedProps) {
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [friendsPosts, setFriendsPosts] = useState<Array<any>>([]);

  const authorId = useAuthorId();
  const followers = useFollowers(authorId);
  const friends = useFriends(authorId, followers);
  if (authorId !== "" && followers.length > 0 && friends.length > 0) {
    console.log("Homepage Data:", authorId, followers, friends);

  }

  useEffect( () => {
    const fetchFriendsPosts = async () => {
      var friendsPostsList = new Array<any>();
      
      for (let friend of friends) {
        // get friends posts 
        let posts = await getPosts(friend.id);
        console.log("Fetched posts for friend:", friend.id, posts);

        if (posts.length > 0) {
          friendsPostsList.push(...posts);
        }
      }

      setFriendsPosts(friendsPostsList);
      setLoading(false);

    }
    fetchFriendsPosts();
  }, [authorId, followers, friends])

  return (
    <div>
        <DrawerMenu pageName="Home">

          {loading ? <CircularProgress /> : 
            <PostList initialPosts={friendsPosts} 
          />}

        </DrawerMenu>
    </div>
  )
}

export default Homepage;