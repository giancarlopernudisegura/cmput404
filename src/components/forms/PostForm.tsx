import { h, Component } from 'preact';
import { Button, Switch, FormControlLabel } from '@mui/material';
import { newPublicPost, getSpecAuthor, get_author_id } from '../../utils/apiCalls';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ReactMarkdown from 'react-markdown';
import { MARKDOWN, PLAIN } from '../../utils/constants';
import { useEffect, useState } from 'preact/hooks';
import PrivacyDialog from './PrivacyDialog';
import Divider from '@mui/material/Divider';

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
    file: File;
    base64: string;
    imgUrl: string;
};

const placeholderContent = {
    tempBody: "What's on your mind?",
    tempTitle: "Enter your title",
    tempCategory: "Enter the category of this post"
};

function PostForm({ body, setBody, category, setCategory, title, setTitle, isMarkdown, setIsMarkdown, buttonName, submitAction }: PostFormProps) {
    const [authorId, setAuthorId] = useState(null);
    const [authorDisplayName, setAuthorDisplayName] = useState("");
    const [tabValue, setTabValue] = useState<number>(0);
    const [imageMkd, setImageMkd] = useState<string>("");
    const [images, setImages] = useState<Array<Image>>([]);

    const privacyOptions = ['Public', 'Friends'];
    const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
    const [selectedPrivacy, setSelectedPrivacy] = useState(privacyOptions[0]);

    useEffect(() => {
        setAuthorDetails();
    }, []);

    const handleBody = (event: Event) => {
        if (event) {
            setBody((event.target as HTMLTextAreaElement).value);
        }
    }

    const handleTitle = (event: Event) => {
        if (event) {
            setTitle((event.target as HTMLInputElement).value);
        }
    }

    const handleCategory = (event: Event) => {
        if (event) {
            setCategory((event.target as HTMLInputElement).value);
        }
    }

    const setAuthorDetails = () => {
        get_author_id().then((author_id: any) => {
            setAuthorId(author_id);
            getSpecAuthor(author_id).then(author => {
                setAuthorDisplayName(author.displayName);
            });
        });
    }

    const convertImgBase64 = (file: File) => new Promise<string>((resolve, reject) => {
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

    const getImageUrl = (postId: string) => {
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
                        "unlisted": false,
                        "content": img.base64,
                        "category": "image",
                        "visibility": selectedPrivacy,
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
                        console.error("ERROR", (err as Error).message);
                    }

                }
            }
        }


        const postData = {
            "title": title,
            "content": body + imgMkd,
            "category": category,
            "contentType": contentType, 
            "visibility": selectedPrivacy,
            "unlisted": false,
        };

        if (authorId === null) {
            throw Error("Author Id is null");
        }

        await submitAction(authorId, postData);

        alert('You have successfully posted to your page!');
        event.preventDefault();
    };

    const handleTabChange = (event: any, newValue: number): void => {
        setTabValue(newValue);
    }

    const createImgMkd = (allImg: Array<Image>) => {
        let mkd = "";

        for (let img in Object.keys(allImg)) {
            mkd += `![](${allImg[img].imgUrl})\n`;
        }

        return mkd;
    }

    const handleUploadPhoto = async (event: any) => {
        const files = event.target.files;
        let imagesUrls: Array<String> = [];
        let imagesFiles: Array<File> = [];
        let allImgs: Array<Image> = [];
        let base64: string;

        let values = Object.values(files);
        for (let val of values) {
            if (val instanceof File) {
                let tempUrl: string = URL.createObjectURL(val);
                try {
                    base64 = await convertImgBase64(val);
                } catch (err) {
                    base64 = '';
                }
                allImgs.push({ file: val, imgUrl: tempUrl, base64: base64 });
                imagesUrls.push(tempUrl);
                imagesFiles.push(val);
            }
        }

        const imgMkd = createImgMkd(allImgs);

        // update state values
        setImages(allImgs);
        setImageMkd(imgMkd);
    }

    // Toggle public, friends only, single friend or unlisted

    const handlePrivacyClickOpen = () => {
        setPrivacyDialogOpen(true);
    }

    const handlePrivacyClose = (value: string) => {
        setPrivacyDialogOpen(false);
        setSelectedPrivacy(value)
    }


    return (
        <div class="create-post"
            className="bg-zinc-100 border-solid border-1 border-slate-600 w-2/3 m-auto rounded-lg py-4 px-5 my-5">
                <div class="displayname"
                    className="mb-4 font-semibold">
                    {authorDisplayName}
                </div>

                    <div className='grid grid-cols-1 gap-y-3'>
                        <label>Title</label>
                        <input 
                            type="text"
                            placeholder={placeholderContent.tempTitle}
                            onChange={handleTitle}
                            value={title}
                            className="w-full rounded-lg p-3"
                        >
                        </input>
                    
                        <div className='grid grid-cols-1 gap-y-2'>
                            <div class='tabs' className='mb-4'>
                                <Tabs value={tabValue} onChange={handleTabChange}>
                                    <Tab label="Text"></Tab>
                                    {(isMarkdown === true) && <Tab label="Preview"></Tab>}
                                </Tabs>
                            </div>

                            {(tabValue === 0) && 
                                <textarea type="text"
                                    placeholder={placeholderContent.tempBody}
                                    value={body}
                                    onChange={handleBody}
                                    className="w-full rounded-lg p-3" 
                                >    
                                </textarea>
                            }
                            {(tabValue === 1) && 
                                <div className='bg-white rounded-lg p-3 h-24'>
                                    <ReactMarkdown>
                                        {body}
                                    </ReactMarkdown>
                                </div>
                            }
                        </div>
                        
                        <label>Category</label>
                        <input 
                            placeholder={placeholderContent.tempCategory}
                            type="text"
                            onChange={handleCategory}
                            value={category}
                            className="w-full rounded-lg p-3"
                        ></input>

                    </div>


                    <div className="flex flex-col mt-8">
                        <div className='flex flex-row gap-x-2 mb-5'>
                            <FormControlLabel
                                checked={isMarkdown}
                                control={<Switch />} 
                                label="Markdown" 
                                onChange={() => setIsMarkdown(!isMarkdown)}
                            /> 

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
                        </div>
                        
                        <Divider variant="middle" />

                        <div className='flex flex-row justify-end gap-x-4 mt-5'>
                            <Button variant="outlined" onClick={handlePrivacyClickOpen}>
                                {selectedPrivacy}
                            </Button>
                            <PrivacyDialog
                                selectedValue={selectedPrivacy}
                                open={privacyDialogOpen}
                                onClose={handlePrivacyClose}
                                options={privacyOptions}
                            />

                            <Button variant="contained"
                                onClick={handleSubmit}
                                className="w-1/3"
                            >
                                {buttonName}
                            </Button>
                        </div>

                    </div>

        </div>
    );
}

export default PostForm;
