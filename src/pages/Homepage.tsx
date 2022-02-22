import { h } from 'preact'
import { AppBar, Card, CardContent, Menu, MenuItem } from '@mui/material';
import { useEffect } from 'preact/hooks';


type FeedProps = {
    path: string
};


function Homepage(props : FeedProps) {
    useEffect(() => {
        // TODO: get posts
        
    }, []);

    return (
        <div>
            Include Homepage
        </div>
    );
}

export default Homepage;