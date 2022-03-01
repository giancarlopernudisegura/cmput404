import { h } from 'preact';

function Header() {
    return (
        <header id="header"
            className='w-full flex flex-row sticky top-0 shadow-md bg-white'>
            <div>
                <h1 className="text-xl p-5 font-display font-bold text-blue-800">TIKTAKTOE</h1>
            </div>
            
            {/* TODO: notifications */}
            {/* TODO: profile */}
        </header>
    );
}

export default Header;