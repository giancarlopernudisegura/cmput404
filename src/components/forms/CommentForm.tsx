import { h, Component } from "preact";
import { newPublicComment, get_author_id } from "../../utils/apiCalls";
import {
  DialogContent,
  DialogTitle,
  Dialog,
  FormControlLabel,
  Switch,
  Button,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { MARKDOWN, PLAIN } from "../../utils/constants";

type Props = {
  author_id: string;
  postId: string;
  postRepliedTo: string;
  isOpen: boolean;
  handleClose: any;
};
type State = {
  body: string;
  authorDisplayName: string;
  authorId: string | null;
  markdown: boolean;
};

class CommentForm extends Component<Props, State> {
  constructor() {
    super();

    this.state = {
      body: "",
      authorDisplayName: "",
      authorId: null,
      markdown: false,
    };

    this.handleBody = this.handleBody.bind(this);
    this.setAuthorDetails = this.setAuthorDetails.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.setMarkdown = this.setMarkdown.bind(this);

    this.setAuthorDetails();
  }

  handleBody(event: Event) {
    if (event) {
      this.setState({ body: (event.target as HTMLTextAreaElement).value });
    }
  }

  setMarkdown() {
    this.setState({ markdown: !this.state.markdown });
    console.log("MARKDOWN:", this.state.markdown);
  }

  setAuthorDetails() {
    get_author_id().then((data) => {
      this.setState({
        authorId: data.toString(),
      });
      console.log(data);
    });
  }

  handleSubmit = (event: Event): void => {
    var contentType = PLAIN;
    if (this.state.markdown === true) {
      var contentType = MARKDOWN;
    }

    let date = new Date().toISOString();

    const commentData = {
      content: this.state.body,
      contentType: contentType,
      published: date,
    };
    newPublicComment(this.state.authorId, this.props.postId, commentData);

    alert(
      "You have successfully commented on " + this.props.postRepliedTo + "!"
    );
    event.preventDefault();
    this.setState({ body: "" });
  };

  render() {
    return (
      <Dialog open={this.props.isOpen} style={{ margin: `28px` }}>
        <IconButton
          size="small"
          onClick={this.props.handleClose}
          style={{ paddingTop: `10px` }}
        >
          <Close fontSize="small" />
        </IconButton>
        <DialogTitle>Comment On Post: {this.props.postRepliedTo}</DialogTitle>
        <DialogContent>
          <form onSubmit={this.handleSubmit} className="w-full">
            <h2>Content</h2>
            <textarea
              type="text"
              value={this.state.body}
              onChange={this.handleBody}
              style={{
                width: `500px`,
                borderColor: `#dadada`,
                borderWidth: `1px`,
              }}
            ></textarea>

            <div className="flex flex-row justify-between mt-3">
              <FormControlLabel
                control={<Switch />}
                label="Markdown"
                onChange={this.setMarkdown}
              />

              <Button
                variant="contained"
                type="submit"
                onClick={this.props.handleClose}
                className="w-1/3"
                disableElevation={true}
              >
                Send Comment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
}

export default CommentForm;
