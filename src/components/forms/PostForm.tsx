import { h, Component } from 'preact';
import { Button, Switch, FormControlLabel } from '@mui/material';
import { newPublicPost, getCurrentAuthor } from '../../utils/apiCalls';

type Props = {  };
type State = { 
    body: string
    category: string
    title: string
    authorDisplayName: string
    authorId: number | null
    markdown: boolean
};

const placeholderContent = {
    tempBody: "What's on your mind?",
    tempTitle: "Enter your title here",
};

class PostForm extends Component<Props, State> {
    constructor() {
        super();
        this.state = { 
            body: "",
            category: "",
            title: "",
            authorDisplayName: "",
            authorId: null,
            markdown: false
        };
        
        this.handleBody = this.handleBody.bind(this);
        this.handleTitle = this.handleTitle.bind(this);
        this.handleCategory = this.handleCategory.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.setAuthorDetails = this.setAuthorDetails.bind(this);
        this.setMarkdown = this.setMarkdown.bind(this);

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

    setMarkdown() {
        this.setState({ markdown: !this.state.markdown });
        console.log("MARKDOWN:", this.state.markdown);
    }

    handleSubmit = (event: Event): void => {
        var contentType = "text/plain";
        if (this.state.markdown === true) {
            var contentType = "text/markdown";
        }

        const postData = {
            "title": this.state.title,
            "content": this.state.body,
            "category": this.state.category,
            "contentType": contentType, 
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
                            <input 
                                type="text"
                                placeholder={placeholderContent.tempTitle}
                                onChange={this.handleTitle}></input>
                        </div>

                        <textarea type="text"
                            placeholder={placeholderContent.tempBody}
                            value={this.state.body}
                            onChange={this.handleBody}
                            className="w-full" 
                        >    
                        </textarea>

                        <div className='grid grid-cols-1 gap-y-2'>
                            <label>Category</label>
                            <input type="text"></input>
                        </div>

                        <div className="flex flex-row justify-between mt-3">
                            <FormControlLabel 
                                control={<Switch />} 
                                label="Markdown" 
                                onChange={this.setMarkdown}
                            />

                            <Button variant="contained"
                                type="submit"
                                className="w-1/3"
                            >Share
                            </Button>
                        {/* TODO: toggle public or private */}
                        </div>
                    </form>

            </div>
           
        );
    }

}

export default PostForm;