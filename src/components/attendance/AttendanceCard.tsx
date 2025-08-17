import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiUser,
  HiAcademicCap,
  HiCalendarDays,
  HiPencil,
  HiTrash
} from 'react-icons/hi2';
import { Card, Badge, Button } from '../ui';
import { AttendanceRecord, Member, FitnessClass } from '../../types';
import { format, parseISO } from 'date-fns';

interface AttendanceCardProps {
  record: AttendanceRecord;
  member?: Member;
  fitnessClass?: FitnessClass;
  onUpdate: (record: AttendanceRecord) => void;
  onDelete: () => void;
}

const statusConfig = {
  Present: {
    icon: HiCheckCircle,
    color: 'success' as const,
    label: 'Present',
    bgColor: 'bg-success/10',
    textColor: 'text-success'
  },
  Absent: {
    icon: HiXCircle,
    color: 'error' as const,
    label: 'Absent',
    bgColor: 'bg-error/10',
    textColor: 'text-error'
  },
  Late: {
    icon: HiClock,
    color: 'warning' as const,
    label: 'Late',
    bgColor: 'bg-warning/10',
    textColor: 'text-warning'
  }
};

export const AttendanceCard: React.FC<AttendanceCardProps> = ({
  record,
  member,
  fitnessClass,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const config = statusConfig[record.status];
  const StatusIcon = config.icon;
  
  const recordDate = parseISO(record.date);
  const formattedDate = format(recordDate, 'MMM dd, yyyy');
  const formattedTime = record.checkInTime ? 
    format(parseISO(`${record.date}T${record.checkInTime}`), 'HH:mm') : 
    'No check-in time';

  const handleStatusChange = (newStatus: AttendanceRecord['status']) => {
    onUpdate({
      ...record,
      status: newStatus
    });
    setIsEditing(false);
  };

  const memberInitials = member?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="w-full"
    >
      <Card hover padding="lg" className="h-full">
        {/* Header with Status */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${config.bgColor} flex items-center gap-2`}>
            <StatusIcon className={`h-5 w-5 ${config.textColor}`} />
            <span className={`font-medium ${config.textColor}`}>
              {config.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              icon={<HiPencil className="h-4 w-4" />}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              icon={<HiTrash className="h-4 w-4" />}
              className="text-error hover:bg-error/10"
            />
          </div>
        </div>

        {/* Quick Status Update */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-base-200 rounded-lg"
          >
            <p className="text-sm text-base-content/70 mb-2">Update status:</p>
            <div className="flex gap-2">
              {Object.entries(statusConfig).map(([status, config]) => {
                const StatusIcon = config.icon;
                return (
                  <Button
                    key={status}
                    variant={record.status === status ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(status as AttendanceRecord['status'])}
                    icon={<StatusIcon className="h-4 w-4" />}
                  >
                    {config.label}
                  </Button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Member Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {memberInitials}
            </span>
          </div>
          
          <div>
            <h3 className="font-semibold text-base-content">
              {member?.name || 'Unknown Member'}
            </h3>
            <p className="text-sm text-base-content/60">
              {member?.membershipType || 'No membership info'}
            </p>
          </div>
        </div>

        {/* Class Info */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 text-sm">
            <HiAcademicCap className="h-4 w-4 text-base-content/40 flex-shrink-0" />
            <span className="text-base-content/70">
              {fitnessClass?.name || 'Unknown Class'}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <HiCalendarDays className="h-4 w-4 text-base-content/40 flex-shrink-0" />
            <span className="text-base-content/70">{formattedDate}</span>
          </div>
          
          {record.checkInTime && (
            <div className="flex items-center gap-3 text-sm">
              <HiClock className="h-4 w-4 text-base-content/40 flex-shrink-0" />
              <span className="text-base-content/70">Check-in: {formattedTime}</span>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {record.notes && (
          <div className="mt-4 p-3 bg-base-200 rounded-lg">
            <h4 className="text-sm font-semibold text-base-content/70 mb-1">
              Notes
            </h4>
            <p className="text-sm text-base-content/60">
              {record.notes}
            </p>
          </div>
        )}

        {/* Record ID */}
        <div className="mt-4 pt-3 border-t border-base-300">
          <div className="flex items-center justify-between text-xs text-base-content/40">
            <span>Record ID: {record.id}</span>
            {record.checkInTime && (
              <Badge variant="outline" size="sm">
                Recorded
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};