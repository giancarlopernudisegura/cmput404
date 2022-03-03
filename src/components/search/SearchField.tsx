import { h } from 'preact';
import { Paper, InputBase, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const searchConstants = {
    placeholder: "Search an author"
};

const SearchField = () => {
    return (
        <Paper
        component="form"
        sx={{ p: "2px 4px", display: "flex", alignItems: "center", width: 400 }}
        >
        <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder={searchConstants.placeholder}
        />
        <IconButton type="submit" sx={{ p: "10px" }} aria-label="search">
            <SearchIcon />
        </IconButton>
        </Paper>
    );
}

export default SearchField;