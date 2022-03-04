import React from "react";
import { h } from "preact";
import DrawerMenu from '../components/sidemenu-components/Drawer'

type profileProps = {path: string}

function Profile({path}: profileProps) {
  return (
    <div>
      <DrawerMenu
      pageName="My Profile"
      >

      </DrawerMenu>
    </div>
  );
}

export default Profile;
