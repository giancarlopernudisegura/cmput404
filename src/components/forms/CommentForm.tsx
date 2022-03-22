import { h, Component } from 'preact'
import { newPublicComment, getCurrentAuthor } from '../../utils/apiCalls';
import { DialogContent, DialogContentText, DialogTitle, Dialog, FormControlLabel, Switch, Button, TextField, IconButton } from '@mui/material'
import { Close } from '@mui/icons-material';

type Props = { author_id: string, postId: string, postRepliedTo: string, isOpen: boolean, handleClose: any };
type State = { 
    body: string
    authorDisplayName: string
    authorId: string | null
    markdown: boolean
};

class CommentForm extends Component<Props, State>{
    constructor(){
        super()

        this.state = {
            body: '',
            authorDisplayName: '',
            authorId: null,
            markdown: false,
        }

        this.handleBody = this.handleBody.bind(this);
        this.setAuthorDetails = this.setAuthorDetails.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.setMarkdown = this.setMarkdown.bind(this);

        this.setAuthorDetails();
    }

    handleBody(event: Event) { 
        if (event){
            this.setState({ body: (event.target as HTMLTextAreaElement).value });
        }
    }

    setMarkdown() {
        this.setState({ markdown: !this.state.markdown });
        console.log("MARKDOWN:", this.state.markdown);
    }

    setAuthorDetails() {
        // TODO: don't call current author, call the one to get the id
        // get_author_id
        getCurrentAuthor().then(data => {
            this.setState({ 
                authorDisplayName: data.displayName,
                authorId: data.id
            });
        });
    }

    handleSubmit = (event: Event): void => {
        var contentType = "text/plain";
        if (this.state.markdown === true) {
            var contentType = "text/markdown";
        }

        let date = new Date().toISOString()

        const authorData = {
            "displayName": this.state.authorDisplayName,
            "id": this.state.authorId,
            "type": "author",
        }

        // const commentData = {
        //     "comment": this.state.body,
        //     "contentType": contentType, 
        //     "published": date,
        //     "author": authorData,
        //     "type": "comment",
        // }
        const commentData = {
            "title": "Hello",
            "content": this.state.body,
            "contentType": contentType
        };
        newPublicComment(this.state.authorId, this.props.postId, commentData);
        
        alert('You have successfully commented on ' + this.props.postRepliedTo + '!');
        event.preventDefault();
    };

    render(){
        return(
        <Dialog open={this.props.isOpen} style={{margin: `28px`}}>
            <IconButton size='small' onClick={this.props.handleClose} style={{paddingTop: `10px`}}>
                <Close fontSize='small'/>
            </IconButton>

            <DialogTitle>Comment On Post: {this.props.postRepliedTo}</DialogTitle>

            <DialogContent>
                <form onSubmit={this.handleSubmit} className="w-full">
                    <textarea type="text"
                        value={this.state.body}
                        onChange={this.handleBody}
                        style={{width: `500px`, borderColor: `#dadada`, borderWidth: `1px`}}
                    >    
                    </textarea>

                    <div className="flex flex-row justify-between mt-3">
                        <FormControlLabel 
                            control={<Switch />} 
                            label="Markdown" 
                            onChange={this.setMarkdown}
                        />

                        <Button variant="contained"
                            type="submit"
                            className="w-1/3"
                            disableElevation={true}
                        >
                            Send Comment
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
        )
    }
}

export default CommentForm