import { h } from 'preact';
import { Box, Card, CardContent, CardMedia } from '@mui/material';

type AuthorProps = {
    displayName: string,
    github: string,
    id: number,
    profileImage: string
}

const ShowAuthor = ( author : AuthorProps) => {
    return (
        <Card
            sx={{
                marginBottom: "em"
            }}
        >
            <CardContent>
                <h1>{author.displayName}</h1>
                <p>{author.github}</p>
            </CardContent>
            <img src={author.profileImage} style={{ width: "30%"}} />
        </Card>
    );
}

export default ShowAuthor;


