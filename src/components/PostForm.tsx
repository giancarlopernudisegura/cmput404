import { h, Component } from 'preact';
import { Button } from '@mui/material';
import { newPublicPost } from '../utils/apiCalls';

import { generateId } from '../utils/utilMethods';

type Props = {  };
type State = { 
    body: string
    tags: Array<string>
    title: string
};

class PostForm extends Component<Props, State> {
    constructor() {
        super();
        this.state = { 
            body: "What's on your mind?",
            tags: [''],
            title: ""
        };
        
        this.handleBody = this.handleBody.bind(this);
        this.handleTitle = this.handleTitle.bind(this);
        // this.handleTags = this.handleTags.bind(this);
        
        this.handleSubmit = this.handleSubmit.bind(this);
    }


    handleBody(event: Event) { 
        if (event){
            this.setState({ body: (event.target as HTMLTextAreaElement).value });
        }
    }

    handleTitle(event: Event) { 
        if (event){
            this.setState({ title: (event.target as HTMLInputElement).value });
        }
    }

    // handleTags(event: Event) { 
    //     if (event){
    //         this.setState({ tags: (event.target as HTMLInputElement).value });
    //     }
    // }

    handleSubmit = (event: Event): void => {
        console.log("The message: " + this.state.title + "\n" + this.state.body);
        
        const authorId = 2; // temp

        var postData = {
            "title": this.state.title,
            "content": this.state.body,
            "category": "temp",
            "contentType": "text/plain", //temp writing plain text
            "visibility": "PUBLIC",
            "unlisted": false,
        }
        var encodedPostData = encodeURIComponent(JSON.stringify(postData));

        newPublicPost(authorId, encodedPostData);

        alert('Shared a post');
        event.preventDefault();
    };



    render() {

        return (
            <div class="create-post"
                className="bg-zinc-100 border-solid border-1 border-slate-600 w-2/3 m-auto rounded-lg py-4 px-5  my-5">
                    {/* TODO: Create a markdown editor  */}
                    {/* TODO: add current user's username and displayImage from /user_me */}

                    <form onSubmit={this.handleSubmit} className="grid grid-cols-1 gap-y-3">
                        <label>Title</label>
                        <input type="text"
                            onChange={this.handleTitle}></input>
                        <textarea type="text"
                            value={this.state.body}
                            onChange={this.handleBody}
                            className="w-full" >    
                        </textarea>
                        <label>Tags</label>
                        <input type="text"></input>

                        <Button variant="contained"
                            type="submit"
                            className="w-1/3">Share</Button>
                    </form>

            </div>

        );
    }

}

export default PostForm;