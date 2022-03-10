import { h } from 'preact';

type AuthorProps = {
    profileImage: string,
    displayName: string,
    github?: string,
};

function AuthorInfo({ profileImage, displayName, github }: AuthorProps) {

    return(
        <div className="flex justify-evenly w-full py-5">
            <img src={profileImage}
                className="rounded-full w-1/5">
            </img>
            <div className="flex flex-col justify-center items-center text-left">

                <h1 className="text-xl font-semibold">
                    {displayName ? `${displayName}` : "No Name Found"}
                </h1>

                {github ? 
                    <a href={`${github}`}
                        className="text-lg font-thin text-gray-600">
                        {github}
                    </a> 
                : null}

                {/* TODO: add followers/following */}
            </div>

        </div>
    );
}

export default AuthorInfo;