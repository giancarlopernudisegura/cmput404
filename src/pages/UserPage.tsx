import { h } from 'preact';
import DrawerMenu from "../components/sidemenu-components/Drawer";
import { CircularProgress } from '@mui/material';
import { useEffect, useState } from "preact/hooks";
import { get_author_id, followerCall } from '../utils/apiCalls';
import { Button } from "@mui/material";


type UserProps = {
    path: string,
    followId?: number
};

const UserPage = ({ path, followId }: UserProps) => {
    const [ doesFollow, setDoesFollow ] = useState(false);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ currentUserId, setCurrentUserId ] = useState(-1);

    useEffect(() => {
        // TODO CHANGE THIS!!! to a single call in the running time

        const isFollowerApiCall = async () => {
            const myUserId = parseInt(await get_author_id());
            setCurrentUserId(myUserId);

            let res;
            if (followId !== undefined) {
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
            setIsLoading(false);
        }

        isFollowerApiCall()
    }, []);

    const handleFollow = async () => {
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
    }

    return (
        <div>
            <DrawerMenu
            pageName="User"
            >
                {isLoading === true ? <CircularProgress /> : (
                    <div>
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