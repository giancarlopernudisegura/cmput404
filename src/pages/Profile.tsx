import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import DrawerMenu from "../components/sidemenu-components/Drawer";
import { Alert, Button, CircularProgress } from "@mui/material";

import {
  getPosts,
  deletePost,
  editPost,
  getSpecAuthor,
  get_author_id,
} from "../utils/apiCalls";

import PostList from "../components/PostList";
import AuthorInfo from "../components/profile/AuthorInfo";
import DialogTemplate from '../components/DialogTemplate';
import { LOAD_MORE_TEXT, MARKDOWN, NO_MORE_POSTS_TEXT } from '../utils/constants';

type profileProps = { path: string };

function Profile({ path }: profileProps) {
  const [errMsg, setErrMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Dialog
  const [openDialog, setOnOpenDialog] = useState<boolean>(false);

  // editPost
  const [IdEditPost, setIdEditPost] = useState<string>("");
  const [editPostBody, setEditPostBody] = useState<string>("");
  const [editPostCat, setEditPostCat] = useState<string>("");
  const [editPostTitle, setEditPostTitle] = useState<string>("");
  const [editIsPostMkd, setEditIsPostMkd] = useState<boolean>(false);

  // get author data 
  const [author, setAuthor] = useState(Object());
  const [myPosts, setMyPosts] = useState(Array());
  const [postPage, setPostPage] = useState(1);
  const [buttonText, setButtonText] = useState(LOAD_MORE_TEXT);
  const BACKEND_HOST = process.env.FLASK_HOST;

  //Posts that have been shared by author
  const [sharedPosts, setSharedPosts] = useState(Array());

  const getNextPostPage = async () => {
    try {
      const postsRes = await getPosts(author.id, postPage);
      const fetchedPosts = postsRes.items;
      if (fetchedPosts.length === 0) {
        alert("There are no more posts to show");
        setButtonText(NO_MORE_POSTS_TEXT);
        return;
      }

      const validPosts = fetchedPosts.filter((post: any) => post.unlisted === false);

      setMyPosts([...myPosts, ...validPosts]);
      // update post page
      setPostPage(postPage + 1);
    } catch (err) {
      setErrMsg((err as Error).message);
    }
  }

  useEffect(() => {
    const authorPromise = get_author_id().then((author_id: any) => {
      getSpecAuthor(author_id).then(data => {
        setAuthor(data);
      });
      return author_id;
    });

    // Set the author's posts
    var postsPromise = authorPromise.then(authorId => {
      let posts = getPosts(authorId, postPage);
      setPostPage(postPage + 1);
      return posts;
    });
    postsPromise.then(posts => { setMyPosts(posts.items); });

    Promise.all([authorPromise, postsPromise])
      .then(() => {
        setIsLoading(false);
      })
      .catch(err => {
        setErrMsg('Error retrieving profile data: ' + err.message);
        setIsLoading(false);
      });

  }, []);



  function handleRemove(postId: string) {
    // open the modal to make sure
    // var message = "Delete this post?";
    // // <Dialog />

    const newList = myPosts.filter((post) => post.id !== postId);
    setMyPosts(newList);

    function removePost(authorId: string, postId: string) {
      // call api to delete post
      deletePost(authorId, postId)
        .catch(err => { setErrMsg(err.message); });
    }

    removePost(author.id, postId);
  }

  async function handleEdit(newPostBody: any) {

    // initialize values
    setIdEditPost(newPostBody.postId);
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
      if (post.postId === IdEditPost) {
        return { ...newPostBody, description: newPostBody.content, authorId: post.authorId, authorName: post.authorName, postId: post.postId };
      } else {
        return post;
      }
    });

    setMyPosts(newList);
  }

  return (
    <div id="profile">
      <DrawerMenu pageName="My Profile">
        {errMsg && <Alert severity="error">{errMsg}</Alert>}

        {isLoading === true ?
          <CircularProgress
            className="grid place-items-center h-screen" /> : (
            <div className="flex flex-col m-auto">
              <AuthorInfo
                author={author}
                is_owner
              />

              <PostList
                initialPosts={myPosts}
                currentAuthor={author.displayName}
                onRemove={handleRemove}
                handleEdit={handleEdit}
              />

              <Button
                className="w-fit"
                variant="contained"
                onClick={() => getNextPostPage()}
              >
                {buttonText}
              </Button>

              {openDialog &&
                <DialogTemplate
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
                />
              }
            </div>
          )
        }

      </DrawerMenu>
    </div>
  );
}

export default Profile;
