import { h } from 'preact';
import Post from './Post';

type PostListProps = {
    posts: any[],
    currentAuthor: string
}

function PostList({ posts, currentAuthor }: PostListProps) {
    if (currentAuthor === undefined) {
        currentAuthor = 'Anonymous';
    }

    return(
        <div id="post-list" class="container">
            {posts.length === 0 && <h2>No posts found!</h2>}
            <ul>
                {posts.map(post => (
                    <li>
                        <Post
                            title={post.title}
                            body={post.description}
                            author={post.author} 
                            currentAuthor={currentAuthor}/>
                    </li>
                ))}
            </ul>

        </div>

    );
    
}

export default PostList;