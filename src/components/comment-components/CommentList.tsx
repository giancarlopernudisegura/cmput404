import { h } from "preact";
import Comment from "../comment-components/Comment";

/**
 * List component for all comments related to a specific post
 */

type CommentListProps = {
  allComments: Array<any>;
  authorId: string;
  postId: string;
  currentAuthor: string;
};

function CommentList({ allComments, authorId, postId, currentAuthor }: CommentListProps) {
  return (
    <div id="list-of-comments">
      {allComments.length < 1 ? (
        <div>
          <h1>No comments yet!</h1>
        </div>
      ) : (
        <ul>
          {allComments.map((comment) => (
            <li key={comment.author}>
              <Comment
                author={comment.author}
                body={comment.content}
                timeStamp={comment.published}
                id={comment.id}
                authorId={authorId}
                postId={postId}
                currentAuthor={currentAuthor}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CommentList;
