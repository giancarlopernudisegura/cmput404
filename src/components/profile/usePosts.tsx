import { useState, useEffect } from 'preact/hooks';
import { getPosts } from '../../utils/apiCalls';

type PostsGetterProps = {
    authorId: string,

}

export default function usePosts(authorId:string) {
    const [errMsg, setErrMsg] = useState("");
    const [myPosts, setMyPosts] = useState(Array());

    useEffect( () => {
        try {
            async function fetchPosts() {
                const posts = await getPosts(authorId);
                setMyPosts(posts);
            }
            fetchPosts();
        }
        catch(err) {
            setErrMsg((err as Error).message);
        }
        
    }, [])

    return myPosts;
}