import { h } from 'preact';
import Post from './Post';

type PostListProps = {
    initialPosts: Array<any>,
    currentAuthor?: string,
    onRemove?: Function,
}

function PostList({ initialPosts, currentAuthor, onRemove } : PostListProps){

    if (currentAuthor === undefined) {
        currentAuthor = 'Anonymous';
    }


    return(
        <div id="post-list" class="container">
            {initialPosts.length === 0 && <h2>No posts found!</h2>}
            <ul>
                {initialPosts.map(post => (
                    <Post
                        id={post.id}
                        title={post.title}
                        body={post.description}
                        author={post.author} 
                        currentAuthor={currentAuthor}
                        onRemove={onRemove}
                    />
                ))}
            </ul>

        </div>

    );
    
}

export default PostList;