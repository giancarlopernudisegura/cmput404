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

/*
    Post component
*/

type PostProps = {
    title: string;
    body: string;
    author: string;
}


function Post({ title, body, author }: PostProps) {

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
        <div className='bg-zinc-100 border-solid border-1 border-slate-600 w-2/3 m-auto rounded-lg py-4 px-5  my-5'>
            <div className='grid grid-cols-1 gap-y-2'>
                <div class='displayname' className='font-semibold tracking-wide text-lg'>{author}</div>
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
                    <Button id="view-comments" color="primary" variant='outlined' onClick={() => route('/app/comment')}>View Comments</Button>
                </div>
            </div>

        </div>
    );

}

export default Post;