import { h } from "preact";
import DrawerMenu from '../components/sidemenu-components/Drawer'
import { useState, useEffect } from "preact/hooks";
import { getCurrentAuthor, getPosts } from "../utils/apiCalls";

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
          <div class="container"
            className="">
            <div className="text-xl">
              <img src={author.profileImage}
                className="rounded-full w-1/5"></img>
              <h1>{author.displayName}</h1>
            </div>

            <div class="posts">
              <h2>My Posts</h2>

            </div>

          </div>




        }
      </DrawerMenu>
    </div>
  );
}

export default Profile;
