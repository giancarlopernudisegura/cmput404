import { h } from "preact";
import Post from "./Post";
import { MARKDOWN, PLAIN } from "../utils/constants";

type PostListProps = {
    initialPosts: Array<any>,
    currentAuthor?: string,
    onRemove?: Function,
    handleEdit?: Function
}

function PostList({ initialPosts, currentAuthor, onRemove, handleEdit } : PostListProps){

  if (currentAuthor === undefined) {
    currentAuthor = 'Anonymous';
  }

  return(
    <div id="post-list" class="container">
      {initialPosts.length === 0 && <h2>No posts found!</h2>}
      <ul>
          {initialPosts
            .filter(post => post.contentType === MARKDOWN || post.contentType === PLAIN)
            .map(post => (
              <Post
                postId={post.postId}
                title={post.title}
                body={post.description}
                authorName={post.authorName}
                authorId={post.authorId}
                currentAuthor={currentAuthor}
                onRemove={onRemove}
                handleEdit={handleEdit}
                contentType={post.contentType}
                visibility={post.visibility}
                unlisted={post.unlisted}
              />
            ))
          }
        </ul>

    </div>

  );
    
}

export default PostList;
