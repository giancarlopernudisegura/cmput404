import { h } from 'preact';
import { Button } from '@mui/material';

function CreatePost() {

    return (
        <div class="create-post"
            className="bg-zinc-100 border-solid border-1 border-slate-600 w-2/3 m-auto rounded-lg py-4 px-5  my-5">
            <Button variant="contained">Share</Button>
        </div>

    );

}

export default CreatePost;