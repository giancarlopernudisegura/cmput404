import { h } from 'preact'
import { useEffect, useState } from 'preact/hooks';
import { CircularProgress, Alert, Button } from '@mui/material';
import DrawerMenu from '../components/sidemenu-components/Drawer'

import { getPosts, get_author_id } from '../utils/apiCalls';

import useAuthorId  from '../components/hooks/useAuthorId';  
import useFollowers from '../components/hooks/useFollowers';
import useFriends from '../components/hooks/useFriends';
import PostList from '../components/PostList';
import {NOT_FOUND} from '../utils/constants';

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

  const fetchFriendsPosts = async () => {
    var friendsPostsList = [];
    for (let friend of friends) {
      var page = 1;
      var loadPerFriend = true;

      try {
        while (loadPerFriend) {
          let postsResults = await getPosts(friend.id, page);
          let posts = postsResults.items;

          if (posts.length === 0) {
            setLoading(false);
            loadPerFriend = false;
          }
          friendsPostsList.push(...posts);
          page += 1;
        }

      } catch (err) {
        setErrMsg((err as Error).message);
        setLoading(false);
      }
    }
    setFriendsPosts(friendsPostsList);
  }

  useEffect( () => {
    try {
      fetchFriendsPosts();

    } catch (err) {
      setErrMsg((err as Error).message);
    } finally {
      setLoading(false);
    }

  }, [followers, friends]);

  return (
    <div>
      {errMsg && (
        <Alert severity="error">{errMsg}</Alert>
      )}

      <DrawerMenu pageName="Home">

        {loading ? <CircularProgress /> : 
          <div>
            <PostList initialPosts={friendsPosts} />
          </div>
        }

      </DrawerMenu>
    </div>
  )
}

export default Homepage;