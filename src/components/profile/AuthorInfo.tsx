import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { getFollowers, get_author_id } from '../../utils/apiCalls';

type AuthorProps = {
    author: any,
    followers: Array<any>,
    friends: Array<any>,
};

function AuthorInfo({ author, followers, friends }: AuthorProps) {

    if (author === undefined) {
        return <h1>Error loading information about this author.</h1>;
    }


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