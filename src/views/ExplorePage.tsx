import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import Post from '../components/Post';
import { getPosts } from '../utils/apiCalls';

type ExplorePageProps = { path: string };


function ExplorePage({ path }: ExplorePageProps) {

    const [ posts, setPosts ] = useState([]);

    useEffect(() => {
        try {
            let author_id = 1;
            let response = getPosts(author_id);
            // console.log(response.data);
            // setPosts(response.data);
        } catch(err) {
            console.log(err);
        }
    });

    return (
        <div>
            <h1>Explore</h1>

            <div>
                <ul>
                    <li>
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