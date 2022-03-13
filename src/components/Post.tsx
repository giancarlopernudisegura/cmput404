import { h } from 'preact';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReactMarkdown from 'react-markdown'

/*
    Post component
*/

type PostProps = {
    title: string,
    body: string,
    author: string,
    currentAuthor : string,
}

function Post({ title, body, author, currentAuthor }: PostProps) {


    return (
        <div className='bg-zinc-100 border-solid border-1 border-slate-600 w-2/3 m-auto rounded-lg py-4 px-5  my-5'>
            <div className='grid grid-cols-1 gap-y-2'>
                <div className="flex flex-row justify-between">
                    <span className='font-semibold tracking-wide text-lg'>{author}</span>

                    {author === currentAuthor && 
                        <span className="flex space-x-4">
                            <EditIcon />
                            <DeleteIcon />
                        </span>
                    }

                    
                </div>

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