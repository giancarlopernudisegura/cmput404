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
        <div className='bg-zinc-100 border-solid border-1 border-slate-600 w-2/3 m-auto rounded-lg py-4 px-5  my-5'>
            <div className='grid grid-cols-1 gap-y-2'>
                <h2 className='font-bold tracking-wide'>{author}</h2>
                <div className='px-3 my-2'>
                    <h3 className='font-semibold text-lg mb-2'>{title}</h3>
                    <p className='text-lg'>{body}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 divide-y py-4">
                <div className='flex flex-row gap-x-4'>
                    <FavoriteBorderOutlinedIcon fontSize='large'/>
                    <ChatBubbleOutlineOutlinedIcon fontSize='large'/>
                    <ShareOutlinedIcon fontSize='large'/>
                </div>
            </div>

        </div>
    );

}

export default Post;