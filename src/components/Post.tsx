import { h } from 'preact';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import { IconButton } from '@mui/material';
import Button from '@mui/material/Button'
import { useState, useEffect } from 'preact/hooks';
import Favorite from '@mui/icons-material/Favorite'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReactMarkdown from 'react-markdown'
import { getAllComments, getPostLikes } from '../utils/apiCalls'
import CommentList from '../components/comment-components/CommentList'
import CommentForm from '../components/forms/CommentForm'
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


function Post({ 
    postId, 
    title, 
    body, 
    authorName, 
    authorId,
    currentAuthor, 
    onRemove 
    }: PostProps) {

    var currentUser: string = currentAuthor as string;

    //Toggle for like button
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

    //TOGGLE FOR SHOWING COMMENTS
    const [showComments, setShowComments] = useState(false)
    const toggleShowComments = () => {
        setShowComments(!showComments)
    }

    //Conditionals for the View Comments Button
    const commentButtonText = showComments === false ? 'View Comments' : 'Hide Comments'
    const commentButtonType = showComments === false ? 'outlined' : 'contained'

    //TOGGLE FOR OPENING MAKE COMMENT DIALOG
    const [open, setOpen] = useState(false)

    const openDialog = () => {
        setOpen(true)
    }

    const closeDialog = () => {
        setOpen(false)
    }

    useEffect(() => {
        // Fetch all the comments of the post from the API
        function fetchComments(authorId: number, postId: number) {
            getAllComments(authorId.toString(), postId)
                .then(data => setComments(data))
                .catch(err => { setErrMsg(err.message); });
        }

        

        fetchComments(authorId, postId);
        
    } , [])
;

    return (
        <li className='bg-zinc-100 border-solid border-1 border-slate-600 w-2/3 m-auto rounded-lg py-4 px-5  my-5'>
            <div className='grid grid-cols-1 gap-y-2'>
                <div className="flex flex-row justify-between">
                    <span className='font-semibold tracking-wide text-lg'>{authorName}</span>

                    {/* Display these buttons if the author of the  post is the current author */}
                    {authorName === currentUser &&
                        <span className="flex space-x-4">
                            <IconButton>
                            <EditIcon style={{fill: "black"}} />
                            </IconButton>
                           
                            <IconButton>
                            <DeleteIcon style={{fill: "black"}} onClick={() => {
                                if (onRemove) { onRemove(postId) }
                            }}
                            />
                            </IconButton>
                            
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
                        <Button variant='outlined' startIcon={<ChatBubbleOutlineOutlinedIcon fontSize='large' />} onClick={openDialog}>
                            Comment
                        </Button>
                        <CommentForm 
                        isOpen={open} 
                        postRepliedTo={title} 
                        postId={postId}
                        author_id={authorId}
                        handleClose={closeDialog} 

                        />
                    </div>

                    <div>
                        <ShareOutlinedIcon fontSize='large' />
                    </div>

                    <div>
                        <Button
                            id="view-comments"
                            color="primary"
                            variant={commentButtonType}
                            onClick={() => toggleShowComments() }
                        >
                            {commentButtonText}
                        </Button>
                    </div>
                </div>
            </div>
            <div id='comment-section' className={`${showComments === false ? 'hidden' : 'visible'}`}>
                <div id='comment-section-subheader' className='items-center content-center pt-4 py-8 font-semibold'>Total Comments for this post: {comments.length}</div>
                <CommentList allComments={comments}/>
            </div>

        </li>
    );

}

export default Post;