import { h } from "preact";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import { Alert, Icon, IconButton } from "@mui/material";
import Button from "@mui/material/Button";
import { useState, useEffect } from "preact/hooks";
import Favorite from "@mui/icons-material/Favorite";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LoopIcon from '@mui/icons-material/Loop';
import CommentList from "../components/comment-components/CommentList";
import CommentForm from "../components/forms/CommentForm";
import {
  addPostLike,
  deletePostLike,
  getAllComments,
  getCommentLikes,
  getPostLikes,
  getSinglePost,
  get_author_id,
} from "../utils/apiCalls";
import ReactMarkdown from "react-markdown";
import { MARKDOWN, PLAIN } from "../utils/constants";
import Share from "@mui/icons-material/Share"
import { route } from 'preact-router';

/*
    Post component
*/

type PostProps = {
  postId: string;
  title: string;
  body: string;
  categories: string[],
  origin: string;
  authorName: string;
  authorId: string;
  currentAuthor?: string;
  contentType: string;
  onRemove?: Function;
  onShare?: Function;
  handleEdit?: Function;
  visibility: string;
  unlisted: boolean;
};

function Post({
  postId,
  title,
  body,
  categories,
  origin,
  authorName,
  authorId,
  currentAuthor,
  onRemove,
  onShare,
  contentType,
  handleEdit,
  visibility,
  unlisted,
}: PostProps) {
  var currentUser: string = currentAuthor as string;

  //Toggle for like button
  const [likeToggle, setLikeToggle] = useState(true);
  const [isLiked, setIsLiked] = useState(0);
  const [postLikes, setPostLikes] = useState(Array());
  const [commentLikes, setCommentLikes] = useState(Array());
  const [loggedUserId, setLoggedUserId] = useState("");

  const [comments, setComments] = useState(Array());
  const [errMsg, setErrMsg] = useState("");

  //TOGGLE FOR SHOWING COMMENTS
  const [showComments, setShowComments] = useState(false);
  const toggleShowComments = () => {
    setShowComments(!showComments);
  };

  //Conditionals for the View Comments Button
  const commentButtonText =
    showComments === false ? "View Comments" : "Hide Comments";
  const commentButtonType = showComments === false ? "outlined" : "contained";

  //TOGGLE FOR OPENING MAKE COMMENT DIALOG
  const [open, setOpen] = useState(false);

  const openDialog = () => {
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  const addLike = () => {
    addPostLike(authorId.toString(), postId);
    for (let i = 0; i < postLikes.length; i++) {
      if (postLikes[i].author.displayName == currentUser) {
        alert("You already liked this post.");
      }
    }
  };

  const deleteLike = () => {
    for (let i = 0; i < postLikes.length; i++) {
      if (postLikes[i].author.displayName == currentUser) {
        deletePostLike(authorId.toString(), postId);
      } else {
        alert("You haven't liked this post yet.");
      }
    }
  };

  const shareButton = () => {
    function getPost(authorId: string, postId: string) {
      getSinglePost(authorId.toString(), postId)
        .then((data) => console.log(data))
    }

    getPost(authorId, postId);

  }

  useEffect(() => {
    // Fetch all the comments of the post from the API
    function fetchComments(authorId: string, postId: string) {
      getAllComments(authorId.toString(), postId)
        .then((data) => setComments(data))
        .catch((err) => {
          setErrMsg(err.message);
        });
    }

    function getAllLikes(authorId: string, postId: string) {
      getPostLikes(authorId.toString(), postId)
        .then((data) => setPostLikes(data.likes))
        .catch((err) => setErrMsg(err.message));
    }

    function getCommentLike(authorId: string, postId: string, commentId: string) { // Need help getting the comment id from here
      getCommentLikes(authorId.toString(), postId, commentId)
        .then((data) => setCommentLikes(data))
        .catch((err) => setErrMsg(err.message));
    }

    fetchComments(authorId, postId);
    getAllLikes(authorId, postId);
    get_author_id()
      .then(setLoggedUserId);
  }, []);

  const toggleFunction = () => {
    setLikeToggle(!likeToggle);
    if (likeToggle) {
      setIsLiked(isLiked + 1);
    }
    if (!likeToggle) {
      setIsLiked(isLiked - 1);
    }
  };

  const renderBody = () => {
    switch (contentType) {
      case MARKDOWN:
        return <ReactMarkdown>{body}</ReactMarkdown>;
      case PLAIN:
        return <p className="text-lg">{body}</p>;
    }
  };

  return (
    <li className="bg-zinc-100 border-solid border-1 border-slate-600 w-2/3 m-auto rounded-lg py-4 px-5  my-5" id={postId} name={postId}>
      <div className="grid grid-cols-1 gap-y-2">
        <div className="flex flex-row justify-between">
          <span className="font-semibold tracking-wide text-lg">
            {authorName}
          </span>

          {/* Display these buttons if the author of the  post is the current author */}
          {authorName === currentUser && (
            <span className="flex space-x-4">
              {/* TODO: show edit button if current user is the author, otherwise, show a re-share button */}
              {loggedUserId == authorId ? (handleEdit && (
                <IconButton>
                  <EditIcon
                    cursor="pointer"
                    style={{ fill: "black" }}
                    onClick={() => {
                      const editPost = {
                        postId,
                        title,
                        description: body,
                        contentType,
                        visibility,
                        unlisted
                      };

                      handleEdit(editPost);
                    }}
                  />
                </IconButton>)
              ) : <IconButton>
                <LoopIcon
                  cursor="pointer"
                  style={{ fill: "black" }}
                  onClick={async () => {
                    // TODO: create new post (dup)
                    await fetch(`/authors/${loggedUserId}/posts/`, {
                      mode: "cors",
                      method: "POST",
                      credentials: "include",
                      headers: {
                        "Content-Type": "application/json; charset=utf-8",
                      },
                      body: JSON.stringify({
                        type: "post",
                        title,
                        source: /^https?/.test(postId) ? postId : `${process.env.FLASK_HOST}/authors/${authorId}/posts/${postId}`,
                        origin,
                        content: body,
                        contentType,
                        category: categories.join(),
                        visibility,
                        unlisted
                      }),
                    });
                  }}
                />
              </IconButton>}

              {onRemove && (
                <IconButton>
                  <DeleteIcon
                    cursor="pointer"
                    style={{ fill: "black" }}
                    onClick={() => {
                      onRemove(postId);
                    }}
                  />
                </IconButton>)
              }
            </span>
          )}
        </div>

        <div className="px-3 my-2">
          <h3 className="font-semibold text-lg mb-2 clickable" onClick={() => route(`/app/authors/${authorId}/posts/${postId}`)}>{title}</h3>
          {renderBody()}
        </div>
      </div>

      <div id="buttons" className="grid grid-cols-1 divide-y py-4">
        <div className="flex flex-row gap-x-4 justify-evenly">
          <p>Likes: {postLikes.length === undefined ? 0 : postLikes.length}</p>
          <div id="like" className="flex flex-row space-x-4">
            <Button
              variant="contained"
              onClick={() => addLike()}
              disableElevation={true}
            >
              Add Like
            </Button>
            <Button variant="outlined" onClick={() => deleteLike()}>
              Delete Like
            </Button>
            {/* <IconButton color="primary" onClick={() => addLike()}>
              {likeToggle ? (
                <FavoriteBorderOutlinedIcon fontSize="large" />
              ) : (
                <Favorite fontSize="large" />
              )}
            </IconButton>
            <IconButton color="primary" onClick={() => deleteLike()}>
              <ThumbDown fontSize="large" />
            </IconButton> */}
          </div>

          <div>
            <Button
              variant="outlined"
              startIcon={<ChatBubbleOutlineOutlinedIcon fontSize="large" />}
              onClick={openDialog}
            >
              Comment
            </Button>
            <CommentForm
              isOpen={open}
              postRepliedTo={title}
              postId={postId}
              author_id={authorId}
              handleClose={closeDialog}
            />
          </div>

          <div style={{ fill: "black" }}>
            <IconButton style={{ fill: "black" }} onClick={() => {
              if (onShare) {
                onShare(authorId, postId)
              }
            }}>
              <ShareOutlinedIcon fontSize="large" />
            </IconButton>
          </div>
          <div>
            <Button
              id="view-comments"
              color="primary"
              variant={commentButtonType}
              onClick={() => toggleShowComments()}
            >
              {commentButtonText}
            </Button>
          </div>
        </div>
      </div>
      <div
        id="comment-section"
        className={`${showComments === false ? "hidden" : "visible"}`}
      >
        <div
          id="comment-section-subheader"
          className="items-center content-center pt-4 py-8 font-semibold"
        >
          Total Comments for this post: {comments.length}
        </div>
        <CommentList allComments={comments} />
      </div>
    </li>
  );
}

export default Post;
