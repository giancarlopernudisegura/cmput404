import { h } from 'preact';
import DrawerMenu from "../components/sidemenu-components/Drawer";
import {
    CircularProgress,
    Alert,
    TableHead,
    TableRow,
    Table,
    TableCell,
    TableBody,
    Checkbox,
    TablePagination,
    Box,
    TableContainer
} from '@mui/material';
import { useEffect, useState } from "preact/hooks";

type SettingsProps = {
    path: string
};

type User = {
    type: string,
    id: string,
    displayName: string,
    github: string,
    profileImage: string,
    url: string,
    host: string,
    isAdmin: boolean,
    isVerified: boolean,
}

const Settings = ({ path }: SettingsProps) => {
    const [errMsg, setErrMsg] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);


    useEffect(() => {
        const loadUsers = async () => {
            fetch(`/authors`)
                .then(res => res.json())
                .then(data => {
                    setUsers(users.concat(data.items));
                })
            setIsLoading(false);
        }
        loadUsers();
    }, []);

    const tableColumns = [
        "ID",
        "Name",
        "GitHub",
        "Host",
        "URL",
        "Admin",
        "Verified"
    ]

    return (
        <div>
            <DrawerMenu
                pageName="Admin Settings"
            >
                {errMsg && (
                    <Alert severity="error">{errMsg}</Alert>
                )}
                {isLoading === true ? <CircularProgress /> : (
                    <Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {tableColumns.map(column => {
                                            return <TableCell>{column}</TableCell>
                                        })}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map(({ id, displayName, github, host, url, isAdmin, isVerified }) => {
                                        const label = { inputProps: { 'aria-label': 'Checkbox demo' } };
                                        return <TableRow>
                                            <TableCell>{id}</TableCell>
                                            <TableCell>{displayName}</TableCell>
                                            <TableCell>{github}</TableCell>
                                            <TableCell>{host}</TableCell>
                                            <TableCell>{url}</TableCell>
                                            <TableCell><Checkbox {...label} disabled checked={isAdmin} /></TableCell>
                                            <TableCell><Checkbox {...label} disabled checked={isVerified} /></TableCell>
                                        </TableRow>
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            component="div"
                            count={users.length}
                            rowsPerPage={10}
                            page={0}
                            onPageChange={() => { }}
                        />
                    </Box>
                )}
            </DrawerMenu>
        </div>
    );
}

export default Settings;
