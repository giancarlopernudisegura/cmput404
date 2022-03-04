import { h } from 'preact';
import { Paper, InputBase, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const searchConstants = {
    placeholder: "Search an author"
};

type SearchProps = {
    searchInfo: string,
    updateSearchButton: (val: any) => void,
    searchButton: (val: void) => void
};


const SearchField = ({ searchInfo, updateSearchButton, searchButton }: SearchProps) => {    
    return (
        <Paper
        component="form"
        sx={{ p: "2px 4px", display: "flex", alignItems: "center", width: 400 }}
        >
        <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder={searchConstants.placeholder}
            onChange={(e) => updateSearchButton(e)}
            value={searchInfo}
        />
        <IconButton type="submit" sx={{ p: "10px" }} aria-label="search" onClick={() => searchButton}>
            <SearchIcon />
        </IconButton>
        </Paper>
    );
}

export default SearchField;