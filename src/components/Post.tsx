import { h } from 'preact';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ReactMarkdown from 'react-markdown'
import { MARKDOWN, PLAIN } from '../utils/constants'

/*
    Post component
*/

type PostProps = {
    title: string;
    body: string;
    author: string;
    contentType: string;
}

function Post({ title, body, author, contentType }: PostProps) {
    const renderBody = () => {
        switch (contentType) {
            case MARKDOWN:
                return <ReactMarkdown>{body}</ReactMarkdown>
            case PLAIN:
                return <p className='text-lg'>{body}</p>
        }
    }


    return (
        <div className='bg-zinc-100 border-solid border-1 border-slate-600 w-2/3 m-auto rounded-lg py-4 px-5  my-5'>
            <div className='grid grid-cols-1 gap-y-2'>
                <div class='displayname' className='font-semibold tracking-wide text-lg'>{author}</div>
                <div className='px-3 my-2'>
                    <h3 className='font-semibold text-lg mb-2'>{title}</h3>
                    {renderBody()}
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