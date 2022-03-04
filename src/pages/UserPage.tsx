import { h } from 'preact';
import DrawerMenu from "../components/sidemenu-components/Drawer";
import { CircularProgress } from '@mui/material';
import { useEffect, useState } from "preact/hooks";
import { get_author_id, followerCall, getSpecAuthor } from '../utils/apiCalls';
import { Alert, Button } from "@mui/material";


type UserProps = {
    path: string,
    followId?: number
};

const UserPage = ({ path, followId }: UserProps) => {
    const [ errMsg, setErrMsg] = useState("");
    const [ doesFollow, setDoesFollow ] = useState(false);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ currentUserId, setCurrentUserId ] = useState(-1);
    const [ userInfo, setUserInfo ] = useState<null | any>(null);

    useEffect(() => {
        // TODO CHANGE THIS!!! to a single call in the running time

        const isFollowerApiCall = async () => {
            const myUserId = parseInt(await get_author_id());
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
                setUserInfo(userRes);
            }
            setIsLoading(false);
        }

        try {
            isFollowerApiCall()
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
                        <p>{userInfo && userInfo.github}</p>
                        <Button onClick={() => handleFollow()}>
                            {doesFollow === true ? "Following": "Follow"}
                        </Button>
                    </div>
                )}

            </DrawerMenu>

        </div>
    );
}

export default UserPage;