import { h } from 'preact';
import DrawerMenu from "../components/sidemenu-components/Drawer";
import { CircularProgress } from '@mui/material';
import { useEffect, useState } from "preact/hooks";
import { get_author_id, followerCall, getSpecAuthor, getPosts, followerRequest } from '../utils/apiCalls';
import { Alert, Button } from "@mui/material";

import PostList from '../components/PostList';
import AuthorInfo from '../components/profile/AuthorInfo';
import { Author } from '../types';

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
    const [currentUserInfo, setCurrentUserInfo] = useState<null | Author>(null);
    const [authorInfo, setAuthorInfo] = useState<null | Author>(null);
    const [posts, setPosts] = useState(Array());
    const BACKEND_HOST = process.env.FLASK_HOST;


    useEffect(() => {
        // Get the user's post 
        const getPostsApiCall = async (userId: string) => {
            try {
                const fetchedPosts = await getPosts(userId);
                setPosts(fetchedPosts.items);
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
            const currUserRes = await getSpecAuthor(myUserId);
            setCurrentUserInfo(currUserRes as Author);

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
                setAuthorInfo(userRes as Author);
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
        if (currentUserInfo === null) return;
        if (authorInfo === null) return;
        try {
            let res;
            if (doesFollow === followStatus.following) {
                res = await followerCall(followId, currentUserId, "DELETE");
                if (res.status === 204) {
                    setDoesFollow(followStatus.notFollowing);
                }
            } else if (doesFollow === followStatus.notFollowing) {
                const followRequestObject = {
                    type: "follow",
                    summary: `${currentUserInfo.displayName} wants to follow ${authorInfo.displayName}.`,
                    object: authorInfo,
                    actor: currentUserInfo
                }
                res = await fetch(`/authors/${followId}/inbox`, {
                    method: "POST",
                    body: JSON.stringify(followRequestObject),
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
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
