import { h } from 'preact';
import DrawerMenu from "../components/sidemenu-components/Drawer";
import { CircularProgress } from '@mui/material';
import { useEffect, useState } from "preact/hooks";
import { get_author_id, followerCall, getSpecAuthor, getPosts } from '../utils/apiCalls';
import { Alert, Button } from "@mui/material";
import Post from '../components/Post';

type UserProps = {
    path: string,
    followId?: number
};

const UserPage = ({ path, followId }: UserProps) => {
    const [ errMsg, setErrMsg] = useState("");
    const [ doesFollow, setDoesFollow ] = useState(false);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ isPostLoading, setIsPostLoading ] = useState(true);
    const [ currentUserId, setCurrentUserId ] = useState(-1);
    const [ authorInfo, setAuthorInfo ] = useState<null | any>(null);
    const [ posts, setPosts ] = useState(Array());


    useEffect(() => {
        // TODO CHANGE THIS!!! to a single call in the running time
        
        // Get the user's post 
        const getPostsApiCall = async (userId: number) => {
            try {
                const fetchedPosts = await getPosts(userId.toString());
                setPosts(fetchedPosts);
                setIsPostLoading(false);
            } catch (err) {
                setErrMsg((err as Error).message);
                setIsPostLoading(false);
            }
        }

        // Check if the user is following the author
        const isFollowerApiCall = async () => {
            const myUserId = parseInt(await get_author_id()); // Currently returns the loggedin used
            setCurrentUserId(myUserId);

            let res;
            let userRes;
            if (followId !== undefined) {
                userRes = await getSpecAuthor(followId);
                res = await followerCall(followId, myUserId, "GET");
            } else {
                return;
            }

            let follower = [];
            if (res.status === 200) {
                follower = res.items;
                if (follower.length === 0) {
                    setDoesFollow(false);
                } else {
                    setDoesFollow(true);
                }
            } else {
                setDoesFollow(false)
            }
            
            if (userRes.status === 200) {
                setAuthorInfo(userRes);
            }
            setIsLoading(false);
            
            getPostsApiCall(followId)

        }

        try {
            isFollowerApiCall();
        } catch (err) {
            setErrMsg((err as Error).message);
            setIsLoading(false);
        }
    }, []);

    const handleFollow = async () => {
        try {
            if (followId !== undefined) {
                let res;
                if (doesFollow === true) {
                    res = await followerCall(followId, currentUserId, "DELETE");
                    if (res.status === 204) {
                        setDoesFollow(false)
                    }
                } else {
                    res = await followerCall(followId, currentUserId, "PUT");
                    if (res.status === 200) {
                        setDoesFollow(true);
                    }
                }
            } else {
                return;
            }
        } catch(err) {
            setErrMsg((err as Error).message);
        }
    }

    return (
        <div>
            <DrawerMenu
            pageName="User"
            >
                {errMsg && (
                    <Alert severity="error">{errMsg}</Alert>
                )}
                {isLoading === true ? <CircularProgress /> : (
                    <div>
                        <div className="text-xl">
                            <img src={authorInfo.profileImage}
                                className="rounded-full w-1/5"></img>
                            <h1>{authorInfo.displayName ? `${authorInfo.displayName}` :  "No name for user"}</h1>
                        </div>
                        <p>{authorInfo && authorInfo.github}</p>
                        <Button onClick={() => handleFollow()}>
                            {doesFollow === true ? "Following": "Follow"}
                        </Button>
                    </div>
                )}

                {/* <h2>{userInfo.displayName} posts</h2> */}

                {isPostLoading === true ? <CircularProgress /> : (
                    <div class="container">
                        {posts.length === 0 && <h2>User has no posts</h2>}
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

                    </div>
                )}

            </DrawerMenu>

        </div>
    );
}

export default UserPage;