import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiExclamationTriangle, 
  HiClock, 
  HiEnvelope, 
  HiPhone, 
  HiEye,
  HiXMark,
  HiChevronDown,
  HiChevronRight
} from 'react-icons/hi2';
import { format, differenceInDays, addDays } from 'date-fns';
import { Card, Button, Badge } from '../ui';
import { Member } from '../../types';
import { useMembers } from '../../contexts/DatasetContext';
import toast from 'react-hot-toast';

interface ExpiringMember extends Member {
  daysUntilExpiry: number;
  urgencyLevel: 'critical' | 'warning' | 'notice';
}

export function ExpiringMembershipsAlert(): JSX.Element {
  const members = useMembers();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Calculate expiring members with different time frames
  const expiringMembers: ExpiringMember[] = React.useMemo(() => {
    const today = new Date();
    const next30Days = addDays(today, 30);

    return members
      .filter(member => {
        const endDate = new Date(member.endDate);
        return endDate >= today && endDate <= next30Days && member.status === 'Active';
      })
      .map(member => {
        const endDate = new Date(member.endDate);
        const daysUntilExpiry = differenceInDays(endDate, today);
        
        let urgencyLevel: 'critical' | 'warning' | 'notice';
        if (daysUntilExpiry <= 3) urgencyLevel = 'critical';
        else if (daysUntilExpiry <= 7) urgencyLevel = 'warning';
        else urgencyLevel = 'notice';

        return {
          ...member,
          daysUntilExpiry,
          urgencyLevel
        };
      })
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }, [members]);

  const criticalCount = expiringMembers.filter(m => m.urgencyLevel === 'critical').length;
  const warningCount = expiringMembers.filter(m => m.urgencyLevel === 'warning').length;
  const noticeCount = expiringMembers.filter(m => m.urgencyLevel === 'notice').length;

  const handleContactMember = (member: ExpiringMember) => {
    toast.success(`Contact initiated for ${member.name}`);
  };

  const handleBulkContact = (urgencyLevel: 'critical' | 'warning' | 'notice') => {
    const count = expiringMembers.filter(m => m.urgencyLevel === urgencyLevel).length;
    toast.success(`Bulk contact initiated for ${count} members`);
  };

  if (expiringMembers.length === 0) {
    return (
      <Card className="p-4 border-success bg-success/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
            <HiClock className="h-5 w-5 text-success" />
          </div>
          <div>
            <h3 className="font-semibold text-success">All Memberships Current</h3>
            <p className="text-sm text-base-content/70">No memberships expiring in the next 30 days</p>
          </div>
        </div>
      </Card>
    );
  }

  const getUrgencyColor = (urgency: 'critical' | 'warning' | 'notice') => {
    switch (urgency) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'notice': return 'info';
    }
  };

  const getUrgencyIcon = (urgency: 'critical' | 'warning' | 'notice') => {
    switch (urgency) {
      case 'critical': return HiExclamationTriangle;
      case 'warning': return HiClock;
      case 'notice': return HiEye;
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
              <HiExclamationTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-base-content">Expiring Memberships</h3>
              <p className="text-sm text-base-content/70">
                {expiringMembers.length} memberships expiring in the next 30 days
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              icon={showDetails ? <HiXMark className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
            >
              {showDetails ? 'Hide' : 'Details'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              icon={isExpanded ? <HiChevronDown className="h-4 w-4" /> : <HiChevronRight className="h-4 w-4" />}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>

        {/* Summary Badges */}
        <div className="flex items-center gap-2 mt-3">
          {criticalCount > 0 && (
            <Badge variant="error" size="sm">
              {criticalCount} Critical (≤3 days)
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge variant="warning" size="sm">
              {warningCount} Warning (≤7 days)
            </Badge>
          )}
          {noticeCount > 0 && (
            <Badge variant="info" size="sm">
              {noticeCount} Notice (≤30 days)
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-base-300 bg-base-50">
        <div className="flex flex-wrap gap-2">
          {criticalCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkContact('critical')}
              icon={<HiEnvelope className="h-4 w-4" />}
              className="text-error border-error/30 hover:bg-error/10"
            >
              Contact Critical ({criticalCount})
            </Button>
          )}
          {warningCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkContact('warning')}
              icon={<HiEnvelope className="h-4 w-4" />}
              className="text-warning border-warning/30 hover:bg-warning/10"
            >
              Contact Warning ({warningCount})
            </Button>
          )}
          {noticeCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkContact('notice')}
              icon={<HiEnvelope className="h-4 w-4" />}
              className="text-info border-info/30 hover:bg-info/10"
            >
              Contact Notice ({noticeCount})
            </Button>
          )}
        </div>
      </div>

      {/* Expandable Member List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="max-h-96 overflow-y-auto">
              {expiringMembers.map((member, index) => {
                const UrgencyIcon = getUrgencyIcon(member.urgencyLevel);
                const urgencyColor = getUrgencyColor(member.urgencyLevel);
                
                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 border-b border-base-300 last:border-b-0 hover:bg-base-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          urgencyColor === 'error' ? 'bg-error/20' :
                          urgencyColor === 'warning' ? 'bg-warning/20' :
                          'bg-info/20'
                        }`}>
                          <UrgencyIcon className={`h-4 w-4 ${
                            urgencyColor === 'error' ? 'text-error' :
                            urgencyColor === 'warning' ? 'text-warning' :
                            'text-info'
                          }`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-base-content">{member.name}</h4>
                            <Badge variant={urgencyColor} size="sm">
                              {member.daysUntilExpiry} days
                            </Badge>
                          </div>
                          
                          {showDetails && (
                            <div className="text-sm text-base-content/60 mt-1 space-y-1">
                              <p>Expires: {format(new Date(member.endDate), 'MMM dd, yyyy')}</p>
                              <p>Plan ID: {member.membershipPlanId}</p>
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <HiEnvelope className="h-3 w-3" />
                                  {member.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <HiPhone className="h-3 w-3" />
                                  {member.phone}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleContactMember(member)}
                          icon={<HiEnvelope className="h-4 w-4" />}
                          className="opacity-60 hover:opacity-100"
                        >
                          Contact
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}