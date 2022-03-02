import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import Post from '../components/Post';
import { getPosts, getAllAuthors } from '../utils/apiCalls';

type ExplorePageProps = { path: string };


function ExplorePage({ path }: ExplorePageProps) {

    const [ posts, setPosts ] = useState(Array());

    useEffect(() => {
        function getPostsFromAPI() {
            console.log("Getting posts from API...");
            let author_id = 1; //TODO: temp, should display all authors with public posts 
            const response = getPosts(author_id);                        
            response.then(data => {
                setPosts(data);
            })
            .catch(err => {
                alert(err);
            });
        }
        getPostsFromAPI(); 
    console.log(posts);
    }, []);

    return (
            <div>
                {posts.length > 0 &&
                    <ul>
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