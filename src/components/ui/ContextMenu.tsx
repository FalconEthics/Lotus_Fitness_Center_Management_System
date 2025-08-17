import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean;
  variant?: 'default' | 'danger' | 'warning';
  shortcut?: string;
}

interface ContextMenuProps {
  children: ReactNode;
  items: ContextMenuItem[];
  disabled?: boolean;
}

export function ContextMenu({ children, items, disabled = false }: ContextMenuProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    if (disabled) return;
    
    event.preventDefault();
    event.stopPropagation();

    const { clientX, clientY } = event;
    setPosition({ x: clientX, y: clientY });
    setIsOpen(true);
  };

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return;
    
    item.onClick();
    setIsOpen(false);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Handle clicks outside menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', closeMenu);
      window.addEventListener('resize', closeMenu);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', closeMenu);
      window.removeEventListener('resize', closeMenu);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Adjust menu position if it goes outside viewport
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      let newX = position.x;
      let newY = position.y;

      // Adjust horizontal position
      if (rect.right > viewport.width) {
        newX = position.x - rect.width;
      }

      // Adjust vertical position
      if (rect.bottom > viewport.height) {
        newY = position.y - rect.height;
      }

      // Ensure menu doesn't go outside left/top edges
      if (newX < 0) newX = 8;
      if (newY < 0) newY = 8;

      if (newX !== position.x || newY !== position.y) {
        setPosition({ x: newX, y: newY });
      }
    }
  }, [isOpen, position]);

  const getItemVariant = (variant: string = 'default') => {
    switch (variant) {
      case 'danger':
        return 'text-error hover:bg-error/10';
      case 'warning':
        return 'text-warning hover:bg-warning/10';
      default:
        return 'text-base-content hover:bg-base-200';
    }
  };

  const menuVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      transformOrigin: 'top left'
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transformOrigin: 'top left',
      transition: {
        type: 'spring',
        duration: 0.2
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transformOrigin: 'top left',
      transition: {
        duration: 0.15
      }
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onContextMenu={handleContextMenu}
        className="contents"
      >
        {children}
      </div>

      {isOpen && createPortal(
        <AnimatePresence>
          <motion.div
            ref={menuRef}
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: 'fixed',
              left: position.x,
              top: position.y,
              zIndex: 9999
            }}
            className="bg-base-100 border border-base-300 rounded-lg shadow-lg py-1 min-w-[200px] max-w-[300px]"
          >
            {items.map((item, index) => (
              <React.Fragment key={item.id}>
                {item.divider && index > 0 && (
                  <div className="border-t border-base-300 my-1" />
                )}
                <button
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={`
                    w-full text-left px-3 py-2 text-sm transition-colors
                    flex items-center gap-3
                    ${item.disabled 
                      ? 'text-base-content/40 cursor-not-allowed' 
                      : getItemVariant(item.variant)
                    }
                  `}
                >
                  {item.icon && (
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span className="flex-1">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-xs text-base-content/60 ml-auto">
                      {item.shortcut}
                    </span>
                  )}
                </button>
              </React.Fragment>
            ))}
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}