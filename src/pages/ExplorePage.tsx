import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import Post from '../components/Post';
import { get_author_id, getInbox } from '../utils/apiCalls';

type ExplorePageProps = { path: string };


function ExplorePage({ path }: ExplorePageProps) {

    const [posts, setPosts] = useState(Array());

    useEffect(() => {
        function getPostsFromAPI() {
            console.log("Getting posts from API...");
            get_author_id()
                .then(author_id => {
                    const response = getInbox(author_id);
                    response
                        .then(data => {
                            // TODO: temp, only use posts from inbox for now
                            setPosts(data.items.filter((item: any) => item.type == "post"));
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
