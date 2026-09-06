import { FiMenu } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';

// User identity and logout now live at the bottom of the Sidebar, not here
// -- this bar is just the app brand, the mobile menu toggle, and the theme
// switch.
export default function Navbar({ onMenuClick }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-navy-700 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 px-4 shadow-sm sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="-ml-1.5 flex h-10 w-10 items-center justify-center rounded-lg text-xl text-white hover:bg-white/10 lg:hidden"
        >
          <FiMenu />
        </button>
        <div className="flex items-center text-white">
          <span className="text-lg font-extrabold tracking-tight">Dundu Planning</span>
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
