import { h } from 'preact';
import { Button, Card, CardContent, CardMedia } from '@mui/material';
import { route } from 'preact-router';


type AuthorProps = {
    displayName: string,
    github: string,
    id: number,
    profileImage: string
}

const ShowAuthor = ({ author, handleClick } : any) => {

    return (
        <div  style={{cursor: 'pointer'}} onClick={() => handleClick(author.id)}
        >
            <CardContent>
                <p>{author.github}</p>
            </CardContent>
            <img src={author.profileImage} style={{ width: "30%"}} />
        </div>
    );
}

export default ShowAuthor;


