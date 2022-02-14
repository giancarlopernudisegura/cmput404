import { h } from 'preact';
import Post from '../components/Post';

type ExplorePageProps = { path: string };

function ExplorePage({ path }: ExplorePageProps) {
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