import { h } from 'preact';
import { Button } from '@mui/material';
import Logo from '../assets/images/tiktaktoe-logo.png';

function Header() {
    return (
        <nav class="flex items-center justify-between flex-wrap bg-blue-500 p-6">
  <div class="flex items-center flex-shrink-0 text-white mr-6">
    <span class="font-semibold text-xl tracking-tight">TikTakToe</span>
  </div>
  
  <div class="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
    <div class="text-sm lg:flex-grow">
    </div>
    <div>
      <a href="#" class="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-blue-600 hover:bg-white mt-4 lg:mt-0">Admin Login</a>
    </div>
  </div>
</nav>
        // <header id="header"
        //     className='w-full flex flex-row sticky top-0 shadow-md'>
        //     {/* <div>
        //         <h1 className="text-xl p-5 font-display font-bold text-blue-800">TIKTAKTOE</h1>
        //     </div> */}
        //     <div className='w-1/5 p-8'>
        //     <img src={Logo} alt="food" />
        //     </div>
        //     <div className='flex justify-end p-4 float-right'>
        //     <Button variant='outlined'>Admin Login</Button>
        //     </div>
            
        //     {/* TODO: notifications */}
        //     {/* TODO: profile */}
        // </header>
    );
}

export default Header;