import { h } from 'preact';
import { Button, Card, CardContent, CardMedia } from '@mui/material';


type AuthorProps = {
    displayName: string,
    github: string,
    id: number,
    profileImage: string
}

const ShowAuthor = ({ author, handleClick } : any) => {

    return (
        <div style={{cursor: 'pointer'}} onClick={() => handleClick(author.id)}
        >
            <CardContent className='flex flex-row gap-x-4 items-stretch hover:bg-gray-100'>
                <img src={author.profileImage}
                    className='w-12 rounded-full' />
                <span className='self-center'>{author.displayName}</span>
            </CardContent>
            
        </div>
    );
}

export default ShowAuthor;


