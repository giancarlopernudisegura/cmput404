import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import DrawerMenu from '../components/sidemenu-components/Drawer'
import { Alert, CircularProgress } from "@mui/material";

import { getCurrentAuthor, getPosts, deletePost, editPost } from "../utils/apiCalls";

import PostList from "../components/PostList";
import AuthorInfo from "../components/profile/AuthorInfo";
import SimpleModal from "../components/Modal";
import DialogTemplate from '../components/DialogTemplate';
import { MARKDOWN } from '../utils/constants';


type profileProps = {path: string}

function Profile({path}: profileProps) {
  const [errMsg, setErrMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  // Dialog
  const [ openDialog, setOnOpenDialog ] = useState<boolean>(false);

  // editPost
  const [ IdEditPost, setIdEditPost] = useState<string>("");
  const [ editPostBody, setEditPostBody ] = useState<string>("");
  const [ editPostCat, setEditPostCat ] = useState<string>("");
  const [ editPostTitle, setEditPostTitle ] = useState<string>("");
  const [ editIsPostMkd, setEditIsPostMkd ] = useState<boolean>(false);

  // get author data 
  const [ author, setAuthor ] = useState(Object());
  const [ myPosts, setMyPosts ] = useState(Array());

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
        })
        .catch(err => { setErrMsg(err.message); });
      
    }
    setIsLoading(false);
    getAuthorAndPosts();

  }, []);

  function handleRemove(postId: string) {

    // open the modal to make sure
    // var message = "Are you sure you want to delete this post?";
    // <SimpleModal message={message} onOpen={true} />

    const newList = myPosts.filter(post => post.id !== postId);
    setMyPosts(newList);

    function removePost(postId: string, authorId: string) {
      // call api to delete post
      deletePost(postId, authorId)
      .catch(err => {setErrMsg(err.message);});
    }

    removePost(author.id, postId);
  }



  async function handleEdit(newPostBody: any) {
    console.log("BODY", newPostBody);

    // initialize values
    setIdEditPost(newPostBody.id);
    setEditPostBody(newPostBody.description);
    setEditPostCat("");
    setEditPostTitle(newPostBody.title);
    setEditIsPostMkd(newPostBody.contentType === MARKDOWN);

    setOnOpenDialog(true);
  }

  async function editPostCall(authorId: string, newPostBody: any) {
    try {
      await editPost(authorId, IdEditPost, newPostBody);
    } catch (err) {
      setErrMsg((err as Error).message);
    }

    const newList = myPosts.map(post => {
      if (post.id === IdEditPost) {
        return newPostBody;
      } else {
        return post;
      }
    });

    setMyPosts(newList);
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
              />

              <PostList 
                initialPosts={myPosts} 
                currentAuthor={author.displayName} 
                onRemove={handleRemove}
                handleEdit={handleEdit}
              />

              {openDialog && <DialogTemplate 
                open={openDialog}
                handleClose={() => setOnOpenDialog(false)}
                updatePost={editPostCall}
                postBody={editPostBody}
                setPostBody={setEditPostBody}
                postCat={editPostCat}
                setPostCat={setEditPostCat}
                postTitle={editPostTitle}
                setPostTitle={setEditPostTitle}
                isMarkdown={editIsPostMkd}
                setIsMarkdown={setEditIsPostMkd}
              />}
            </div>
        )
      }

      </DrawerMenu>
    </div>
  );
}

export default Profile;
