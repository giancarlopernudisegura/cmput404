import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { Alert, CircularProgress } from '@mui/material';
import { Box, Tab, Tabs } from '@mui/material';
import TabPanel from '../components/tabs/TabPanel';

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
import GitHubActivity from '../components/GitHubActivity';
import SectionTabs from '../components/tabs/SectionTabs';


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

    // Labels and section content 
    const [ sectionContent, setSectionContent ] = useState(Object());

    const [value, setValue] = useState(0);
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    }

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
                                if (post.visibility === 'PUBLIC')   {
                                    allPosts.push(post);
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
        setPostsLoading(false);
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

    // Effect to get inbox 
    useEffect(() => {
        function getInbox() {
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

    useEffect( () => {
        setSectionContent({
            'Public Posts': publicPosts,
            'Github Activity': githubActivity,
        });
        console.log('Ran sectionContents effect');
    }, [githubActivity, publicPosts]);

    

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
