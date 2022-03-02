import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { getPosts, getAllAuthors } from '../utils/apiCalls';

import Post from '../components/Post';
import PostForm from '../components/PostForm';

type ExplorePageProps = { path: string };


function ExplorePage({ path }: ExplorePageProps) {

    const [ posts, setPosts ] = useState(Array());

    useEffect(() => {
        function getPostsFromAPI() {
            let author_id = 2; //TODO: temp, should display all authors with public posts 
            const response = getPosts(author_id);                        
            response.then(data => {
                setPosts(data);
            })
            .catch(err => {
                alert(err);
            });
        }
        getPostsFromAPI(); 
    
    }, []);

    

    return (
            <div id="explore">
                <PostForm />

                {posts.length > 0 &&
                    <ul className="grid grid-cols-1 gap-y-7">
                        {posts.map(post => (
                            <li>
                                <Post
                                    title={post.title}
                                    body={post.description}
                                    author={post.author} />
                            </li>
                        ))}

                    </ul>
                }

                {posts === undefined &&
                    <div>
                        <h1>No posts yet!</h1>
                    </div>
                }
            </div>

);
}

export default ExplorePage;