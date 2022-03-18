import { h, Component } from 'preact';
import { Button, Switch, FormControlLabel } from '@mui/material';
import { newPublicPost, getCurrentAuthor } from '../utils/apiCalls';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ReactMarkdown from 'react-markdown';

type Props = {  };
type Image = {
    file: File,
    base64: string,
    imgUrl: string
};

type State = { 
    body: string
    category: string
    title: string
    authorDisplayName: string
    authorId: number | null
    markdown: boolean,
    showMarkdown: boolean,
    tabValue: number,
    imageMkd: string,
    images: Array<Image>
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
            markdown: false,
            showMarkdown: false,
            tabValue: 0,
            imageMkd: "",
            images: []
        };
        
        this.handleBody = this.handleBody.bind(this);
        this.handleTitle = this.handleTitle.bind(this);
        this.handleCategory = this.handleCategory.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.setAuthorDetails = this.setAuthorDetails.bind(this);
        this.setMarkdown = this.setMarkdown.bind(this);
        this.handleTabChange = this.handleTabChange.bind(this);
        this.handleUploadPhoto = this.handleUploadPhoto.bind(this);
        this.convertImgBase64 = this.convertImgBase64.bind(this);
        this.getImageUrl = this.getImageUrl.bind(this);

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
    }

    convertImgBase64 = (file : File) => new Promise<string>((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            return resolve(reader.result as string);
        };

        reader.onerror = (error) => {
            return reject(error);
        }
    });

    getImageUrl = () => {

    }

    handleSubmit = async (event: any) => {
        var contentType = "text/plain";
        let imgsBase64 : Array<Image>;

        if (this.state.markdown === true) {
            contentType = "text/markdown";
            const imagesList = [...this.state.images];
            // send images if there are images to send
            if (imagesList !== null && imagesList.length != 0) {
                // convert images to base64 and create public Post for them
                for (let img of imagesList) {
                    let imageData = {
                        "title": img.file.name,
                        "unlisted": true,
                        "content": img.base64,
                        "category": "image",
                        "visibility": "PUBLIC",
                        "contentType": `${img.file.type}`
                    };
                    // TODO get post i
                    try {
                        const res = await newPublicPost(this.state.authorId, imageData);
                        console.log("POST INFO", res);
                        // get url

                    } catch (err) {
                        console.log("ERROR", (err as Error).message);
                    }

                }
            }
        }

        const postData = {
            "title": this.state.title,
            "content": this.state.body,
            "category": this.state.category,
            "contentType": contentType, 
            "visibility": "PUBLIC",
            "unlisted": false,
        }
        await newPublicPost(this.state.authorId, postData);

        
        alert('You have successfully posted to your public page!');
        event.preventDefault();
    };

    handleTabChange = (event: any, newValue: number): void => {
        this.setState({ ...this.state, tabValue: newValue });
    }

    createImgMkd = (allImg : Array<Image>) => {
        let mkd = "";

        for (let img in Object.keys(allImg)) {
            mkd += `![](${allImg[img].imgUrl})`;
        }

        return mkd;
    }

    handleUploadPhoto = async (event:any) => {
        const files = event.target.files;
        let imagesUrls : Array<String> = [];
        let imagesFiles : Array<File> = [];
        let allImgs : Array<Image> = [];
        let base64: string;

        let values = Object.values(files);
        for (let val of values) {
            if (val instanceof File) {
                console.log("VAL", val);
                let tempUrl : string = URL.createObjectURL(val);
                try {
                    base64 = await this.convertImgBase64(val);
                } catch (err) {
                    base64 = '';
                }
                allImgs.push({file: val, imgUrl: tempUrl, base64: base64});
                imagesUrls.push(tempUrl);
                imagesFiles.push(val);
            }
        }

        // call to uploadPhotos
        // const imagesURL : Array<String> = uploadPhotosToFbs(valid_files);
        const markdown = this.createImgMkd(allImgs);
        this.setState({ imageMkd: markdown, images: allImgs });
    }

    render() {
        return (
            <div class="create-post"
                className="bg-zinc-100 border-solid border-1 border-slate-600 w-2/3 m-auto rounded-lg py-4 px-5  my-5">
                    {/* TODO: Create a markdown editor  */}
                    <div class="displayname"
                        className="mb-4 font-semibold">
                        {this.state.authorDisplayName}
                    </div>

                        <div className='grid grid-cols-1 gap-y-2'>
                            <label className=''>Title</label>
                            <input 
                                type="text"
                                placeholder={placeholderContent.tempTitle}
                                onChange={this.handleTitle}></input>
                        </div>
                        
                        <Tabs value={this.state.tabValue} onChange={this.handleTabChange}>
                            <Tab label="Text"></Tab>
                            {(this.state.markdown === true) && <Tab label="Preview"></Tab>}
                        </Tabs>

                        {(this.state.tabValue === 0) && <textarea type="text"
                            placeholder={placeholderContent.tempBody}
                            value={this.state.body}
                            onChange={this.handleBody}
                            className="w-full" 
                        >    
                        </textarea>}

                        {(this.state.tabValue === 1) && <ReactMarkdown>{this.state.body}</ReactMarkdown>}

                        <div className='grid grid-cols-1 gap-y-2'>
                            <label>Category</label>
                            <input type="text"></input>
                        </div>

                        {this.state.markdown && (
                            <div>
                                {this.state.imageMkd && <ReactMarkdown>{this.state.imageMkd}</ReactMarkdown>}
                                <input 
                                    accept="image/*" 
                                    multiple 
                                    type="file" 
                                    id="upload-file2" 
                                    // style="display:none"
                                    onChange={this.handleUploadPhoto}
                                />
                            </div>
                        )}
                        

                        <div className="flex flex-row justify-between mt-3">
                            <FormControlLabel 
                                control={<Switch />} 
                                label="Markdown" 
                                onChange={this.setMarkdown}
                            />
                        </div>
                        <div>
                            <Button variant="contained"
                                onClick={this.handleSubmit}
                                className="w-1/3"
                            >Share
                            </Button>
                        {/* TODO: toggle public or private */}
                        </div>

            </div>
        );
    }

}

export default PostForm;