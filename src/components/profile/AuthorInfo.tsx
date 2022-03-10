import { h } from 'preact';

type AuthorProps = {
    profileImage: string,
    displayName: string,
    github?: string,
};

function AuthorInfo({ profileImage, displayName, github}: AuthorProps) {

    return(
        <div className="text-xl grid grid-cols-1">
            <img src={profileImage}
                className="rounded-full w-1/5">
            </img>
            
            <h1>
                {displayName ? `${displayName}` : "No Name Found"}
            </h1>

            {github ? <a href={`${github}`}>{github}</a> : null} 
            {/* TODO: add followers/following */}
        </div>
    );
}

export default AuthorInfo;