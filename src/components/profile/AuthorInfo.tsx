import { h } from 'preact';

type AuthorProps = {
    author: any,
};

function AuthorInfo({ author }: AuthorProps) {
    
    if (author === undefined) {
        return <h1>Error loading information about this author.</h1>;
    }

    return(
        <div className="flex justify-evenly w-full py-5">
            <img src={author.profileImage}
                className="rounded-full w-1/5">
            </img>
            <div className="flex flex-col justify-center items-center text-left">

                <h1 className="text-xl font-semibold">
                    {author.displayName ? `${author.displayName}` : "No Name Found"}
                </h1>

                {author.github ? 
                    <a href={`${author.github}`}
                        className="text-lg font-thin text-gray-600">
                        {author.github}
                    </a> 
                : null}

                {/* TODO: add followers/following */}
            </div>

        </div>
    );
}

export default AuthorInfo;