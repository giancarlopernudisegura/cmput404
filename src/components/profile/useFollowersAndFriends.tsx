import { useState, useEffect } from 'preact/hooks';
import { 
    getFollowers,
     } from '../../utils/apiCalls';

type useFollowersProps = {
    authorId: string,
}

export default function useFollowersAndFriends({authorId}:  useFollowersProps)  {
    const [followers, setFollowers] = useState([]);
    console.log('AUTHORID', authorId);
    
    useEffect(() => {
        try {
            async function fetchFollowers(authorId: string) {
                getFollowers(authorId)
                    .then(result => {
                        let followers = result.items;
                        setFollowers(followers);
                    })
            }
            fetchFollowers(authorId);
        }
        catch (err) {
            console.log('Error fetching followers:', err);
        }
    }, [])

    return followers;
}
