import { Divider, Button, IconButton } from "@mui/material";
import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import Favorite from "@mui/icons-material/Favorite";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import {
  getCommentLikes,
  addCommentLikes,
  deleteCommentLike,
  get_author_id,
} from "../../utils/apiCalls";

type CommentProps = {
  author: string;
  body: string;
  timeStamp: string;
  id: string;
  authorId: string;
  postId: string;
  currentAuthor?: string;
};

function Comment({
  author,
  body,
  timeStamp,
  id,
  authorId,
  postId,
  currentAuthor,
}: CommentProps) {
  const [commentLikes, setCommentLikes] = useState(Array());
  const [errMsg, setErrMsg] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [numLikes, setNumLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    async function commentLikes(authorId: string, postId: string, id: string) {
      let response;
      try {
        const currentUserIdTemp = await get_author_id();
        setCurrentUserId(currentUserIdTemp);
        response = await getCommentLikes(currentUserIdTemp, postId, id);
        setCommentLikes(response.likes);
        setNumLikes(response.likes.length);

        // check if user liked the post
        response.likes.forEach((like: any) => {
          if (like.author.id === currentUserIdTemp) {
            setIsLiked(true);
          }
        });
        console.log("COMMENT LIKES", response);
      } catch (err) {
        setErrMsg((err as Error).message);
      }
    }

    commentLikes(authorId, postId, id);
    console.log(isLiked);
  }, []);

  const toggleLike = async () => {
    if (isLiked) {
      await deleteCommentLike(authorId, postId, id);
      setNumLikes(numLikes - 1);
      setIsLiked(false);
      console.log("delete");
    } else {
      await addCommentLikes(authorId, postId, id);
      setNumLikes(numLikes + 1);
      setIsLiked(true);
      console.log("add");
    }
    // setIsLiked(!isLiked);
  };

  return (
    <div
      id="comment-component"
      className="border-solid border-b-1 w-full border-zinc-700 m-auto py-4 px-5"
    >
      <div className="grid grid-cols-1 gap-y-2">
        <div
          class="container-for-timestamp-displayname"
          className="flex flex-row justify-between"
        >
          <div
            class="displayname"
            className="font-semibold tracking-wide text-lg"
          >
            {author}
          </div>
          <div class="timestamp" className="font-bold tracking-tight text-md">
            {timeStamp}
          </div>
        </div>
        <div className="my-2 pb-4">
          <p className="text-lg">{body}</p>
        </div>
        <div
          id="likes-and-buttons"
          className="flex flex-row justify-between pb-4"
        >
          <p>Likes: {numLikes === undefined ? 0 : numLikes}</p>

          <div id="add-delete-buttons" className="">
            <IconButton color="primary" onClick={() => toggleLike()}>
              {isLiked ? (
                <Favorite fontSize="large" />
              ) : (
                <FavoriteBorderOutlinedIcon fontSize="large" />
              )}
            </IconButton>
          </div>
        </div>
      </div>
      <Divider />
    </div>
  );
}

export default Comment;
