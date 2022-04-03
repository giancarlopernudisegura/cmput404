import { h } from 'preact'
import { useEffect, useState } from 'preact/hooks';
import { CircularProgress, Alert } from '@mui/material';
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
  if (authorId === "" && followers.length === 0) {
    setErrMsg("Sorry, we're encountering some issues. Please try again later.");
  }

  useEffect( () => {
    const fetchFriendsPosts = async () => {
      var friendsPostsList = new Array<any>();
      
      for (let friend of friends) {
        // get friends posts 
        let posts = await getPosts(friend.id);

        if (posts.length > 0) {
          friendsPostsList.push(...posts);
        }
      }

      setFriendsPosts(friendsPostsList);
      setLoading(false);

    }

    try {
      fetchFriendsPosts();
    } catch (err) {
      setErrMsg((err as Error).message);
    }

  }, [authorId, followers, friends])

  return (
    <div>
      {errMsg && (
        <Alert severity="error">{errMsg}</Alert>
      )}

      <DrawerMenu pageName="Home">

        {loading ? <CircularProgress /> : 
          <PostList initialPosts={friendsPosts} 
        />}

      </DrawerMenu>
    </div>
  )
}

export default Homepage;