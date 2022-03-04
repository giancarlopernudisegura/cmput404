import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import GitHubActivity from '../components/GitHubActivity';
import { getPosts, get_author_id, getInbox, getGithubStream } from '../utils/apiCalls';
import Post from '../components/Post';
import PostForm from '../components/PostForm';
import DrawerMenu from '../components/sidemenu-components/Drawer';
import SearchField from '../components/search/SearchField';

type ExplorePageProps = { path: string };

function ExplorePage({ path }: ExplorePageProps) {

    const [posts, setPosts] = useState(Array());
    const [githubActivity, setGithubActivity] = useState(Array());

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
        (() => {
            console.log("Getting github activity from API...");
            get_author_id()
                .then(author_id => {
                    getGithubStream(author_id)
                        .then(setGithubActivity)
                        .catch(console.error);
                })
                .catch(console.error);
        })();
    }, []);

    

    return (
        <DrawerMenu pageName="Explore">
            <SearchField />
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

            {githubActivity.length > 0 &&
                <ul>
                    {githubActivity.map(event => (
                        <li>
                            {console.log(event)}
                            <GitHubActivity
                                eventType={event.type}
                                repo={event.repo}
                                author={event.actor.login} />
                        </li>
                    ))}
                </ul>
            }
        </div>
        </DrawerMenu>
    );
}

export default ExplorePage;
