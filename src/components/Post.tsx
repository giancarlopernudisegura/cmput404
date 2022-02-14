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
        <div className='bg-zinc-100 border-solid border-1 border-slate-500 w-2/3 m-auto rounded-lg'>
            <h1>{title}</h1>
            <p>{body}</p>
            <p>Author: {author}</p>
        </div>
    );

}

export default Post;