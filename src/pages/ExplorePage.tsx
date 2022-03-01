import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import Post from '../components/Post';
import { getPosts, getAllAuthors } from '../utils/apiCalls';
import * as linkify from 'linkifyjs';
import { Button } from '@mui/material';
import { uploadPhotosToFbs } from '../utils/firebase';
import ReactMarkdown from 'react-markdown';


type ExplorePageProps = { path: string };
type PostBody = {
    author: string,
    title: string,
    category: string,
    content: string,
    private: boolean,
    unlisted: boolean,
    contentType: string
}

function ExplorePage({ path }: ExplorePageProps) {

    const [ posts, setPosts ] = useState(Array());
    const [ image, setImage ] = useState("");

    // useEffect(() => {
    //     function getPostsFromAPI() {
    //         console.log("Getting posts from API...");
    //         let author_id = 1; //TODO: temp, should display all authors with public posts 
    //         const response = getPosts(author_id);                        
    //         response.then(data => {
    //             setPosts(data);
    //         })
    //         .catch(err => {
    //             alert(err);
    //         });
    //     }
    //     getPostsFromAPI(); 
    
    // }, []);

    const hardcodedBody = {
        "author": "1",
        "title": "hello",
        "category": "d",
        "content": "https://static.pratique.fr/images/lettres/modele-de-cv-pour-un-stage-en-licence-informatique.png",
        "private": false,
        "unlisted": true,
        "contentType": "text/markdown"
    }

    const handleCreatePost = (body : PostBody) => {
        const test = linkify.find(body.content);
        console.log("test", test)
    }

    const createImgMkd = (imagesUrl : Array<String>) => {
        let mkd = "";

        for (let img of imagesUrl) {
            mkd += `![](${img})`;
        }

        return mkd;
    }

    const handleUploadPhoto = (event: any) => {
        const files = event.target.files;
        let imagesUrls : Array<String> = [];

        let values = Object.values(files);
        for (let val of values) {
            if (val instanceof File) {
                let x : string = URL.createObjectURL(val);
                imagesUrls.push(x);
            }
        }

        // call to uploadPhotos
        // const imagesURL : Array<String> = uploadPhotosToFbs(valid_files);
        const markdown = createImgMkd(imagesUrls);
        setImage(markdown);
    }

    return (
            <div>
                {/* {handleCreatePost(hardcodedBody)} */}
                <ul>
                    {posts.map(post => (
                        <li>
                            <Post
                                title={post.title}
                                contentType={post.contentType}
                                body={post.description}
                                author={post.author} />
                        </li>
                    ))}

                    <label htmlFor="upload-file">
                        <input 
                            accept="image/*" 
                            multiple 
                            type="file" 
                            id="upload-file" 
                            style="display:none"
                            onChange={handleUploadPhoto}
                        />
                        <Button variant="contained" component="span">
                            Upload
                        </Button>
                        {image && <ReactMarkdown>{image}</ReactMarkdown>}
                    </label>
                </ul>
            </div>

);
}

export default ExplorePage;