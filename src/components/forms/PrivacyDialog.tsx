import { h } from 'preact';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

export interface PrivacyDialogProps {
    open: boolean;
    selectedValue: string;
    onClose: (value: string) => void;
    options: string[];
}

export default function PrivacyDialog(props: PrivacyDialogProps) {
    const { onClose, selectedValue, open, options } = props;

    const handleClose = () => {
        onClose(selectedValue);
    };

    const handleListItemClick = (value: string) => {
        onClose(value);
    };

    return(
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle>Select Privacy</DialogTitle>
            <List sx={{ pt: 0 }}>
                {options.map( (option) => (
                    <ListItem button onClick={() => handleListItemClick(option)} key={option}>
                        <ListItemText primary={option} />
                    </ListItem>
                ))}
            </List>
        </Dialog>
    );
}