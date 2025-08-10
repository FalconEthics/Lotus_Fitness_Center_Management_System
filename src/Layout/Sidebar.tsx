import React from 'react';
import { NavLink } from "react-router";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiHome, 
  HiAcademicCap, 
  HiUsers, 
  HiChartBarSquare,
  HiXMark 
} from "react-icons/hi2";
import { Button } from "../components/ui";
import { SidebarItemProps } from '../types';

// Navigation items with modern icons
const navItems = [
  { to: "/", icon: HiHome, label: "Dashboard" },
  { to: "/manageclasses", icon: HiAcademicCap, label: "Classes" },
  { to: "/managemembers", icon: HiUsers, label: "Members" },
];

// Navigation item component with modern styling
function NavItem({ to, icon: Icon, label }: SidebarItemProps): JSX.Element {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
          isActive
            ? "bg-red-600 text-white shadow-md"
            : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={`h-5 w-5 flex-shrink-0 ${
            isActive ? "text-white" : "text-neutral-500 group-hover:text-neutral-700"
          }`} />
          <span className="truncate">{label}</span>
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="ml-auto w-2 h-2 bg-white rounded-full"
            />
          )}
        </>
      )}
    </NavLink>
  );
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps): JSX.Element {
  const sidebarVariants = {
    closed: {
      x: -280,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
      },
    },
    open: {
      x: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
      },
    },
  };

  const itemVariants = {
    closed: { opacity: 0, x: -20 },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.1 + i * 0.1,
        duration: 0.3,
      },
    }),
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden md:flex flex-col w-64 bg-white border-r border-neutral-200 h-full"
        initial="open"
        animate="open"
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Navigation</h2>
          <nav className="space-y-2">
            {navItems.map((item, index) => (
              <motion.div
                key={item.to}
                custom={index}
                variants={itemVariants}
                initial="closed"
                animate="open"
              >
                <NavItem {...item} />
              </motion.div>
            ))}
          </nav>
        </div>

        {/* Stats Section */}
        <div className="mt-auto p-6 border-t border-neutral-200">
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 text-white">
            <h3 className="font-medium text-sm mb-2">System Status</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <span className="text-xs opacity-90">All systems operational</span>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed left-0 top-0 w-64 h-full bg-white border-r border-neutral-200 z-50 md:hidden shadow-xl"
          >
            <div className="p-4 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900">Navigation</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  icon={<HiXMark className="h-5 w-5" />}
                >
                  <span className="sr-only">Close sidebar</span>
                </Button>
              </div>
            </div>

            <div className="p-4">
              <nav className="space-y-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.to}
                    custom={index}
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                    onClick={onClose}
                  >
                    <NavItem {...item} />
                  </motion.div>
                ))}
              </nav>
            </div>

            {/* Mobile Stats Section */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 text-white">
                <h3 className="font-medium text-sm mb-2">System Status</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                  <span className="text-xs opacity-90">All systems operational</span>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}