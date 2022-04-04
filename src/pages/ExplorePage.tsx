import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { Alert, Button, CircularProgress, Box, Tab, Tabs } from '@mui/material';


import { 
    getPosts, 
    getAllAuthors,
    get_author_id, 
    inboxCall, 
    getGithubStream, 
    newPublicPost,
} from '../utils/apiCalls';

import { 
    LOAD_MORE_TEXT, 
    NO_MORE_POSTS_TEXT, 
    PUBLIC, 
    SUCCESS, 
    ALERT_NO_MORE_POSTS_TEXT 
} from '../utils/constants';

import PostForm from '../components/forms/PostForm';
import DrawerMenu from '../components/sidemenu-components/Drawer';
import SearchBar from './SearchBar';
import TabPanel from '../components/tabs/TabPanel';
import PostList from '../components/PostList';
import GitHubActivity from '../components/GitHubActivity';


type ExplorePageProps = { path: string };

function ExplorePage({ path }: ExplorePageProps) {
    // Loaders 
    const [postsLoading, setPostsLoading] = useState(true);
    const [githubLoading, setGithubLoading] = useState(true);

    // postForm states
    const [ newPostBody, setNewPostBody ] = useState<string>("");
    const [ newPostCat, setNewPostCat ] = useState<string>("");
    const [ newPostTitle, setNewPostTitle ] = useState<string>("");
    const [ newPostIsMkd, setNewIsPostMkd ] = useState<boolean>(false);

    // getPosts states
    const [ publicPosts, setPublicPosts ] = useState(Array());
    const [ githubActivity, setGithubActivity ] = useState(Array());
    const [ errMsg, setErrMsg ] = useState("");
    const [ buttonText, setButtonText ] = useState(LOAD_MORE_TEXT);

    // Handle tab changes 
    const [value, setValue] = useState(0);
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    }

    const [ authorPage, setAuthorPage ] = useState(1);

    const getNextAuthorPage = async () => {
        try {
            let results = await getAllAuthors(authorPage);
            let authors = results.items;
            let allPosts : Array<any> = [];
            let allPromises : Array<Promise<any>> = [];
            authors = authors.map((author : any) => {
                author['pageNumber'] = 1;
                return author;
            });

            if (authors.length === 0) {
                alert(ALERT_NO_MORE_POSTS_TEXT);
                setButtonText(NO_MORE_POSTS_TEXT);
            }

            for (let i = 0; i < authors.length; i++) {
                let author = authors[i];
                allPromises.push(new Promise<any>( async (resolve, reject) => {
                    let authorPosts : Array<any> = [];
                    while (author.pageNumber !== null) {
                        let data : any = await getPosts(author.id, author.pageNumber);
                        if (data.items.length === 0) {
                            author.pageNumber = null;
                        } else {
                            for (let post of data.items) {
                                if (post.visibility === PUBLIC) {
                                    authorPosts.push(post);
                                }
                            }
                            author.pageNumber++;
                        }
                    }
                    resolve(authorPosts);
                }));
            }

            let promiseRes = await Promise.all(allPromises);
            promiseRes.forEach((posts : Array<any>) => {
                allPosts.push(...posts);
            });
            setAuthorPage(authorPage + 1);
            setPublicPosts([...publicPosts, ...allPosts]);
        } catch (err) {
            setErrMsg('Error retrieving posts: ' + (err as Error).message);
        }
        setPostsLoading(false);
    }
    
    // Effect to get all posts
    useEffect( () => {
        async function getPostsFromAllAuthors() {
            getNextAuthorPage();
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
        setGithubLoading(false);
    }, []);
    
    return (
        <DrawerMenu pageName="Explore">
            {errMsg && (
                <Alert severity="error">{errMsg}</Alert>
            )}
            <SearchBar />

            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} >
                        <Tab label="Public Posts" />
                        <Tab label="Github Activity" />
                    </Tabs>
                </Box>

                <TabPanel value={value} index={0}>
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
                    {postsLoading === true ?
                        <CircularProgress /> : (
                            <div id="public-posts">
                                <PostList
                                    initialPosts={publicPosts}
                                />

                                <Button
                                    className="w-fit"
                                    onClick={() => getNextAuthorPage()}
                                    variant="contained"
                                >
                                    {buttonText}
                                </Button>
                            </div>
                        )}
                </TabPanel>
                <TabPanel value={value} index={1}>
                    {githubLoading === true ?
                        <CircularProgress /> : (
                            <div id="github-activity">
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
                        )
                    }
                </TabPanel>
            </Box>
        </DrawerMenu>
    );
}

export default ExplorePage;
