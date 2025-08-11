import React from 'react';
import { motion } from 'framer-motion';
import { 
  HiEnvelope, 
  HiPhone, 
  HiStar,
  HiPencil,
  HiTrash,
  HiUser,
  HiCalendarDays,
  HiAcademicCap
} from 'react-icons/hi2';
import { Card, Badge, Button, ContextMenu, ContextMenuItem } from '../ui';
import { Trainer } from '../../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface TrainerCardProps {
  trainer: Trainer;
  onEdit: () => void;
  onDelete: () => void;
  compact?: boolean;
}

const statusColors = {
  active: 'success',
  inactive: 'warning',
  suspended: 'danger',
} as const;

export const TrainerCard: React.FC<TrainerCardProps> = ({ 
  trainer, 
  onEdit, 
  onDelete,
  compact = false 
}) => {
  const initials = trainer.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const joinDate = new Date(trainer.hiredDate);
  const formattedDate = format(joinDate, 'MMM dd, yyyy');

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <HiStar
            key={index}
            className={`h-4 w-4 ${
              index < Math.floor(rating)
                ? 'text-warning fill-current'
                : 'text-base-content/20'
            }`}
          />
        ))}
        <span className="text-sm text-base-content/70 ml-1">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  // Context menu items for trainer
  const contextMenuItems: ContextMenuItem[] = [
    {
      id: 'edit',
      label: 'Edit Trainer',
      icon: HiPencil,
      onClick: onEdit,
      shortcut: 'Ctrl+E'
    },
    {
      id: 'contact',
      label: 'Send Email',
      icon: HiEnvelope,
      onClick: () => {
        window.open(`mailto:${trainer.email}?subject=Lotus Fitness Center`);
        toast.success('Email client opened');
      }
    },
    {
      id: 'call',
      label: 'Call Trainer',
      icon: HiPhone,
      onClick: () => {
        window.open(`tel:${trainer.phone}`);
        toast.success('Calling trainer');
      }
    },
    {
      id: 'schedule',
      label: 'View Schedule',
      icon: HiCalendarDays,
      onClick: () => {
        toast.success(`${trainer.name} teaches ${trainer.assignedClasses.length} classes`);
      }
    },
    {
      id: 'certifications',
      label: 'View Certifications',
      icon: HiAcademicCap,
      onClick: () => {
        if (trainer.certifications.length > 0) {
          toast.success(`Certifications: ${trainer.certifications.join(', ')}`);
        } else {
          toast.info('No certifications on file');
        }
      }
    },
    {
      id: 'divider-1',
      label: '',
      onClick: () => {},
      divider: true
    },
    {
      id: 'delete',
      label: 'Delete Trainer',
      icon: HiTrash,
      onClick: onDelete,
      variant: 'danger',
      shortcut: 'Del'
    }
  ];

  if (compact) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className="min-w-[280px]"
      >
        <ContextMenu items={contextMenuItems}>
          <Card hover padding="md" className="cursor-context-menu">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {initials}
                </span>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base-content truncate">
                {trainer.name}
              </h3>
              <p className="text-sm text-base-content/60 truncate">
                {trainer.email}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <Badge
                  variant={statusColors[trainer.status]}
                  size="sm"
                >
                  {trainer.status}
                </Badge>
                {trainer.rating && renderRating(trainer.rating)}
              </div>
            </div>
          </div>
        </Card>
        </ContextMenu>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="w-full"
    >
      <ContextMenu items={contextMenuItems}>
        <Card hover padding="lg" className="h-full cursor-context-menu">
        {/* Header with Actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-primary-content">
                {initials}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-base-content mb-1">
              {trainer.name}
            </h3>
            
            <Badge
              variant={statusColors[trainer.status]}
              size="md"
            >
              {trainer.status}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              icon={<HiPencil className="h-4 w-4" />}
            >
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              icon={<HiTrash className="h-4 w-4" />}
              className="text-error hover:bg-error/10"
            >
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 text-sm">
            <HiEnvelope className="h-4 w-4 text-base-content/40 flex-shrink-0" />
            <span className="text-base-content/70 truncate">{trainer.email}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <HiPhone className="h-4 w-4 text-base-content/40 flex-shrink-0" />
            <span className="text-base-content/70">{trainer.phone}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <HiCalendarDays className="h-4 w-4 text-base-content/40 flex-shrink-0" />
            <span className="text-base-content/70">Hired {formattedDate}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <HiUser className="h-4 w-4 text-base-content/40 flex-shrink-0" />
            <span className="text-base-content/70">ID: {trainer.id}</span>
          </div>
        </div>

        {/* Specialties */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-base-content/70 flex items-center gap-2 mb-2">
            <HiAcademicCap className="h-4 w-4" />
            Specialties
          </h4>
          <div className="flex flex-wrap gap-2">
            {trainer.specialties.map((specialty) => (
              <Badge
                key={specialty}
                variant="outline"
                size="sm"
              >
                {specialty}
              </Badge>
            ))}
          </div>
        </div>

        {/* Rating */}
        {trainer.rating && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-base-content/70 mb-2">
              Rating
            </h4>
            {renderRating(trainer.rating)}
          </div>
        )}

        {/* Bio */}
        {trainer.bio && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-base-content/70 mb-2">
              Bio
            </h4>
            <p className="text-sm text-base-content/60 line-clamp-3">
              {trainer.bio}
            </p>
          </div>
        )}

        {/* Experience */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-base-content/70 mb-2">
            Experience
          </h4>
          <p className="text-sm text-base-content/60">
            {trainer.experience} years
          </p>
        </div>

        {/* Certifications */}
        {trainer.certifications && trainer.certifications.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-base-content/70 mb-2">
              Certifications
            </h4>
            <div className="space-y-1">
              {trainer.certifications.map((cert, index) => (
                <div key={index} className="text-sm text-base-content/60">
                  • {cert}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
      </ContextMenu>
    </motion.div>
  );
};