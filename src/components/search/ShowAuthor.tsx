import { h } from 'preact';
import { Button, Card, CardContent, CardMedia } from '@mui/material';
import { route } from 'preact-router';


type AuthorProps = {
    displayName: string,
    github: string,
    id: number,
    profileImage: string
}

const ShowAuthor = ( author : AuthorProps) => {
    const handleClick = () => {
        route(`/app/user/${author.id}`);
    }

    return (
        <Card
            sx={{
                marginBottom: "em"
            }}
        >
            <CardContent>
                <Button onClick={() => { return handleClick()}}>{author.displayName}</Button>
                <p>{author.github}</p>
            </CardContent>
            <img src={author.profileImage} style={{ width: "30%"}} />
        </Card>
    );
}

export default ShowAuthor;


