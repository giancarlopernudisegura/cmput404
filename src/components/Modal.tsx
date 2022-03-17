import { h } from 'preact';
import { useState } from 'preact/hooks';
import Modal from '@mui/material/Modal';


type ModalProps = {
    message: string,
    onOpen: boolean
}

export default function SimpleModal({ message, onOpen }: ModalProps) {
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    if (onOpen) { handleOpen(); }

    return (
        <div>
            {/* <Modal open={open} onClose={handleClose}>
                <div> // FIXME: this is not working
                </div>
            </Modal> */}
        </div>
    );
}
