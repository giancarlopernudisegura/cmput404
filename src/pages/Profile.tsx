import { h } from "preact";
import DrawerMenu from '../components/sidemenu-components/Drawer'
import { useState, useEffect } from "preact/hooks";
import { getCurrentAuthor, getPosts } from "../utils/apiCalls";

import Post from "../components/Post";
import PostList from "../components/PostList";

import AuthorInfo from "../components/profile/AuthorInfo";

type profileProps = {path: string}

function Profile({path}: profileProps) {

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
        });
      
    }
    getAuthorAndPosts();

  }, []);


  return (
    <div id="profile">
      <DrawerMenu
        pageName="My Profile"
      >
        {author && 
          <AuthorInfo 
            profileImage={author.profileImage}
            displayName={author.displayName}
            github={author.github} 
          />
        }
        <PostList posts={myPosts} />

      </DrawerMenu>
    </div>
  );
}

export default Profile;
