import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { getFollowers, followerCall } from '../../utils/apiCalls';
import EditIcon from "@mui/icons-material/Edit";

import useFriends from '../hooks/useFriends';
import useFollowers from '../hooks/useFollowers';


type AuthorProps = {
    author: any,
    is_owner?: boolean,
};

function AuthorInfo({ author, is_owner = false }: AuthorProps) {
    // const [myFollowers, setMyFollowers] = useState(Array());
    // const [myFriends, setMyFriends] = useState(Array())

    if (author === undefined) {
        return <h1>Error loading information about this author.</h1>;
    }

    const myFollowers = useFollowers(author.id);
    const myFriends = useFriends(author.id, myFollowers);


    const editName = async () => {
        const name = window.prompt('Edit name');
        if (name !== null) {
            await fetch(`/authors/${author.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    displayName: name
                })
            });
            window.location.reload();
        }
    }


    return (
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

                <div className='flex flex-row space-x-8'>
                    <span>{myFriends.length} Friends</span>
                    <span>{myFollowers.length} Followers</span>
                </div>

            </div>
            {is_owner ?
                <div className="cursor-pointer">
                    <EditIcon onClick={editName} />
                </div>
                : null}

        </div>
    );
}

export default AuthorInfo;
