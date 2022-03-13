import { h } from 'preact';
import Post from './Post';

type PostListProps = {
    posts: any[],
}

function PostList({ posts }: PostListProps) {
    return(
        <div id="post-list" class="container">
            {posts.length === 0 && <h2>No posts found!</h2>}
            <ul>
                {posts.map(post => (
                    <li>
                        <Post
                            contentType={post.contentType}
                            title={post.title}
                            body={post.description}
                            author={post.author} />
                    </li>
                ))}
            </ul>

        </div>

    );
}

export default PostList;