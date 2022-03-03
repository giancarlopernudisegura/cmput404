import { h, Component, ComponentChild } from 'preact'
import { AppBar, Card, CardContent, Menu, MenuItem } from '@mui/material';
import { useEffect } from 'preact/hooks';
import { Button } from '@mui/material';
import DrawerMenu from '../components/sidemenu-components/Drawer'

type FeedProps = {
  path: string
};


function Homepage(props : FeedProps) {

  return (
    <div>
        <DrawerMenu
        pageName="Home"
        >
            This is a sample homepage.
        </DrawerMenu>
    </div>
  )
}

export default Homepage;