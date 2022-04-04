import { useState, useEffect } from 'preact/hooks';
import { get_author_id } from '../../utils/apiCalls';

export default function useAuthorId() {
    const [authorId, setAuthorId] = useState<string>("");

    useEffect(() => {
        const fetchAuthorId = () => {
            get_author_id().then((author_id: any) => {
                setAuthorId(author_id);
            });
        }

        fetchAuthorId();

    }, []);

    return authorId;
}