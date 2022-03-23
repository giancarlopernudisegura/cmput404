import { useState, useEffect } from 'preact/hooks';
import { getCurrentAuthor } from '../../utils/apiCalls';

interface Author {
    displayName: string,
    id: string,
    profileImage: string,
    github: string,
}

export default function useAuthor() {
    const [author, setAuthor] = useState<Author>({
        displayName: '',
        id: '',
        profileImage: '',
        github: '',
    } as Author);

    const [errMsg, setErrMsg] = useState("");

    useEffect(() => {
        try {
            async function fetchAuthor() {
                const author = await getCurrentAuthor();
                setAuthor(author);
            }
            fetchAuthor();
        } catch (err) {
            setErrMsg((err as Error).message);
        }
    }, [])

    return author;
}