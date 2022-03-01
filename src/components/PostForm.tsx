import { h, Component } from 'preact';
import { Button } from '@mui/material';

class PostForm extends Component<{}, { value: string }> {
    constructor() {
        super();
        this.state = { value: "What's on your mind?" };
        
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }


    handleChange(event: Event) { 
        if (event){
            this.setState({ value: (event.target as HTMLTextAreaElement).value });
        }
    }

    handleSubmit = (event: Event): void => {
        console.log("The message: " + this.state.value);
        alert('Shared a post');
        event.preventDefault();
    };



    render() {
        return (
            <div class="create-post"
                className="bg-zinc-100 border-solid border-1 border-slate-600 w-2/3 m-auto rounded-lg py-4 px-5  my-5">
                    {/* TODO: Create a markdown editor  */}
                    {/* TODO: add current user's username and displayImage */}

                    <form onSubmit={this.handleSubmit} className="grid grid-cols-1 gap-y-5">
                        <label>Title</label>
                        <input type="text"></input>
                        <textarea type="text"
                            value={this.state.value}
                            onChange={this.handleChange}
                            className="w-full" >    
                        </textarea>

                        <Button variant="contained"
                            type="submit"
                            className="w-1/3">Share</Button>
                    </form>

            </div>

        );
    }

}

export default PostForm;