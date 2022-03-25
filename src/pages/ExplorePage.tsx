import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import GitHubActivity from '../components/GitHubActivity';
import { 
    getPosts, 
    get_author_id, 
    inboxCall, 
    getGithubStream, 
    newPublicPost,
    getAllAuthorsWithoutPag
 } from '../utils/apiCalls';

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
    const [ newPostIsMkd, setNewIsPostMkd ] = useState<boolean>(false);

    // getPosts states
    const [ publicPosts, setPublicPosts ] = useState(Array());
    const [ githubActivity, setGithubActivity ] = useState(Array());
    const [ errMsg, setErrMsg ] = useState("");

    // Effect to get all posts
    useEffect( () => {
        async function getPostsFromAllAuthors() {
            // get all authors 
            try {
                let results = await getAllAuthorsWithoutPag();
                let authors = results.items;
                let allPosts : Array<any> = [];

                for (let author of authors) {
                    let authorsPosts = getPosts(author.id);
                    authorsPosts.then( (data) => {

                        // data is the list of posts from each author
                        if (data.length > 0) {
                            
                            for (let post of data) {
                                console.log('POST', post.postId);
                                if (post.visibility === 'PUBLIC')   {
                                    allPosts.push(post);
                                    console.log('pushed to promises')
                                }
                                else {
                                    console.log(post.id, 'is private');
                                }
                            }
 
                        }
                    });
                }

                setPublicPosts(allPosts);
                
            } catch (err) {
                setErrMsg('Unable to get all posts: ' + (err as Error).message);
            }

        }

        getPostsFromAllAuthors();
    }, []);

    // Effect to get github activity
    useEffect( () => {
        function fetchGithubStream() {
            get_author_id()
                .then(author_id => {
                    getGithubStream(author_id)
                        .then(setGithubActivity)
                        .catch(err => {
                            setErrMsg(err.message);
                        });
                })
                .catch(console.error);
        };
        fetchGithubStream();
    }, []);

    // Effect to get inbox 
    useEffect(() => {
        function getInbox() {
            console.log("Getting posts from API...");
            get_author_id()
                .then(author_id => {
                    const response = inboxCall(author_id, "GET");
                    response
                        .then(data => {
                            // TODO: temp, only use posts from inbox for now
                            setPublicPosts(data.items.filter((item: any) => item.type == "post"));
                        })
                        .catch(err => {
                            setErrMsg(err.message);
                        });
                })
                .catch(console.error);
        }
        // getInbox();

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
                isMarkdown={newPostIsMkd}
                setIsMarkdown={setNewIsPostMkd}
                buttonName={"Share Post"}
                submitAction={newPublicPost}
            />
            
            {publicPosts.length > 0 &&
                <PostList 
                    initialPosts={publicPosts} 
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
