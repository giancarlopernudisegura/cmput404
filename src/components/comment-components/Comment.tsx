import { Divider } from '@mui/material';
import { h } from 'preact'

type CommentProps = {
    author: string;
    body: string;
    timeStamp: string;
}

function Comment({author, body, timeStamp}: CommentProps) {
  return (
    <div id='comment-component' className='border-solid border-b-1 w-2/3 border-zinc-700 m-auto py-4 px-5'>
        <div className='grid grid-cols-1 gap-y-2'>
            <div class='container-for-timestamp-displayname' className='flex flex-row justify-between'>
                <div class='displayname' className='font-semibold tracking-wide text-lg'>{author}</div>
                <div class='timestamp' className='font-bold tracking-tight text-md'>{timeStamp}</div>
            </div>
                <div className='my-2 pb-4'>
                    <p className='text-lg'>{body}</p>
                </div>
            </div>
            <Divider/>
    </div>
  )
}

export default Comment;