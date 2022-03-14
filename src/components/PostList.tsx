import { h } from 'preact';
import Post from './Post';

type PostListProps = {
    initialPosts: Array<any>,
    currentAuthor?: string,
}

function PostList({ initialPosts, currentAuthor} : PostListProps){

    if (currentAuthor === undefined) {
        currentAuthor = 'Anonymous';
    }


    return(
        <div id="post-list" class="container">
            {initialPosts.length === 0 && <h2>No posts found!</h2>}
            <ul>
                {initialPosts.map(post => (
                    <Post
                        title={post.title}
                        body={post.description}
                        author={post.author} 
                        currentAuthor={currentAuthor}
                    />
                ))}
            </ul>

        </div>

    );
    
}

export default PostList;