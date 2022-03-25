import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { getFollowers, followerCall } from '../../utils/apiCalls';


type AuthorProps = {
    author: any,
};

function AuthorInfo({ author }: AuthorProps) {
    const [myFollowers, setMyFollowers] = useState(Array());
    const [myFriends, setMyFriends] = useState(Array())

    if (author === undefined) {
        return <h1>Error loading information about this author.</h1>;
    }

    useEffect( () => {

        async function fetchFollowers() {
            try {
                let result = await getFollowers(author.id);
                let followers = result.items;
                setMyFollowers(followers);

                return followers;
            }
            catch (err) {
                console.log('Error fetching followers:', err);
            }
        }   

        async function fetchFriends() {
            
            try {
                let followers = await fetchFollowers();
                var friends = new Array();

                for (let follower of followers) {
                    let res = await followerCall(follower.id, author.id, "GET");
                    // Make an API call to check if the author is following the follower
                    if (res.status === 200) {
                        let data = res.items;
                        // if the array is non-empty, it is a follow
                        if (data.length > 0) {
                            friends.push(follower);
                        }
                    } else {
                        throw Error();
                    }
                }
                setMyFriends(friends);

            } catch (err) {
                console.log('Error fetching friends:', err);
            }

        }
        fetchFriends();
      
    }, []);
    


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
                    <span>{myFriends.length} Friends</span>
                    <span>{myFollowers.length} Followers</span>
                </div>

            </div>

        </div>
    );
}

export default AuthorInfo;