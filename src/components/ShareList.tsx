import { h } from "preact";
import Post from "./Post";
import { MARKDOWN, PLAIN } from "../utils/constants";

type ShareListProps = {
  sharedPosts: Array<any>;
  currentAuthor?: string;
  onRemove?: Function;
  onShare?: Function;
  handleEdit?: Function;
};

function ShareList({ sharedPosts, onShare }: ShareListProps) {
  return (
    <div id="share-list" class="container">
      {sharedPosts.length === 0 ? (
        "No shared posts"
      ) : (
        <ul>
          {sharedPosts
            .map((post) => (
              <Post
                postId={post.id}
                title={post.title}
                body={post.description}
                authorName={post.author.displayName}
                authorId={post.author.id}
                onShare={onShare}
                contentType={post.contentType}
                visibility={post.visibility}
                unlisted={post.unlisted}
              />
            ))}
        </ul>
      )}
    </div>
  );
}

export default ShareList;