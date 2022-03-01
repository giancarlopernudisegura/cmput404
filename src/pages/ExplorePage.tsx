import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import Post from '../components/Post';
import { getPosts, getAllAuthors } from '../utils/apiCalls';
import * as linkify from 'linkifyjs';
import { Button } from '@mui/material';
import { uploadPhotosToFbs } from '../utils/firebase';


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

    const body = {
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

    const handleUploadPhoto = (event: any) => {
        const files = event.target.files;
        const valid_files = [];

        console.log("DD", event);
        console.log("target", event.target);
        console.log("target", event.target.file);
        console.log("FILES", files);

        let values = Object.values(files);
        for (let val of values) {
            if (val instanceof File) {
                valid_files.push(val);
            }
        }

        console.log("V", valid_files);
        const imagesURL : Array<String> = uploadPhotosToFbs(valid_files);
        console.log("IMAGES", imagesURL);
        // const content = `!()[${imageURL}]`
    }

    return (
            <div>
<<<<<<< HEAD:src/views/ExplorePage.tsx
                <ul>
                    {handleCreatePost(body)}
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
                    </label>
                </ul>
=======
                {posts.length > 0 &&
                    <ul>
                        {posts.map(post => (
                            <li>
                                <Post
                                    title={post.title}
                                    body={post.description}
                                    author={post.author} />
                            </li>
                        ))}

                    </ul>
                }

                {posts === undefined &&
                    <div>
                        <h1>No posts yet!</h1>
                    </div>
                }
>>>>>>> master:src/pages/ExplorePage.tsx
            </div>

);
}

export default ExplorePage;