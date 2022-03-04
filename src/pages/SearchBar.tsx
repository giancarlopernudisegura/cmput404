import { h } from 'preact';
import { useEffect, useState } from "preact/hooks";
import { getAllAuthors } from "../utils/apiCalls";
import ShowAuthor from "../components/search/ShowAuthor";
import { Router, route } from 'preact-router';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from "@mui/material/TextField";
import { Button, Card, CardContent, CardMedia } from '@mui/material';




const Search = () => {
    const [ currentUserId, setCurrentUserId ] = useState<number | null>(null);
    const [ authors, setAuthors ] = useState(Array());
    const [ searchResult, setSearchResult ] = useState(Array());

    useEffect(() => {
        async function getAllAuthorsFromAPI() {
            let res;
            let page : number = 1;
            let allAuthors = Array();
            let listOfAuthors = Array();
            let userId : number | null = null;
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

    const handleClick = (authorId : number) => {
        route(`/app/user/${authorId}`);
    }

    return (
        <div>

            {searchResult.map(author => ShowAuthor(author))}

            <Autocomplete 
                freeSolo
                options={[...authors]}
                renderOption={(props, option, {selected}) => (
                    <ShowAuthor author={option} handleClick={handleClick} />
                )}
                getOptionLabel={(option) => option.github}
                renderInput={params => <TextField {...params} label="freeSolo" />}
            />

        </div>
    );
}

export default Search;