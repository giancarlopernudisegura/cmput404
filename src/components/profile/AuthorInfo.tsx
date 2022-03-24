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

        fetchFollowers();
    }, [])

    
    useEffect( () => {

        async function fetchFriends() {
            
            try {
                var friends = new Array();

                myFollowers.forEach( async (follower: any) => {
                    let result = await followerCall(follower.id, author.id, "GET")
                    let data = result.items;
                    if (data.length > 0) {
                        friends.push(follower);
                    }
                });
                console.log('FRIENDS', friends);
                setMyFriends(friends);

            } catch (err) {
                console.log('Error fetching friends:', err);
            }

        }
        fetchFriends();
      
    }, [myFollowers]); // run after myFollowers has been set 
    


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