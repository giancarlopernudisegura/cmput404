import { h } from 'preact';
import DrawerMenu from "../components/sidemenu-components/Drawer";
import { CircularProgress } from '@mui/material';
import { useEffect, useState } from "preact/hooks";
import { get_author_id, followerCall, getSpecAuthor, getPosts, followerRequest } from '../utils/apiCalls';
import { Alert, Button } from "@mui/material";

import PostList from '../components/PostList';
import AuthorInfo from '../components/profile/AuthorInfo';

type UserProps = {
    path: string,
    followId?: string
};

enum followStatus {
    following,
    notFollowing,
    pending
}

const UserPage = ({ path, followId }: UserProps) => {
    const [errMsg, setErrMsg] = useState("");
    const [doesFollow, setDoesFollow] = useState(followStatus.notFollowing);
    const [isLoading, setIsLoading] = useState(true);
    const [isPostLoading, setIsPostLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState("");
    const [authorInfo, setAuthorInfo] = useState<null | any>(null);
    const [posts, setPosts] = useState(Array());
    const BACKEND_HOST = process.env.FLASK_HOST;


    useEffect(() => {

        // Get the user's post 
        const getPostsApiCall = async (userId: string) => {
            try {
                const fetchedPosts = await getPosts(userId);
                setPosts(fetchedPosts);
                setIsPostLoading(false);
            } catch (err) {
                setErrMsg((err as Error).message);
                setIsPostLoading(false);
            }
        }

        // Check if the user is following the author
        const isFollowerApiCall = async () => {
            const myUserId = await get_author_id(); // Currently returns the loggedin used
            setCurrentUserId(myUserId);

            let userRes;
            if (followId === undefined) return;
            userRes = await getSpecAuthor(followId);
            const follow = await followerRequest(followId, myUserId);
            if (follow !== undefined) {
                setDoesFollow(followStatus.pending);
            } else {
                const res = await followerCall(followId, myUserId, "GET");
                if (res.status === 200) {
                    const follower = res.items;
                    if (follower.length === 0) {
                        setDoesFollow(followStatus.notFollowing);
                    } else {
                        setDoesFollow(followStatus.following);
                    }
                } else {
                    setDoesFollow(followStatus.notFollowing)
                }
            }

            if (userRes.status === 200) {
                setAuthorInfo(userRes);
            }
            setIsLoading(false);

            getPostsApiCall(followId);

        }

        try {
            isFollowerApiCall();
        } catch (err) {
            setErrMsg((err as Error).message);
            setIsLoading(false);
        }
    }, []);

    const handleFollow = async () => {
        if (followId === undefined) return;
        try {
            let res;
            if (doesFollow === followStatus.pending) {
                //
            } else if (doesFollow === followStatus.following) {
                res = await followerCall(followId, currentUserId, "DELETE");
                if (res.status === 204) {
                    setDoesFollow(followStatus.notFollowing);
                }
            } else {
                res = await followerCall(followId, currentUserId, "PUT");
                if (res.status === 200) {
                    setDoesFollow(followStatus.pending);
                }
            }
        } catch (err) {
            setErrMsg((err as Error).message);
        }
    }

    async function sharePost(followId: string, postId: string) {

        window.location.href = `${BACKEND_HOST}/app/user/${followId}#${postId}`

        navigator.clipboard.writeText(window.location.href)

        console.log(`${BACKEND_HOST}/app/user/${followId}#${postId}`)

    }

    const renderFollowButtonText = () => {
        if (doesFollow === followStatus.following) {
            return "Following"
        } else if (doesFollow === followStatus.notFollowing) {
            return "Follow"
        } else {
            return "Requested"
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
                    <div className="flex flex-col m-auto items-center">
                        <AuthorInfo
                            author={authorInfo}
                        />
                        <Button
                            className="w-fit"
                            onClick={() => handleFollow()}
                        >
                            {renderFollowButtonText()}
                        </Button>
                    </div>
                )}

                {isPostLoading === true ? <CircularProgress /> : (
                    <PostList
                        initialPosts={posts}
                        onShare={sharePost}
                    />
                )}

            </DrawerMenu>

        </div>
    );
}

export default UserPage;
