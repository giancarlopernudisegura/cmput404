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
    TableContainer,
    FormControlLabel,
    FormGroup,
    Link,
    Typography,
    Toolbar,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
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
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    const addOrRemoveUserToSelected = (userId: string) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    }

    const loadUsers = async (page: number): Promise<User[]> => {
        const res = await fetch(`/authors?size=5&page=${page}`)
        if (res.status !== 200) {
            setIsLoading(false);
            return [];
        }
        const data = await res.json();
        const u: User[] = data.items;
        return u.concat(await loadUsers(page + 1));
    }

    useEffect(() => {
        loadUsers(1)
            .then(users => { setUsers(users) });
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
                pageName="Administrator Settings"
            >
                {errMsg && (
                    <Alert severity="error">{errMsg}</Alert>
                )}
                {isLoading === true ? <CircularProgress /> : <Box>
                    <Box>
                        <h1>Server Settings</h1>
                        <FormGroup>
                            <FormControlLabel label="Verify new users by default" control={<Checkbox />} />
                        </FormGroup>
                    </Box>
                    <br />
                    <Box>
                        <Toolbar>
                            <Typography
                                sx={{ flex: '1 1 100%' }}
                                variant="h6"
                                id="tableTitle"
                                component="div"
                            >
                                Users
                            </Typography>
                            <IconButton onClick={() => {
                                selectedUsers.forEach(id => {
                                    fetch(`/admin/author/${id}`, {
                                        method: "DELETE"
                                    })
                                        .then(() => {
                                            setUsers(users.filter(u => u.id !== id));
                                        })
                                        .catch(err => {
                                            setErrMsg(err.message);
                                        });
                                })
                            }}>
                                <DeleteIcon />
                            </IconButton>
                        </Toolbar>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell></TableCell>
                                        {tableColumns.map(column => {
                                            return <TableCell>{column}</TableCell>
                                        })}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map(({ id, displayName, github, host, url, isAdmin, isVerified }, index) => {
                                        const label = { inputProps: { 'aria-label': 'Checkbox' } };
                                        return <TableRow>
                                            <TableCell><Checkbox {...label} checked={selectedUsers.includes(id)} onClick={e => {
                                                addOrRemoveUserToSelected(id);
                                            }} /></TableCell>
                                            <TableCell>{id}</TableCell>
                                            <TableCell>{displayName}</TableCell>
                                            <TableCell><Link href={github} target="_blank" rel="noreferrer">{github}</Link></TableCell>
                                            <TableCell><Link href={host} target="_blank" rel="noreferrer">{host}</Link></TableCell>
                                            <TableCell><Link href={url} target="_blank" rel="noreferrer">{url}</Link></TableCell>
                                            <TableCell><Checkbox {...label} checked={isAdmin} onClick={e => {
                                                fetch(`/admin/author/${id}`, {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type": "application/json"
                                                    },
                                                    body: JSON.stringify({
                                                        isAdmin: !isAdmin
                                                    })
                                                })
                                                    .then(res => {
                                                        if (res.status === 200) {
                                                            setUsers([]);
                                                            loadUsers(1)
                                                                .then(users => { setUsers(users) });
                                                        }
                                                    })
                                            }} /></TableCell>
                                            <TableCell><Checkbox {...label} checked={isVerified} onClick={e => {
                                                fetch(`/admin/author/${id}`, {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type": "application/json"
                                                    },
                                                    body: JSON.stringify({
                                                        isVerified: !isVerified
                                                    })
                                                })
                                                    .then(res => {
                                                        if (res.status === 200) {
                                                            setUsers([]);
                                                            loadUsers(1)
                                                                .then(users => { setUsers(users) });
                                                        }
                                                    })
                                            }} /></TableCell>
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
                </Box>}
            </DrawerMenu>
        </div>
    );
}

export default Settings;
