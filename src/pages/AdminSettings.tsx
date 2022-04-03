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
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    TextField,
    DialogActions,
    DialogContentText,
    DialogContent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from "preact/hooks";

const AUTH_USERNAME = process.env.LOCAL_AUTH_USER;
const AUTH_PASSWD = process.env.LOCAL_AUTH_PASSWORD;

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

type RemoteNode = {
    type: string,
    id: string,
    username: string,
    password: string,
}

// from: https://developer.mozilla.org/en-US/docs/Glossary/Base64
const token = window.btoa(unescape(encodeURIComponent(`${AUTH_USERNAME
    }:${AUTH_PASSWD}`)))

const Settings = ({ path }: SettingsProps) => {
    const [errMsg, setErrMsg] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [remoteNodes, setRemoteNodes] = useState<RemoteNode[]>([]);
    const [verifyNewUsers, setVerifyNewUsers] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [selectedRemoteNodes, setSelectedRemoteNodes] = useState<string[]>([]);
    const [open1, setOpen1] = useState(false);
    const [open2, setOpen2] = useState(false);

    // New field states
    const [newUserName, setNewUserName] = useState("");
    const [newUserGithub, setNewUserGithub] = useState("");
    const [newRemoteNodeURL, setNewRemoteNodeURL] = useState("");
    const [newRemoteNodeUsername, setNewRemoteNodeUsername] = useState("");
    const [newRemoteNodePassword, setNewRemoteNodePassword] = useState("");

    const openDialogue1 = () => {
        setOpen1(true);
    };

    const closeDialogue1 = () => {
        setOpen1(false);
    };

    const openDialogue2 = () => {
        setOpen2(true);
    };

    const closeDialogue2 = () => {
        setOpen2(false);
    };

    const addOrRemoveUserToSelected = (userId: string) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    }

    const addOrRemoveRemoteNodeToSelected = (userId: string) => {
        if (selectedRemoteNodes.includes(userId)) {
            setSelectedRemoteNodes(selectedRemoteNodes.filter(id => id !== userId));
        } else {
            setSelectedRemoteNodes([...selectedRemoteNodes, userId]);
        }
    }

    const loadUsers = async (page: number): Promise<User[]> => {
        const res = await fetch(`/authors?size=10&page=${page}`)
        if (res.status !== 200) {
            setIsLoading(false);
            return [];
        }
        const data = await res.json();
        const u: User[] = data.items;
        if (u.length == 0) {
            setIsLoading(false);
            return [];
        }
        return u.concat(await loadUsers(page + 1));
    }

    const loadRemoteNodes = async (): Promise<void> => {
        const res = await fetch("/remotes", {
            headers: {
                'Authorization': `Basic ${token}`
            }
        })
        if (res.status !== 200) {
            setIsLoading(false);
            return;
        }
        const data = await res.json();
        setRemoteNodes(data.items);
    }

    useEffect(() => {
        loadUsers(1)
            .then(users => { setUsers(users) });
        fetch("/admin/settings")
            .then(res => res.json())
            .then(data => {
                setVerifyNewUsers(data.AUTOMATIC_VERIFICATION);
            })
        loadRemoteNodes();
    }, []);

    const authorTableColumns = [
        "ID",
        "Name",
        "GitHub",
        "Host",
        "URL",
        "Admin",
        "Verified"
    ]

    const remoteTableColumns = [
        "URL",
        "HTTP Basic Auth Username",
        "HTTP Basic Auth Password"
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
                            <FormControlLabel label="Verify new users by default" control={<Checkbox checked={verifyNewUsers} onClick={e => {
                                fetch('/admin/settings', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        AUTOMATIC_VERIFICATION: !verifyNewUsers
                                    }),
                                })
                                setVerifyNewUsers(!verifyNewUsers);
                            }} />} />
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
                                        {authorTableColumns.map(column => {
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
                    <Box>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={openDialogue1}>Create User</Button>
                        <Dialog open={open1} onClose={closeDialogue1}>
                            <DialogTitle>Subscribe</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    To subscribe a user, add they're public github username. We'll take care of the rest.
                                </DialogContentText>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="name"
                                    value={newUserName}
                                    onChange={e => { setNewUserName(e.target.value) }}
                                    label="Name"
                                    type="text"
                                    fullWidth
                                    variant="standard"
                                />
                                <TextField
                                    margin="dense"
                                    id="github"
                                    value={newUserGithub}
                                    onChange={e => { setNewUserGithub(e.target.value) }}
                                    label="GitHub"
                                    type="text"
                                    fullWidth
                                    variant="standard"
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={closeDialogue1}>Cancel</Button>
                                <Button onClick={(event) => {
                                    fetch('/admin/author', {
                                        method: 'PUT',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                            displayName: newUserName,
                                            github: newUserGithub
                                        })
                                    })
                                        .then(res => {
                                            closeDialogue1();
                                            if (res.status === 200) {
                                                setNewUserName('');
                                                setNewUserGithub('');
                                                loadUsers(1)
                                                    .then(users => { setUsers(users) });
                                            } else {
                                                setErrMsg("User already exists. Set a different GitHub username.");
                                            }
                                        })
                                }}>Subscribe</Button>
                            </DialogActions>
                        </Dialog>
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
                                Remote Nodes
                            </Typography>
                            <IconButton onClick={() => {
                                selectedRemoteNodes.forEach(id => {
                                    fetch(`/remotes/${id}`, {
                                        method: "DELETE",
                                        headers: {
                                            'Authorization': `Basic ${token}`
                                        }
                                    })
                                        .then(() => {
                                            setRemoteNodes(remoteNodes.filter(r => r.id !== id));
                                        })
                                        .catch(err => {
                                            setErrMsg(`Remote node <${id}> does not exist.`);
                                        });
                                })
                                loadRemoteNodes();
                            }}>
                                <DeleteIcon />
                            </IconButton>
                        </Toolbar>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell></TableCell>
                                        {remoteTableColumns.map(column => {
                                            return <TableCell>{column}</TableCell>
                                        })}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {remoteNodes.map(({ id, username, password }, index) => {
                                        const label = { inputProps: { 'aria-label': 'Checkbox' } };
                                        return <TableRow>
                                            <TableCell><Checkbox {...label} checked={selectedRemoteNodes.includes(id)} onClick={e => {
                                                addOrRemoveRemoteNodeToSelected(id);
                                            }} /></TableCell>
                                            <TableCell><Link href={id} target="_blank" rel="noreferrer">{id}</Link></TableCell>
                                            <TableCell>{username}</TableCell>
                                            <TableCell><i>{password}</i></TableCell>
                                        </TableRow>
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                    <br />
                    <Box>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={openDialogue2}>Add Remote Node</Button>
                        <Dialog open={open2} onClose={closeDialogue2}>
                            <DialogTitle>Subscribe</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    To subscribe a user, add they're public github username. We'll take care of the rest.
                                </DialogContentText>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="remote_url"
                                    value={newRemoteNodeURL}
                                    onChange={e => { setNewRemoteNodeURL(e.target.value) }}
                                    label="Remote Node Base URL"
                                    type="text"
                                    fullWidth
                                    variant="standard"
                                />
                                <TextField
                                    margin="dense"
                                    id="remote_username"
                                    value={newRemoteNodeUsername}
                                    onChange={e => { setNewRemoteNodeUsername(e.target.value) }}
                                    label="Authentication Username"
                                    type="text"
                                    fullWidth
                                    variant="standard"
                                />
                                <TextField
                                    margin="dense"
                                    id="remote_password"
                                    value={newRemoteNodePassword}
                                    onChange={e => { setNewRemoteNodePassword(e.target.value) }}
                                    label="Authentication Password"
                                    type="text"
                                    fullWidth
                                    variant="standard"
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={closeDialogue2}>Cancel</Button>
                                <Button onClick={(event) => {
                                    fetch('/remotes', {
                                        method: 'PUT',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Basic ${token}`
                                        },
                                        body: JSON.stringify({
                                            url: newRemoteNodeURL,
                                            username: newRemoteNodeUsername,
                                            password: newRemoteNodePassword
                                        })
                                    })
                                        .then(res => {
                                            closeDialogue2();
                                            if (res.status === 200) {
                                                setNewRemoteNodeURL('');
                                                setNewRemoteNodeUsername('');
                                                setNewRemoteNodePassword('');
                                                loadRemoteNodes();
                                            } else {
                                                setErrMsg("Remote node exists. Set a different remote node URL.");
                                            }
                                        })
                                }}>Subscribe</Button>
                            </DialogActions>
                        </Dialog>
                    </Box>
                </Box>}
            </DrawerMenu>
        </div>
    );
}

export default Settings;
