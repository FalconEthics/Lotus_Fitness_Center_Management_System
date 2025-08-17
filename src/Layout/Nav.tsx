import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { HiBars3, HiArrowRightOnRectangle, HiBell, HiUser, HiCommandLine } from 'react-icons/hi2';
import logo from "../assets/logo.png";
import { Button, Badge } from "../components/ui";
import { ThemeToggle } from '../components/ui/ThemeToggle';
import toast from 'react-hot-toast';

interface NavProps {
  onToggleSidebar: () => void;
}

export function Nav({ onToggleSidebar }: NavProps): JSX.Element {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("auth");
    navigate("/login");
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-base-100 border-b border-base-300 px-4 lg:px-6 h-16 flex items-center justify-between shadow-sm sticky top-0 z-30"
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          icon={<HiBars3 className="h-5 w-5" />}
          className="md:hidden"
        >
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={logo}
            alt="LFC"
            className="h-8 w-8 object-contain"
          />
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-base-content">
              Lotus Fitness Center
            </h1>
            <p className="text-xs text-base-content/60">Management System</p>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              toast.info('🚧 Notifications feature is currently under development and will be available in a future update!', {
                duration: 4000,
                position: 'top-center',
              });
            }}
            icon={<HiBell className="h-5 w-5" />}
            className="relative"
          >
            <span className="sr-only">Notifications</span>
          </Button>
          <Badge
            variant="danger"
            size="sm"
            className="absolute -top-1 -right-1 px-1.5 py-0 min-w-[1.25rem] h-5 text-xs"
          >
            3
          </Badge>
        </motion.div>

        {/* Keyboard Shortcuts Help */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Trigger keyboard shortcuts help
            const event = new KeyboardEvent('keydown', {
              key: 'k',
              ctrlKey: true,
              bubbles: true
            });
            document.dispatchEvent(event);
          }}
          icon={<HiCommandLine className="h-5 w-5" />}
          className="hidden sm:flex"
          title="Keyboard shortcuts (Ctrl+K)"
        >
          <span className="sr-only">Keyboard shortcuts</span>
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu */}
        <div className="flex items-center gap-2 pl-2 border-l border-base-300">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-base-content">Admin User</p>
            <p className="text-xs text-base-content/60">admin@lotus.fit</p>
          </div>
          
          {/* Profile Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            icon={<HiUser className="h-4 w-4" />}
            className="text-primary hover:bg-primary/10"
          >
            <span className="hidden sm:inline">Profile</span>
          </Button>
          
          {/* Logout Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            icon={<HiArrowRightOnRectangle className="h-4 w-4" />}
            className="text-error border-error/30 hover:bg-error/10 hover:border-error"
          >
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}