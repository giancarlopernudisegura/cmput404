import { h } from 'preact';

/*
    Post component

*/

type PostProps = {
    title: string;
    body: string;
    author: string;
}

function Post({ title, body, author }: PostProps) {

    return (
        <div className='bg-gray-500'>
            <h1>{title}</h1>
            <p>{body}</p>
            <p>Author: {author}</p>
        </div>
    );

}

export default Post;