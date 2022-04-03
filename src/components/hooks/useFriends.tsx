import { useState, useEffect } from 'preact/hooks';
import { followerCall } from '../../utils/apiCalls';


export default function useFollowers(authorId: string, followers: Array<any>) {
    if (authorId === "" || followers.length === 0) {
        return [];
    }
    
    const [friends, setFriends] = useState<Array<any>>([]);

    useEffect(() => {

        const fetchFriends = async () => {
            var friendsList = new Array<any>();

            for (let follower of followers) {
                let res = await followerCall(follower.id, authorId, "GET");
                // Make an API call to check if the author is following the follower
                if (res.status === 200) {
                    let data = res.items;
                    // if the array is non-empty, it is a follow
                    if (data.length > 0) {
                        friendsList.push(follower);
                    }
                } else {
                    throw Error();
                }
            }
            setFriends(friendsList);
            
        }
        
        fetchFriends();

    }, []);

    return friends;
}