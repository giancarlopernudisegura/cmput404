import { h } from 'preact';
import { useEffect, useState } from "preact/hooks";
import Post from '../components/Post';
import { editPost, getSpecPost } from '../utils/apiCalls';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import DrawerMenu from "../components/sidemenu-components/Drawer";
import DialogTemplate from '../components/DialogTemplate';
import { MARKDOWN } from '../utils/constants';


type PostPageProps = {
    path?: string,
    postId?: string,
    authorId?: string,
};

const PostPage = ({ path, postId, authorId }: PostPageProps) => {
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // information for Posts
    const [postInfo, setPostInfo] = useState(Object());
    const [postAuthor, setPostAuthor] = useState("");
    const [openDialog, setOnOpenDialog] = useState<boolean>(false);

    // editPost
    const [IdEditPost, setIdEditPost] = useState<string>("");
    const [editPostBody, setEditPostBody] = useState<string>("");
    const [editPostCat, setEditPostCat] = useState<string>("");
    const [editPostTitle, setEditPostTitle] = useState<string>("");
    const [editIsPostMkd, setEditIsPostMkd] = useState<boolean>(false);

    useEffect(() => {
        // get main information form the url
        const getSpecPostFromApi = async () => {
            try {
                const response = await getSpecPost(authorId as string, postId as string);
                setPostInfo(response);
                setPostAuthor(response.author.displayName);
            } catch (err) {
                setErrorMsg((err as Error).message);
            }
            setIsLoading(false);
        }

        getSpecPostFromApi();
    }, []);

    async function handleEdit(newPostBody: any) {
        // initialize values
        setIdEditPost(newPostBody.postId);
        setEditPostBody(newPostBody.description);
        setEditPostCat("");
        setEditPostTitle(newPostBody.title);
        setEditIsPostMkd(newPostBody.contentType === MARKDOWN);

        setOnOpenDialog(true);
    }

    async function editPostCall(authorId: string, newPostBody: any) {
        let newEditPost;
        try {
            newEditPost = await editPost(authorId, IdEditPost, newPostBody);
        } catch (err) {
            setErrorMsg((err as Error).message);
        }

        let reRenderPost = {
            ...postInfo,
            title: newEditPost.title,
            description: newEditPost.description,
            contentType: newEditPost.contentType,
            visibility: newEditPost.visibility,
            unlisted: newEditPost.unlisted
        };
        setPostInfo(reRenderPost);
    }

    return (
        <div>
            <DrawerMenu
                pageName="Post"
            >
                {isLoading ? <CircularProgress /> : (
                    <div>
                        {errorMsg ? (
                            <Alert severity="error">{errorMsg}</Alert>
                        ) :
                            <div>
                                <Post
                                    postId={postInfo.id}
                                    title={postInfo.title}
                                    body={postInfo.description}
                                    origin={postInfo.origin}
                                    source={postInfo.source}
                                    categories={postInfo.categories}
                                    authorName={postAuthor}
                                    authorId={authorId as string}
                                    currentAuthor={postInfo.author.displayName}
                                    handleEdit={handleEdit}
                                    contentType={postInfo.contentType}
                                    visibility={postInfo.visibility}
                                    unlisted={postInfo.unlisted}
                                />

                                {openDialog &&
                                    <DialogTemplate
                                        open={openDialog}
                                        handleClose={() => setOnOpenDialog(false)}
                                        updatePost={editPostCall}
                                        postBody={editPostBody}
                                        setPostBody={setEditPostBody}
                                        postCat={editPostCat}
                                        setPostCat={setEditPostCat}
                                        postTitle={editPostTitle}
                                        setPostTitle={setEditPostTitle}
                                        isMarkdown={editIsPostMkd}
                                        setIsMarkdown={setEditIsPostMkd}
                                    />
                                }
                            </div>
                        }
                    </div>
                )}
            </DrawerMenu>

        </div>
    );
};

export default PostPage;
