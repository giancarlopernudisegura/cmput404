import { h, Component } from 'preact';
import { Button } from '@mui/material';
import { newPublicPost, getCurrentAuthor } from '../utils/apiCalls';

type Props = {  };
type State = { 
    body: string
    category: string
    title: string
    authorDisplayName: string
    authorId: number | null
};

class PostForm extends Component<Props, State> {
    constructor() {
        super();
        this.state = { 
            body: "",
            category: "",
            title: "",
            authorDisplayName: "",
            authorId: null 
        };
        
        this.handleBody = this.handleBody.bind(this);
        this.handleTitle = this.handleTitle.bind(this);
        this.handleCategory = this.handleCategory.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.setAuthorDetails = this.setAuthorDetails.bind(this);

        this.setAuthorDetails();
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

    handleCategory(event: Event) { 
        if (event){
            this.setState({ category: (event.target as HTMLInputElement).value });
        }
    }

    setAuthorDetails() {
        getCurrentAuthor().then(data => {
            this.setState({ 
                authorDisplayName: data.displayName,
                authorId: data.id
            });
        });
    }

    handleSubmit = (event: Event): void => {
        const postData = {
            "title": this.state.title,
            "content": this.state.body,
            "category": this.state.category,
            "contentType": "text/plain", //TODO: check for markdown 
            "visibility": "PUBLIC",
            "unlisted": false,
        }
        const encodedPostData = JSON.stringify(postData);
        newPublicPost(this.state.authorId, encodedPostData);
        
        alert('You have successfully posted to your public page!');
        event.preventDefault();
    };

    render() {

        return (
            <div class="create-post"
                className="bg-zinc-100 border-solid border-1 border-slate-600 w-2/3 m-auto rounded-lg py-4 px-5  my-5">
                    {/* TODO: Create a markdown editor  */}
                    <div class="displayname"
                        className="mb-4 font-semibold">
                        {this.state.authorDisplayName}
                    </div>

                    <form onSubmit={this.handleSubmit} className="grid grid-cols-1 gap-y-3">
                        <div className='grid grid-cols-1 gap-y-2'>
                            <label className=''>Title</label>
                            <input type="text"
                                onChange={this.handleTitle}></input>
                        </div>

                        <textarea type="text"
                            value={this.state.body}
                            onChange={this.handleBody}
                            className="w-full" 
                        >    
                        </textarea>

                        <div className='grid grid-cols-1 gap-y-2'>
                            <label>Category</label>
                            <input type="text"></input>
                        </div>

                        <Button variant="contained"
                            type="submit"
                            className="w-1/3">Share</Button>
                    </form>

            </div>
           
        );
    }

}

export default PostForm;