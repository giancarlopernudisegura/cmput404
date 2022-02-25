import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import Post from '../components/Post';
import { getPosts } from '../utils/apiCalls';

type ExplorePageProps = { path: string };


function ExplorePage({ path }: ExplorePageProps) {

    const [ posts, setPosts ] = useState(Array());

    useEffect(() => {
        function getPostsFromAPI() {
            console.log("Getting posts from API...");
            let author_id = 1;
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

    console.log("POSTS 2:", posts);
    return (
        <div>
            <h1>Explore</h1>
    
            <div>
                <ul>
                    <li>
                        {/* TODO: display post here */}
                        <Post
                            title="Hello World" 
                            body="This is a body" 
                            author="John Doe" />
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default ExplorePage;