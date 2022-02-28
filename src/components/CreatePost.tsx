import { h } from 'preact';
import { Button } from '@mui/material';

function CreatePost() {

    return (
        <div class="create-post"
            className="bg-zinc-100 border-solid border-1 border-slate-600 w-2/3 m-auto rounded-lg py-4 px-5  my-5">
                {/* TODO: Create a markdown editor  */}
                
                <form className="grid grid-cols-1 gap-y-5">
                    <label>What's on your mind? </label>
                    <textarea class="w-full"></textarea>

                    <Button variant="contained"
                        className="w-1/3">Share</Button>
                </form>

        </div>

    );

}

export default CreatePost;