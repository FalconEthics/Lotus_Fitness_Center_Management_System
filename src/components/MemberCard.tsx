import React from 'react';
import { motion } from 'framer-motion';
import { HiUser, HiEnvelope, HiPhone, HiCalendarDays } from 'react-icons/hi2';
import { Card, Badge } from './ui';
import { Member } from '../types';
import { format } from 'date-fns';

interface MemberCardProps {
  member: Member;
  compact?: boolean;
}

const membershipColors = {
  Basic: 'default',
  Premium: 'primary',
  VIP: 'success',
} as const;

export const MemberCard: React.FC<MemberCardProps> = ({ member, compact = false }) => {
  const initials = member.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const joinDate = new Date(member.startDate);
  const formattedDate = format(joinDate, 'MMM dd, yyyy');

  if (compact) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className="min-w-[280px]"
      >
        <Card hover padding="md" className="bg-base-100">
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
                {member.name}
              </h3>
              <p className="text-sm text-base-content/60 truncate">
                {member.email}
              </p>
              <Badge
                variant={membershipColors[member.membershipType]}
                size="sm"
                className="mt-1"
              >
                {member.membershipType}
              </Badge>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card hover padding="lg">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-xl font-bold text-primary-content">
              {initials}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-base-content mb-1">
            {member.name}
          </h3>
          
          <Badge
            variant={membershipColors[member.membershipType]}
            size="md"
          >
            {member.membershipType}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <HiEnvelope className="h-4 w-4 text-base-content/40 flex-shrink-0" />
            <span className="text-base-content/70 truncate">{member.email}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <HiPhone className="h-4 w-4 text-base-content/40 flex-shrink-0" />
            <span className="text-base-content/70">{member.phone}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <HiCalendarDays className="h-4 w-4 text-base-content/40 flex-shrink-0" />
            <span className="text-base-content/70">Joined {formattedDate}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <HiUser className="h-4 w-4 text-base-content/40 flex-shrink-0" />
            <span className="text-base-content/70">ID: {member.id}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};