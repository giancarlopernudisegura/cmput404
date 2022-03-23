import { h } from 'preact';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Button } from '@mui/material';
import { useState } from 'preact/hooks';

type DialogProps = {
    open: boolean,
    handleClose: Function,
    data?: any,
    updatePost: Function
};

const DialogTemplate = ({ open, handleClose, data, updatePost }: DialogProps) => {
    const [ newPostInfo, setPostInfo ] = useState(data); 

    const handlePostInfo = (event: Event) => {
        setPostInfo((event.target as HTMLTextAreaElement).value);
    }

    console.log("TEST", data);
    return (
        <Dialog open={open} onClose={() => handleClose()}>
            {/* <DialogTitle>{data.title}</DialogTitle> */}

            <textarea
                type="text"
                value={newPostInfo.description}
                onChange={handlePostInfo}
            >
            </textarea>

            <Button onClick={() => {
                updatePost(newPostInfo);
                handleClose();
            }}>
                Save
            </Button>
        </Dialog>
    );
};

export default DialogTemplate;