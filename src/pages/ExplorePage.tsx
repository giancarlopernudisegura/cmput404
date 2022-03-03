import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import Post from '../components/Post';
import DrawerMenu from '../components/sidemenu-components/Drawer';
import { getPosts, getAllAuthors, get_author_id } from '../utils/apiCalls';

type ExplorePageProps = { path: string };


function ExplorePage({ path }: ExplorePageProps) {

    const [posts, setPosts] = useState(Array());

    useEffect(() => {
        function getPostsFromAPI() {
            console.log("Getting posts from API...");
            //TODO: temp, should display all authors with public posts
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
        </DrawerMenu>
    );
}

export default ExplorePage;
