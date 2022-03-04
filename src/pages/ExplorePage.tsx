import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { getPosts, get_author_id } from '../utils/apiCalls';

import Post from '../components/Post';
import PostForm from '../components/PostForm';
import DrawerMenu from '../components/sidemenu-components/Drawer';
import SearchBar from './SearchBar';


type ExplorePageProps = { path: string };

function ExplorePage({ path }: ExplorePageProps) {

    const [posts, setPosts] = useState(Array());

    useEffect(() => {
        function getPostsFromAPI() {
            console.log("Getting posts from API...");
            get_author_id()
                .then(author_id => {
                    const response = getPosts(author_id);
                    response
                        .then(data => {
                            setPosts(data);
                        })
                        .catch(err => {
                            alert(err);
                        });
                })
                .catch(console.error);
        }
        getPostsFromAPI();
    }, []);

    

    return (
        <DrawerMenu pageName="Explore">
            <SearchBar />
            <PostForm />
            
            <div id="post-grid">
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
        </DrawerMenu>
    );
}

export default ExplorePage;
