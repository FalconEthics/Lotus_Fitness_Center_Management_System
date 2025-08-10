import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { HiBars3, HiArrowRightOnRectangle, HiBell } from 'react-icons/hi2';
import logo from "../assets/logo.png";
import { Button, Badge } from "../components/ui";

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
      className="bg-white border-b border-neutral-200 px-4 lg:px-6 h-16 flex items-center justify-between shadow-sm sticky top-0 z-30"
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
            <h1 className="text-lg font-semibold text-neutral-900">
              Lotus Fitness Center
            </h1>
            <p className="text-xs text-neutral-500">Management System</p>
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

        {/* User Menu */}
        <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-neutral-900">Admin User</p>
            <p className="text-xs text-neutral-500">admin@lotus.fit</p>
          </div>
          
          {/* Logout Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            icon={<HiArrowRightOnRectangle className="h-4 w-4" />}
            className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
          >
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}