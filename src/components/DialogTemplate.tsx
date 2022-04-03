import { h } from 'preact';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Button } from '@mui/material';
import { useState } from 'preact/hooks';
import PostForm from '../components/forms/PostForm';

type DialogProps = {
    open: boolean,
    handleClose: Function,
    updatePost: Function,
    postBody: string,
    setPostBody: Function,
    postCat: string,
    setPostCat: Function,
    postTitle: string,
    setPostTitle: Function,
    isMarkdown: boolean,
    setIsMarkdown: Function,
};

const DialogTemplate = ({ open, handleClose, updatePost, postBody, setPostBody, postCat, setPostCat, postTitle, setPostTitle, isMarkdown, setIsMarkdown }: DialogProps) => {

    return (
            <Dialog 
                open={open} 
                onClose={() => handleClose()}
                fullWidth={true}
            >
                
                <PostForm
                    body={postBody}
                    setBody={setPostBody}
                    category={postCat}
                    setCategory={setPostCat}
                    title={postTitle}
                    setTitle={setPostTitle}
                    isMarkdown={isMarkdown}
                    setIsMarkdown={setIsMarkdown}
                    buttonName={"Update Post"}
                    submitAction={updatePost}
                />

                <Button onClick={() => {
                    handleClose();
                }}>
                    Close
                </Button>
            </Dialog>
    );
};

export default DialogTemplate;