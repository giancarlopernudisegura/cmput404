import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import GitHubActivity from '../components/GitHubActivity';
import { getPosts, get_author_id, inboxCall, getGithubStream } from '../utils/apiCalls';

import PostForm from '../components/forms/PostForm';
import DrawerMenu from '../components/sidemenu-components/Drawer';
import SearchBar from './SearchBar';
import PostList from '../components/PostList';
import { Alert } from '@mui/material';


type ExplorePageProps = { path: string };

function ExplorePage({ path }: ExplorePageProps) {
    // postForm states
    const [ newPostBody, setNewPostBody ] = useState<string>("");
    const [ newPostCat, setNewPostCat ] = useState<string>("");
    const [ newPostTitle, setNewPostTitle ] = useState<string>("");
    const [ newPostMkd, setNewPostMkd ] = useState<boolean>(false);

    // getPosts states
    const [ posts, setPosts ] = useState(Array());
    const [ githubActivity, setGithubActivity ] = useState(Array());
    const [ errMsg, setErrMsg ] = useState("");


    useEffect(() => {
        function getPostsFromAPI() {
            console.log("Getting posts from API...");
            get_author_id()
                .then(author_id => {
                    const response = inboxCall(author_id, "GET");
                    response
                        .then(data => {
                            // TODO: temp, only use posts from inbox for now
                            setPosts(data.items.filter((item: any) => item.type == "post"));
                        })
                        .catch(err => {
                            setErrMsg(err.message);
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
                        .catch(err => {
                            setErrMsg(err.message);
                        });
                })
                .catch(console.error);
        })();
    }, []);

    

    return (
        <DrawerMenu pageName="Explore">
            <SearchBar />
            {errMsg && (
                <Alert severity="error">{errMsg}</Alert>
            )}
            <PostForm
                body={newPostBody}
                setBody={setNewPostBody}
                category={newPostCat}
                setCategory={setNewPostCat}
                title={newPostTitle}
                setTitle={setNewPostTitle}
                markdown={newPostMkd}
                setMarkdown={setNewPostMkd}
            />
            
            {posts.length > 0 &&
                <PostList 
                    initialPosts={posts} 
                /> 
            }


            {githubActivity.length > 0 && 
                <div>
                    <h2>My Github Activity</h2>
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
                </div>
            }

        </DrawerMenu>
    );
}

export default ExplorePage;
