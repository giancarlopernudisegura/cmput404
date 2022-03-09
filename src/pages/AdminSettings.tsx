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
    Link
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
        const pageSize = 5;
        const loadUsers = async (page: number): Promise<User[]> => {
            const res = await fetch(`/authors?size=${pageSize}&page=${page}`)
            if (res.status !== 200) {
                setIsLoading(false);
                return [];
            }
            const data = await res.json();
            const u: User[] = data.items;
            return u.concat(await loadUsers(page + 1));
        }
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
                        <h1>Users</h1>
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
                                            <TableCell><Link href={github} target="_blank" rel="noreferrer">{github}</Link></TableCell>
                                            <TableCell><Link href={host} target="_blank" rel="noreferrer">{host}</Link></TableCell>
                                            <TableCell><Link href={url} target="_blank" rel="noreferrer">{url}</Link></TableCell>
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
                </Box>}
            </DrawerMenu>
        </div>
    );
}

export default Settings;
