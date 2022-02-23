import { h } from 'preact';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';


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
        <div className='bg-zinc-100 border-solid border-1 border-slate-600 w-2/3 m-auto rounded-lg p-4'>
            <h1>{title}</h1>
            <p>{body}</p>
            <p>Author: {author}</p>
            <div className="grid grid-cols-1 divide-y py-4">
                <div className='flex flex-row gap-x-4'>
                    <FavoriteBorderOutlinedIcon />
                    <ChatBubbleOutlineOutlinedIcon />
                    <ShareOutlinedIcon />
                </div>
            </div>

        </div>
    );

}

export default Post;