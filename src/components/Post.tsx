import { h } from 'preact';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import { IconButton } from '@mui/material';
import { blueGrey } from '@mui/material/colors'
import { route } from 'preact-router';
import Button from '@mui/material/Button'
import { useState } from 'preact/hooks';
import Favorite from '@mui/icons-material/Favorite'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReactMarkdown from 'react-markdown'

/*
    Post component
*/

type PostProps = {
    id: number,
    title: string, 
    body: string, 
    author: string, 
    currentAuthor?: string,
    onRemove?: Function,
    viewComment?: Function
}


function Post({ id, title, body, author, currentAuthor, onRemove, viewComment }: PostProps) {

    var currentUser: string = currentAuthor as string;

    const primary = blueGrey[900];

    const [likeToggle, setLikeToggle] = useState(true)
    const [isLiked, setIsLiked] = useState(0)
    const toggleFunction = () => {
        setLikeToggle(!likeToggle)
        if (likeToggle){
            setIsLiked(isLiked + 1);
        }
        if (!likeToggle) {
            setIsLiked(isLiked - 1);
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
                    <p className='text-lg'>{body}</p>
                </div>

            </div>

            <div className="grid grid-cols-1 divide-y py-4">
                <div className='flex flex-row gap-x-4 justify-evenly'>
                    <div id='like' className='flex flex-row '>
                    <p>{isLiked}</p>
                    <IconButton color='primary' onClick={() => toggleFunction()}>
                    {likeToggle ? <FavoriteBorderOutlinedIcon fontSize='large'/> : <Favorite fontSize='large' />}
                    </IconButton>
                    </div>
                    
                    
                    <IconButton color='primary'>
                    <ChatBubbleOutlineOutlinedIcon fontSize='large'/>
                    </IconButton>
                    <ShareOutlinedIcon fontSize='large'/>
                    <Button id="view-comments" color="primary" variant='outlined' 
                    onClick={() => {if (viewComment) {viewComment(id), route('/app/comment')}
                    
                    }}>View Comments</Button>
                </div>
            </div>

        </li>
    );

}

export default Post;