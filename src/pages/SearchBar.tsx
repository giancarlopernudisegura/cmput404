import { h } from 'preact';
import { useEffect, useState } from "preact/hooks";
import { getAllAuthors } from "../utils/apiCalls";
import ShowAuthor from "../components/search/ShowAuthor";
import { route } from 'preact-router';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from "@mui/material/TextField";

const Search = () => {
    const [ currentUserId, setCurrentUserId ] = useState<string | null>(null);
    const [ authors, setAuthors ] = useState(Array());

    useEffect(() => {
        async function getAllAuthorsFromAPI() {
            let res;
            let page : number = 1;
            let allAuthors = Array();
            let listOfAuthors = Array();
            let userId : string | null = null;
            while (true) {
                try {
                    res = await getAllAuthors(page);
                    listOfAuthors = res.items;
                    if (listOfAuthors.length == 0){
                        break;
                    }

                    if (userId === null) {
                        userId = res.currentUserId;
                        setCurrentUserId(userId);
                    }

                    allAuthors.push(...listOfAuthors);
                    page += 1;
                } catch (err) {
                    break;
                }
            }

            const otherAuthors = allAuthors.filter(author => {
                if (author.id != userId) {
                    return author;
                }
            });

            setAuthors(otherAuthors);
        }
        getAllAuthorsFromAPI();
    }, []);

    const handleClick = (authorId : string) => {
        route(`/app/user/${authorId}`);
    }

    return (
        <div>
            <Autocomplete 
                freeSolo
                options={[...authors]}
                renderOption={(props, option, {selected}) => (
                    <ShowAuthor author={option} handleClick={handleClick} />
                )}
                getOptionLabel={(option) => option.github}
                renderInput={params => <TextField {...params} label="Search for an author" />}
            />

        </div>
    );
}

export default Search;