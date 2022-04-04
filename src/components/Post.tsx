import { h } from "preact";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import { Alert, IconButton, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { useState, useEffect } from "preact/hooks";
import Favorite from "@mui/icons-material/Favorite";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CommentList from "../components/comment-components/CommentList";
import CommentForm from "../components/forms/CommentForm";
import {
  addPostLike,
  getAllComments,
  getPostLikes,
  deletePostLike,
  get_author_id,
} from "../utils/apiCalls";
import ReactMarkdown from "react-markdown";
import { MARKDOWN, PLAIN } from "../utils/constants";
import { route } from "preact-router";

/*
    Post component
*/

type PostProps = {
  postId: string;
  title: string;
  body: string;
  authorName: string;
  authorId: string;
  currentAuthor?: string;
  contentType: string;
  onRemove?: Function;
  handleEdit?: Function;
  visibility: string;
  unlisted: boolean;
};

function Post({
  postId,
  title,
  body,
  authorName,
  authorId,
  currentAuthor,
  onRemove,
  contentType,
  handleEdit,
  visibility,
  unlisted,
}: PostProps) {
  var currentUser: string = currentAuthor as string;

  const BACKEND_HOST = process.env.FLASK_HOST;
  //Toggle for like button
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [numLikes, setNumLikes] = useState(0);
  const [postLikes, setPostLikes] = useState(Array());

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

  useEffect(() => {
    // Fetch all the comments of the post from the API
    async function fetchComments(authorId: string, postId: string) {
      let data;
      try {
        data = await getAllComments(authorId.toString(), postId);
        setComments(data);
      } catch (err) {
        setErrMsg((err as Error).message);
      }
    }

    async function getAllLikes(authorId: string, postId: string) {
      let response;
      try {
        const currentUserIdTemp = await get_author_id();
        setCurrentUserId(currentUserIdTemp);
        response = await getPostLikes(authorId, postId);
        setPostLikes(response.likes);
        setNumLikes(response.likes.length);

        // check if user liked the post
        response.likes.forEach((like: any) => {
          if (like.author.id === currentUserIdTemp) {
            setIsLiked(true);
          }
        });
        console.log("LIKES", response);
      } catch (err) {
        setErrMsg((err as Error).message);
      }
    }

    fetchComments(authorId, postId);
    getAllLikes(authorId, postId);
  }, []);

  const toggleLike = async () => {
    if (isLiked) {
      await deletePostLike(authorId, postId);
      setNumLikes(numLikes - 1);
      setIsLiked(false);
    } else {
      await addPostLike(authorId, postId);
      setNumLikes(numLikes + 1);
      setIsLiked(true);
    }
    // setIsLiked(!isLiked);
  };

  const renderBody = () => {
    switch (contentType) {
      case MARKDOWN:
        return <ReactMarkdown>{body}</ReactMarkdown>;
      case PLAIN:
        return <p className="text-lg">{body}</p>;
    }
  };

  //GET LINK TO SHARE POST

  function getPostLink(authorId: string, postId: string) {
    navigator.clipboard
      .writeText(`${BACKEND_HOST}/app/authors/${authorId}/posts/${postId}`)
      .then(() => {
        alert("Link successfully copied to clipboard!");
      })
      .catch(() => {
        alert("Something went wrong with adding the link to the clipboard.");
      });
  }

  return (
    <li className="bg-zinc-100 border-solid border-1 border-slate-600 w-2/3 m-auto rounded-lg py-4 px-5  my-5">
      <div className="grid grid-cols-1 gap-y-2">
        <div className="flex flex-row justify-between">
          <span className="font-semibold tracking-wide text-lg">
            {authorName}
          </span>

          {/* Display these buttons if the author of the  post is the current author */}
          {authorName === currentUser && (
            <span className="flex space-x-4">
              {handleEdit && (
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
                        unlisted,
                      };

                      handleEdit(editPost);
                    }}
                  />
                </IconButton>
              )}

              {onRemove && (
                <IconButton>
                  <DeleteIcon
                    cursor="pointer"
                    style={{ fill: "black" }}
                    onClick={() => {
                      onRemove(postId);
                    }}
                  />
                </IconButton>
              )}
            </span>
          )}
        </div>

        <div className="px-3 my-2">
          <h3
            className="font-semibold text-lg mb-2 clickable"
            onClick={() => route(`/app/authors/${authorId}/posts/${postId}`)}
          >
            {title}
          </h3>
          {renderBody()}
        </div>
      </div>

      <div id="buttons" className="grid grid-cols-1 divide-y py-4">
        <div className="flex flex-row gap-x-4 justify-evenly">
          <div id="like" className="flex flex-row justify-between space-x-4">
            <p>Likes: {numLikes === undefined ? 0 : numLikes}</p>
            <IconButton color="primary" onClick={() => toggleLike()}>
              {isLiked ? (
                <Favorite fontSize="large" />
              ) : (
                <FavoriteBorderOutlinedIcon fontSize="large" />
              )}
            </IconButton>
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
            <IconButton
              style={{ fill: "black" }}
              onClick={() => {
                getPostLink(authorId, postId);
              }}
            >
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
        <CommentList
          allComments={comments}
          authorId={authorId}
          postId={postId}
          currentAuthor={currentUser}
        />
      </div>
    </li>
  );
}

export default Post;
