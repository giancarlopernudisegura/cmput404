import { h } from "preact";
import {
  AppBar,
  Alert,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  Button,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  SvgIconTypeMap
} from "@mui/material";
import ExploreIcon from "@mui/icons-material/Explore";
import Home from "@mui/icons-material/Home";
import Notification from "@mui/icons-material/Notifications";
import MenuIcon from "@mui/icons-material/Menu";
import Person from "@mui/icons-material/Person";
import Settings from "@mui/icons-material/Settings";
import { route } from 'preact-router';
import { useEffect, useState } from "preact/hooks";
import { getCurrentAuthor, logOutCall } from '../../utils/apiCalls';
import { OverridableComponent } from "@mui/material/OverridableComponent";

// Drawer Implementation retrieved from MUI Official Documentation. (n.d.). React drawer component. MUI. Retrieved March 3, 2022, from https://mui.com/components/drawers/#responsive-drawer

const drawerWidth = 240;

type drawerProps = { path: string };

interface Props {
  window?: () => Window;
  pageName: string;
  navLink: string;
}

type LinkProps = [string, string, OverridableComponent<SvgIconTypeMap<{}, "svg">>]

function DrawerMenu(props: any) {
  const { window } = props;
  const [errMsg, setErrMsg] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [links, setLinks] = useState<LinkProps[]>([
    ["Home", "/app/homepage", Home],
    ["Explore", "/app", ExploreIcon],
    ["My Profile", "/app/profile", Person],
    ["Inbox", "/app/inbox", Notification]
  ]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const logOutHandler = async () => {
    try {
      await logOutCall();
      route('/app/login')
    } catch (err) {
      // TODO: handle error with logging out
      console.error("There was an error");
    }
  }

  useEffect(() => {
    getCurrentAuthor()
      .then(({ isAdmin }) => {
        if (isAdmin)
          setLinks(links.concat([["Admin Settings", "/app/admin", Settings]]))
      })
  }, [])


  const drawer = (
    <div id="drawer-component">
      <Toolbar />
      {errMsg && (
        <Alert severity="error">{errMsg}</Alert>
      )}
      <Divider />
      <List>
        {links.map(
          ([text, link, Icon]) => (
            <ListItem button key={text} onClick={() => {
              route(link, true)
            }}>
              <ListItemIcon>
                <Icon />
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
        <Toolbar style={{ display: 'flex', justifyContent: "space-between", width: '100%' }}>
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
