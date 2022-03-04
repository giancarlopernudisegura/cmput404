import { h } from "preact";
import { AppBar } from "@mui/material";
import { Box } from "@mui/material";
import { CssBaseline } from "@mui/material";
import { Divider } from "@mui/material";
import { Drawer } from "@mui/material";
import { IconButton } from "@mui/material";
import ExploreIcon from "@mui/icons-material/Explore";
import { List } from "@mui/material";
import { ListItem } from "@mui/material";
import { Button, ListItemIcon } from "@mui/material";
import { ListItemText } from "@mui/material";
import Home from "@mui/icons-material/Home";
import Notification from "@mui/icons-material/Notifications";
import { Toolbar } from "@mui/material";
import { Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Person from "@mui/icons-material/Person";
import { Settings } from "@mui/icons-material";
import { route } from 'preact-router';
import { useState } from "preact/hooks";
import { logOutCall } from '../../utils/apiCalls';

// Drawer Implementation retrieved from MUI Official Documentation. (n.d.). React drawer component. MUI. Retrieved March 3, 2022, from https://mui.com/components/drawers/#responsive-drawer

const drawerWidth = 240;

type drawerProps = { path: string };

interface Props {
  window?: () => Window;
  pageName: string;
  navLink: string;
}


function DrawerMenu(props: any) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const logOutHandler = async () => {
    try {
      await logOutCall();
      route('/app/login')
    } catch (err) {
      // TODO: handle error with logging out
    }
  }

  const drawer = (
    <div id="drawer-component">
      <Toolbar />
      <Divider />
      <List>
        {["Home", "Explore", "My Profile", "Notifications", "Settings", "Search"].map(
          (text, index) => (
            <ListItem button key={text} onClick={() => {
                if (text === 'Home') {route('/app/homepage', true)}
                if (text === 'Explore') {route('/app', true)}
                if (text === 'My Profile') {route('/app/profile', true)}
                if (text === 'Notifications') {route('/app/notifications', true)}
                if (text === 'Notifications') {route('/app/notifications', true)}
                if (text === 'Search') {
                  route('/app/search', true)
                }
            }}>
              <ListItemIcon>
                  {index * 3 === 0 ? <Home /> : ''}
                  {index * 3 === 3 ? <ExploreIcon /> : ''}
                  {index * 3 === 6 ? <Person /> : ''}
                  {index * 3 === 9 ? <Notification /> : ''}
                  {index * 3 === 12 ? <Settings/> : ''}
                  {index * 3 === 16 ? <Settings/> : ''}
                {/* <MyProfile /> */}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          )
        )}
      </List>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
        elevation={0}
        color="default"
      >
        <Toolbar style={{display:'flex', justifyContent:"space-between", width:'100%'}}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {props.pageName}
          </Typography>
          <Button onClick={logOutHandler}>Log out</Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="explore page"
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {props.children}
      </Box>
    </Box>
  );
}

export default DrawerMenu;
