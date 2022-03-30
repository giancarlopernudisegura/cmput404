import { h } from 'preact';
import { useEffect, useState } from "preact/hooks";
import Post from '../components/Post';
import { getSpecPost } from '../utils/apiCalls';
import CircularProgress from '@mui/material/CircularProgress';
import DrawerMenu from "../components/sidemenu-components/Drawer";

type PostPageProps = {
    path?: string,
    postId?: string,
    authorId?: string,
};

const PostPage = ({ path, postId, authorId }: PostPageProps) => {
    const [ errorMsg, setErrorMsg ] = useState("");
    const [ isLoading, setIsLoading ] = useState(true);
    // information for Posts
    const [ postTitle, setPostTitle ] = useState("");
    const [ postBody, setPostBody ] = useState("");
    const [ postInfo, setPostInfo ] = useState(Object());

    useEffect(() => {
        // check if it passed infor

        // otherwise, get it from the url
        const getSpecPostFromApi = async () => {
            try {
                const response = await getSpecPost(authorId as string, postId as string);
                console.log("RESPONSE: ", response);
                setPostInfo(response);
                // console.log(post);
            } catch (err) {
                setErrorMsg((err as Error).message);
            }
            setIsLoading(false);
        }

        getSpecPostFromApi();
    }, []);

    return (
        <div>
            <DrawerMenu
                pageName="Post"
            >
                {isLoading ? <CircularProgress /> : (<div>
                    <Post 
                        postId={postInfo.id}
                        title={postInfo.title}
                        body={postInfo.description}
                        authorName={postInfo.author.displayName}
                        authorId={authorId as string}
                        // TODO get currentAuthor
                        currentAuthor={"Lidia"}
                        // TODO add onRemove and handleEdit
                        contentType={postInfo.contentType}
                        visibility={postInfo.visibility}
                        unlisted={postInfo.unlisted}
                    />
                    </div>
                )}
            </DrawerMenu>

        </div>
    );
};

export default PostPage;