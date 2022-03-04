import { h } from 'preact';
import { useEffect, useState } from "preact/hooks";
import SearchField from "../components/search/SearchField";
import DrawerMenu from "../components/sidemenu-components/Drawer";
import { getAllAuthors } from "../utils/apiCalls";
import ShowAuthor from "../components/search/ShowAuthor";

type Props = {
    path: string;
};

const Search = ({ path }: Props) => {
    const [ infoSearch, setInfoSearch ] = useState('');
    const [ authors, setAuthors ] = useState(Array());

    useEffect(() => {
        async function getAllAuthorsFromAPI() {
            let res;
            let page : number = 1;
            let allAuthors = Array();
            let listOfAuthors = Array();
            while (true) {
                try {
                    res = await getAllAuthors(page);
                    listOfAuthors = res.items;
                    if (listOfAuthors.length == 0){
                        break;
                    }
                    allAuthors.push(...listOfAuthors);
                    page += 1;
                } catch (err) {
                    break;
                }
            }
            setAuthors(allAuthors);
            console.log("ALL authors", allAuthors);
        }
        getAllAuthorsFromAPI();
    }, []);

    const updateSearchButton = (event : any) => {
        setInfoSearch(event.target.value);
    }

    const searchButton = () => {

    }

    return (
        <div>
            <DrawerMenu
            pageName="Notifications"
            >
                <SearchField 
                    searchInfo={infoSearch}
                    updateSearchButton={updateSearchButton}
                    searchButton={searchButton}
                />

                {authors.map(author => ShowAuthor(author))}
            </DrawerMenu>

        </div>
    );
}

export default Search;