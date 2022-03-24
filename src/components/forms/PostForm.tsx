import { h, Component } from 'preact';
import { Button, Switch, FormControlLabel } from '@mui/material';
import { newPublicPost, getCurrentAuthor } from '../../utils/apiCalls';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ReactMarkdown from 'react-markdown';
import { MARKDOWN, PLAIN } from '../../utils/constants';
import { useEffect, useState } from 'preact/hooks';

type PostFormProps = { 
    body: string,
    setBody: Function,
    category: string,
    setCategory: Function,
    title: string,
    setTitle: Function,
    isMarkdown: boolean,
    setIsMarkdown: Function,
    buttonName: string,
    submitAction: Function
};

type Image = {
    file: File,
    base64: string,
    imgUrl: string
};

const placeholderContent = {
    tempBody: "What's on your mind?",
    tempTitle: "Enter your title here",
    tempCategory: "Enter the category here"
};

function PostForm({ body, setBody, category, setCategory, title, setTitle, isMarkdown, setIsMarkdown, buttonName, submitAction } : PostFormProps) {
    const [ authorId, setAuthorId] = useState(null);
    const [ authorDisplayName, setAuthorDisplayName] = useState("");
    const [ tabValue, setTabValue ] = useState<number>(0);
    const [ imageMkd, setImageMkd ] = useState<string>("");
    const [ images, setImages ] = useState<Array<Image>>([]);

    useEffect(() => {
        setAuthorDetails();
    }, []);


    const handleBody = (event: Event) => { 
        if (event) {
            setBody((event.target as HTMLTextAreaElement).value);
        }
    }

    const handleTitle = (event: Event) => { 
        if (event){
            setTitle((event.target as HTMLInputElement).value);
        }
    }

    const handleCategory = (event: Event) => { 
        if (event){
            setCategory((event.target as HTMLInputElement).value);
        }
    }

    const setAuthorDetails = () => {
        getCurrentAuthor().then(data => {
            setAuthorId(data.id);
            setAuthorDisplayName(data.displayName);
        });
    }

    const convertImgBase64 = (file : File) => new Promise<string>((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // remove base64 header
            let imgData: string = reader.result as string;
            imgData = imgData.replace(/^data:image\/(?:jpeg|png);base64,/, "");
            return resolve(imgData);
        };

        reader.onerror = (error) => {
            return reject(error);
        }
    });

    const getImageUrl = (postId : string) => {
        const imageUrl = `${process.env.FLASK_HOST}/authors/${authorId}/posts/${postId}/image`;
        return imageUrl;
    }

    const handleSubmit = async (event: any) => {
        var contentType = PLAIN;
        let imgMkd = '';
        if (isMarkdown === true) {
            contentType = MARKDOWN;
            const imagesList = [...images];
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
                    try {
                        if (authorId === null) {
                            throw Error("Author Id is null");
                        }
                        const res = await newPublicPost(authorId, imageData);
                        // get url
                        const imageUrl = getImageUrl(res.id);
                        imgMkd += `![](${imageUrl})\n`;
                    } catch (err) {
                        console.log("ERROR", (err as Error).message);
                    }

                }
            }
        }

        const postData = {
            "title": title,
            "content": body + imgMkd,
            "category": category,
            "contentType": contentType, 
            "visibility": "PUBLIC",
            "unlisted": false,
        }

        if (authorId === null) {
            throw Error("Author Id is null");
        }

        await submitAction(authorId, postData);

        
        alert('You have successfully posted to your public page!');
        event.preventDefault();
    };

    const handleTabChange = (event: any, newValue: number): void => {
        setTabValue(newValue);
    }

    const createImgMkd = (allImg : Array<Image>) => {
        let mkd = "";

        for (let img in Object.keys(allImg)) {
            mkd += `![](${allImg[img].imgUrl})\n`;
        }

        return mkd;
    }

    const handleUploadPhoto = async (event:any) => {
        const files = event.target.files;
        let imagesUrls : Array<String> = [];
        let imagesFiles : Array<File> = [];
        let allImgs : Array<Image> = [];
        let base64: string;

        let values = Object.values(files);
        for (let val of values) {
            if (val instanceof File) {
                let tempUrl : string = URL.createObjectURL(val);
                try {
                    base64 = await convertImgBase64(val);
                } catch (err) {
                    base64 = '';
                }
                allImgs.push({file: val, imgUrl: tempUrl, base64: base64});
                imagesUrls.push(tempUrl);
                imagesFiles.push(val);
            }
        }

        const imgMkd = createImgMkd(allImgs);

        // update state values
        setImages(allImgs);
        setImageMkd(imgMkd);
    }

    return (
        <div class="create-post"
            className="bg-zinc-100 border-solid border-1 border-slate-600 w-2/3 m-auto rounded-lg py-4 px-5  my-5">
                <div class="displayname"
                    className="mb-4 font-semibold">
                    {authorDisplayName}
                </div>

                    <div className='grid grid-cols-1 gap-y-2'>
                        <label className=''>Title</label>
                        <input 
                            type="text"
                            placeholder={placeholderContent.tempTitle}
                            onChange={handleTitle}
                            value={title}
                        ></input>
                    </div>
                    
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label="Text"></Tab>
                        {(isMarkdown === true) && <Tab label="Preview"></Tab>}
                    </Tabs>

                    {(tabValue === 0) && <textarea type="text"
                        placeholder={placeholderContent.tempBody}
                        value={body}
                        onChange={handleBody}
                        className="w-full" 
                    >    
                    </textarea>}

                    {(tabValue === 1) && <ReactMarkdown>{body}</ReactMarkdown>}

                    <div className='grid grid-cols-1 gap-y-2'>
                        <label>Category</label>
                        <input 
                            placeholder={placeholderContent.tempCategory}
                            type="text"
                            onChange={handleCategory}
                            value={category}
                        ></input>
                    </div>

                    {isMarkdown && (
                        <div>
                            {imageMkd && <ReactMarkdown>{imageMkd}</ReactMarkdown>}
                            <input 
                                accept="image/*" 
                                multiple 
                                type="file" 
                                id="upload-file2" 
                                onChange={handleUploadPhoto}
                            />
                        </div>
                    )}
                    

                    <div className="flex flex-row justify-between mt-3">
                        <FormControlLabel
                            checked={isMarkdown}
                            control={<Switch />} 
                            label="Markdown" 
                            onChange={() => setIsMarkdown(!isMarkdown)}
                        />
                    </div>
                    <div>
                        <Button variant="contained"
                            onClick={handleSubmit}
                            className="w-1/3"
                        >{buttonName}
                        </Button>
                    {/* TODO: toggle public or private */}
                    </div>

        </div>
    );

}

export default PostForm;