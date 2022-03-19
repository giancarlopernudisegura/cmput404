import { h } from 'preact';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReactMarkdown from 'react-markdown';
import { MARKDOWN, PLAIN } from '../utils/constants';

/*
    Post component
*/

type PostProps = {
    id: number,
    title: string, 
    body: string, 
    author: string, 
    currentAuthor?: string
    contentType: string;
    onRemove?: Function,
}

function Post({ id, title, body, author, currentAuthor, onRemove, contentType }: PostProps) {
    var currentUser: string = currentAuthor as string;
    const renderBody = () => {
        switch (contentType) {
            case MARKDOWN:
                return <ReactMarkdown>{body}</ReactMarkdown>
            case PLAIN:
                return <p className='text-lg'>{body}</p>
        }
    }

    return (
        <li className='bg-zinc-100 border-solid border-1 border-slate-600 w-2/3 m-auto rounded-lg py-4 px-5  my-5'>
            <div className='grid grid-cols-1 gap-y-2'>
                <div className="flex flex-row justify-between">
                    <span className='font-semibold tracking-wide text-lg'>{author}</span>

                {/* Display these buttons if the author of the  post is the current author */}
                    {author === currentUser && 
                        <span className="flex space-x-4">
                            <EditIcon />
                            <DeleteIcon onClick={ () => { 
                                if (onRemove) { onRemove(id) } 
                                } }
                            />
                        </span>
                    }

                    
                </div>

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

        </li>
    );

}

export default Post;