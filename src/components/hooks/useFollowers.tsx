import { useState, useEffect } from 'preact/hooks';

import { getFollowers } from '../../utils/apiCalls';


export default function useFollowers(authorId: string) {
    if (authorId === "") {
        return [];
    }

    const [followers, setFollowers] = useState([]);

    useEffect(() => {
        async function fetchFollowers() {
            try {
                let result = await getFollowers(authorId);
                let followers = result.items;
                setFollowers(followers);

                return followers;
            }
            catch (err) {
                console.log('Error fetching followers:', err);
            }
        }
        fetchFollowers();  
    }, []);

    return followers;
}