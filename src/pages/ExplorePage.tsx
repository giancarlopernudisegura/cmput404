import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import GitHubActivity from '../components/GitHubActivity';
import { getPosts, get_author_id, getInbox, getGithubStream } from '../utils/apiCalls';

import PostForm from '../components/forms/PostForm';
import DrawerMenu from '../components/sidemenu-components/Drawer';
import SearchBar from './SearchBar';
import PostList from '../components/PostList';


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
            <SearchBar />
            <PostForm />
            
            {posts.length > 0 &&
                <PostList posts={posts} currentAuthor={''} /> //FIXME: currentAuthor is undefined
            }

            {githubActivity.length > 0 &&
                <ul>
                    {githubActivity.map(event => (
                        <li>
                            <GitHubActivity
                                eventType={event.type}
                                repo={event.repo}
                                author={event.actor.login} />
                        </li>
                    ))}
                </ul>
            }

        </DrawerMenu>
    );
}

export default ExplorePage;
