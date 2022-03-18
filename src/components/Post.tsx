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
import { getAllComments } from '../utils/apiCalls'

/*
    Post component
*/

type PostProps = {
    postId: number,
    title: string,
    body: string,
    authorName: string,
    authorId: number,
    currentAuthor?: string,
    onRemove?: Function,
}


function Post({ postId, title, body, authorName, currentAuthor, onRemove }: PostProps) {

    var currentUser: string = currentAuthor as string;

    const primary = blueGrey[900];

    const [likeToggle, setLikeToggle] = useState(true)
    const [isLiked, setIsLiked] = useState(0)

    const [comments, setComments] = useState(Array());
    const [errMsg, setErrMsg] = useState("");

    const toggleFunction = () => {
        setLikeToggle(!likeToggle)
        if (likeToggle) {
            setIsLiked(isLiked + 1);
        }
        if (!likeToggle) {
            setIsLiked(isLiked - 1);
        }

    }

    const [showComments, setShowComments] = useState(false)
    const toggleShowComments = () => {
        setShowComments(!showComments)
    }

    // Fetch all the comments of the post from the API
    function fetchComments(authorId: number, postId: number) {
        getAllComments(authorId.toString(), postId)
            .then(data => setComments(data))
            .catch(err => { setErrMsg(err.message); });

    }

    return (
        <li className='bg-zinc-100 border-solid border-1 border-slate-600 w-2/3 m-auto rounded-lg py-4 px-5  my-5'>
            <div className='grid grid-cols-1 gap-y-2'>
                <div className="flex flex-row justify-between">
                    <span className='font-semibold tracking-wide text-lg'>{authorName}</span>

                    {/* Display these buttons if the author of the  post is the current author */}
                    {authorName === currentUser &&
                        <span className="flex space-x-4">
                            <EditIcon />
                            <DeleteIcon onClick={() => {
                                if (onRemove) { onRemove(postId) }
                            }}
                            />
                        </span>
                    }


                </div>

                <div className='px-3 my-2'>
                    <h3 className='font-semibold text-lg mb-2'>{title}</h3>
                    <p className='text-lg'>{body}</p>
                </div>

            </div>

            <div id='buttons' className="grid grid-cols-1 divide-y py-4">
                <div className='flex flex-row gap-x-4 justify-evenly'>
                    <div id='like' className='flex flex-row '>
                        <p>{isLiked}</p>
                        <IconButton
                            color='primary'
                            onClick={() => toggleFunction()}
                        >
                            {likeToggle ? <FavoriteBorderOutlinedIcon fontSize='large' /> : <Favorite fontSize='large' />}
                        </IconButton>
                    </div>

                    <div>
                        <IconButton color='primary'>
                            <ChatBubbleOutlineOutlinedIcon fontSize='large' />
                        </IconButton>
                    </div>

                    <div>
                        <ShareOutlinedIcon fontSize='large' />
                    </div>

                    <div>
                        <Button
                            id="view-comments"
                            color="primary"
                            variant='outlined'
                            onClick={() => toggleShowComments()}
                        >
                            View Comments
                        </Button>
                    </div>
                </div>
            </div>
            <div id='comment-section' className={`bg-blue-200 ${showComments === false ? 'hidden' : 'visible'}`}>
                <p>Hello</p>
            </div>

        </li>
    );

}

export default Post;