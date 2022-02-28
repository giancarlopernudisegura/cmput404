import { h, Component } from 'preact';
import { Button } from '@mui/material';

class PostForm extends Component {
    state = {value: ''};

    onSubmit = (e: Event): void => {
        alert('Shared a post');
    };


    render() {
        return (
            <div class="create-post"
                className="bg-zinc-100 border-solid border-1 border-slate-600 w-2/3 m-auto rounded-lg py-4 px-5  my-5">
                    {/* TODO: Create a markdown editor  */}

                    <form onSubmit={this.onSubmit} className="grid grid-cols-1 gap-y-5">
                        <label>What's on your mind? </label>
                        <textarea className="w-full"></textarea>

                        {/* TODO: make API call */}
                        <Button variant="contained"
                            type="submit"
                            className="w-1/3">Share</Button>
                    </form>

            </div>

        );
    }

}

export default PostForm;