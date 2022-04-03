import { h, Component, ComponentChild } from 'preact'
import { AppBar, Card, CardContent, Menu, MenuItem } from '@mui/material';
import { useEffect, useState } from 'preact/hooks';
import { Button } from '@mui/material';
import DrawerMenu from '../components/sidemenu-components/Drawer'

import { get_author_id } from '../utils/apiCalls';

import useAuthorId  from '../components/hooks/useAuthorId';  
import useFollowers from '../components/hooks/useFollowers';

type FeedProps = {
  path: string
};


function Homepage(props : FeedProps) {
  const [errMsg, setErrMsg] = useState("");

  try {

    const authorId = useAuthorId();

    if (authorId !== "") {
      // Get the author's followers
      const followers = useFollowers(authorId);
      console.log('followers:', followers);

      // Get the author's friends

    }


  } catch (err) {
    setErrMsg('Error: ' + err);
  }
  

  return (
    <div>
        <DrawerMenu
        pageName="Home"
        >
            This is to be implemented to show the relationship between the posts from your friends and followers
        </DrawerMenu>
    </div>
  )
}

export default Homepage;