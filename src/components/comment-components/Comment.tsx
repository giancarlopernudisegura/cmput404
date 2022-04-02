import { Divider, Button } from "@mui/material";
import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { getCommentLikes, addCommentLikes, deleteCommentLike } from "../../utils/apiCalls";

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

  useEffect(() => {
    function commentLikes(authorId: string, postId: string, id: string) {
      getCommentLikes(authorId.toString(), postId, id)
        .then((data) => setCommentLikes(data.likes))
        .catch((err) => setErrMsg(err.message));
    }

    commentLikes(authorId, postId, id);
  }, []);

  //Add likes for a comment
  const addLike = () => {
    addCommentLikes(authorId, postId, id);
    for (let i = 0; i < commentLikes.length; i++) {
      if (commentLikes[i].author.displayName == currentAuthor) {
        alert("You already liked this comment.");
      }
    }
  };

  const deleteLike = () => {
    for (let i = 0; i < commentLikes.length; i++) {
      if (commentLikes[i].author.displayName == currentAuthor) {
        deleteCommentLike(authorId, postId, id);
      } else {
        alert("You haven't liked this post yet.");
      }
    }
  }

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
          <p>
            Likes: {commentLikes.length === undefined ? 0 : commentLikes.length}
          </p>
          
          <div id="add-delete-buttons" className="flex flex-row justify-evenly space-x-4">
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
          </div>
          
        </div>
      </div>
      <Divider />
    </div>
  );
}

export default Comment;
