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

                // APPROACH 1
                let promises: any = [];
                followers.forEach((follower: any) => {
                    promises.push(followerCall(follower.id, author.id, "GET"));
                });

                let followerResponse = await Promise.all(promises);

                // Get the friends
                followerResponse.forEach((res: any) => {
                    if (res.status === 200) {
                        let data = res.items;
                        if (data.length > 0) {
                            // TODO: DELLA Check if the user is following the author or not
                            friends.push(data[0]);
                        }
                    } else {
                        throw Error();
                    }
                });

                console.log('FRIENDS', friends);
                setMyFriends(friends);
            

                // // APPROACH 2
                // for (let follower of followers) {

                // }

            } catch (err) {
                console.log('Error fetching friends:', err);
            }

            // followersPromise
            //     .then(followers => {

            //         var friends = new Array();

            //         // Iterate through the followers and check if the author is following any of their followers 
            //         followers.forEach( (follower: any) => {
            //             // Make an API call to check if the author is following the follower
            //             let result = followerCall(follower.id, author.id, "GET")
            //             result.then(data => { 
            //                 // if the array is non-empty, it is a follow
            //                 if (data.items.length > 0) {
            //                     friends.push(follower);
            //                 }
            //             });
            //         });

            //         return friends;
            //     })
            //     .then( (friends) => { 
            //         console.log('friends:', friends);
            //         setMyFriends(friends); //FIXME returns 0, i don't have friends 😭
            //     })
            //     .catch(err => { console.log('Error in fetchFriends:', err) });

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
                    <span>{myFriends.length} Friends</span>
                    <span>{myFollowers.length} Followers</span>
                </div>

            </div>

        </div>
    );
}

export default AuthorInfo;