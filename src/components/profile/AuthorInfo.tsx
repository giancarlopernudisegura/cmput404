import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { getFollowers, followerCall } from '../../utils/apiCalls';
import useFollowersAndFriends from './useFollowersAndFriends';


type AuthorProps = {
    author: any,

};

function AuthorInfo({ author }: AuthorProps) {
    const [followers, setFollowers] = useState([]);
    const [friends, setFriends] = useState<Array<any>>([])

    if (author === undefined) {
        return <h1>Error loading information about this author.</h1>;
    }


    useEffect( () => {
        async function fetchFollowers() {
            try {
                let result = await getFollowers(author.id);
                let followers = result.items;
                setFollowers(followers);

                return followers;
            }
            catch (err) {
                console.log('Error fetching followers:', err);
            }
        }

        async function fetchFriends() {
            let followersPromise = fetchFollowers();
            console.log('FOLLOWERS PROMISE', followersPromise);

            followersPromise
                .then(followers => {

                    var friends: Array<object> = [];

                    followers.forEach( (follower: any) => {
                        console.log('initiated', author.id, 'to', follower.id);
                        let result = followerCall(follower.id, author.id, "GET")
                        result.then(data => { 
                            // if the array is non-empty, then the author is following their follower
                            if (data.items.length > 0) {
                                friends.push(follower);
                            }
                        });
                    });

                    return friends;
                })
                .then( (friends) => { 
                    setFriends(friends);
                })
                .catch(err => { console.log('Error in fetchFriends:', err) });

        }
        fetchFriends();

    }, [])




    return(
        <div className="flex justify-evenly w-full py-5">
            <img src={author.profileImage}
                className="rounded-full w-1/5">
            </img>
            <div className="flex flex-col justify-center items-center text-left space-y-4">

                <h1 className="text-xl font-semibold">
                    {author.displayName ? `${author.displayName}` : "No Name Found"}
                </h1>

                {author.github ? 
                    <a href={`${author.github}`}
                        className="text-sm font-thin text-gray-400 hover:text-blue-500">
                        {author.github}
                    </a> 
                : null}

                {/* TODO: add friends */}
                <div className='flex flex-row space-x-8'>
                    <span>{friends.length} Friends</span>
                    <span>{followers.length} Followers</span>
                </div>

            </div>

        </div>
    );
}

export default AuthorInfo;