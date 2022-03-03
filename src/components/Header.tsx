import { h } from "preact";
import { Button } from "@mui/material";

function Header() {
  return (
    // ******Work In Progress*****
    <nav id="nav" className="bg-blue-500 ">
      <div id="nav-container" className="mx-auto container px-2">
        <div className="flex justify-between">
        <h1 className="text-xl p-5 font-display font-bold text-zinc-100">TikTakToe</h1>
        <Button variant='outlined'>Admin Login</Button>
      </div>
      </div>
    </nav>
    
    // <header id="header"
    //     className='w-full flex flex-row sticky top-0 shadow-md'>
    //     <div>
    //         <h1 className="text-xl p-5 font-display font-bold text-blue-800">TIKTAKTOE</h1>
    //     </div>
    //     {/* <div className='w-1/5 p-8'>
    //     <img src={Logo} alt="food" />
    //     </div> */}
    //     <div className='flex justify-end p-4 float-right'>
    //     <Button variant='outlined'>Admin Login</Button>
    //     </div>

    //     {/* TODO: notifications */}
    //     {/* TODO: profile */}
    // </header>
  );
}

export default Header;
