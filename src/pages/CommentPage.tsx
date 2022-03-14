import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import {
  getInbox,
  getPosts,
  get_author_id,
  getAllAuthors,
  getCurrentAuthor,
  getRawPosts,
  getAllComments
} from "../utils/apiCalls";
import DrawerMenu from '../components/sidemenu-components/Drawer'
import Comment from '../components/comment-components/Comment'

type CommentPageProps = {
  path: string;
  post_id?: number | undefined;
};

function CommentPage({ path, post_id }: CommentPageProps) {
  const [comments, setComments] = useState(Array());

  useEffect(() => {

    function getCommentsFromPost() {
      
      console.log("Start searching for comments");
      get_author_id().then(authorID => getRawPosts(authorID))
      .then(data => getAllComments(data.items[0].author.id, data.items[0].id)) //TODO: Need a way to get the postId
      .then(data => setComments(data))
      .catch(err => {
        alert(err);
      });      
    }
    getCommentsFromPost();
  }, []);

  return (
    <div id="comment-page">
      <DrawerMenu pageName="Comments">
      <div id="list-of-comments">
        {comments.length < 1 ? (
          <div>
            <h1>No comments yet!</h1>
          </div>
        ) : (
          <ul>
            {comments.map((comment) => 
              <li key={comment.author}>
                <Comment author={comment.author} body={comment.comment} timeStamp={comment.published}/>
              </li>
            )}
          </ul>
        )}
      </div>
      </DrawerMenu>
    </div>
  );
}

export default CommentPage;
