import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark } from 'react-icons/hi2';
import { cn } from '../../utils/cn';
import { Button } from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    closeOnOverlayClick?: boolean;
    closeOnEscape?: boolean;
}

const sizeVariants = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
};

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

const modalVariants = {
    hidden: {
        opacity: 0,
        scale: 0.8,
        y: -50
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            damping: 25,
            stiffness: 300,
        }
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        y: -50,
        transition: {
            duration: 0.2,
        }
    },
};

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = 'md',
    closeOnOverlayClick = true,
    closeOnEscape = true,
}) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (closeOnEscape && e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose, closeOnEscape]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Fixed Overlay */}
                    <motion.div
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm mt-0"
                        style={{ marginTop: '0px' }}
                        onClick={closeOnOverlayClick ? onClose : undefined}
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 pointer-events-none">
                        <div className="pointer-events-auto max-h-full w-full flex items-center justify-center">

                            {/* Modal */}
                            <motion.div
                                variants={modalVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className={cn(
                                    'relative bg-base-100 rounded-xl shadow-2xl w-full max-h-[90vh] flex flex-col overflow-hidden',
                                    sizeVariants[size]
                                )}
                            >
                                {/* Header */}
                                {(title || description) && (
                                    <div className="px-6 py-4 border-b border-base-300 flex-shrink-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                {title && (
                                                    <h2 className="text-xl font-semibold text-base-content">
                                                        {title}
                                                    </h2>
                                                )}
                                                {description && (
                                                    <p className="mt-1 text-sm text-base-content/70">
                                                        {description}
                                                    </p>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={onClose}
                                                icon={<HiXMark className="h-5 w-5" />}
                                            >
                                                <span className="sr-only">Close</span>
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Content */}
                                <div className="px-6 py-4 overflow-y-auto flex-1 min-h-0">
                                    {children}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

// Sub-components
Modal.Footer = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
    <div className={cn('px-6 py-4 border-t border-base-300 flex items-center justify-end gap-3 flex-shrink-0', className)} {...props}>
        {children}
    </div>
);
