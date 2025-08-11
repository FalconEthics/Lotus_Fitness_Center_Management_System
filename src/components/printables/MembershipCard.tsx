import React from 'react';
import { Member, MembershipPlan } from '../../types';
import { format, parseISO, addDays, addMonths, addYears } from 'date-fns';
import logo from '../../assets/logo.png';

interface MembershipCardProps {
  member: Member;
  plan?: MembershipPlan;
}

export const MembershipCard = React.forwardRef<HTMLDivElement, MembershipCardProps>(
  ({ member, plan }, ref) => {
    // Calculate expiry date based on plan duration
    const startDate = parseISO(member.startDate);
    const getExpiryDate = () => {
      if (!plan) return format(addYears(startDate, 1), 'MMM dd, yyyy');
      
      const duration = plan.duration;
      if (duration.includes('month')) {
        const months = parseInt(duration);
        return format(addMonths(startDate, months), 'MMM dd, yyyy');
      } else if (duration.includes('year')) {
        const years = parseInt(duration);
        return format(addYears(startDate, years), 'MMM dd, yyyy');
      } else if (duration.includes('day')) {
        const days = parseInt(duration);
        return format(addDays(startDate, days), 'MMM dd, yyyy');
      }
      return format(addYears(startDate, 1), 'MMM dd, yyyy');
    };

    const memberInitials = member.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div ref={ref} className="print-content">
        <style>{`
          @media print {
            body { margin: 0; padding: 20px; }
            .print-content { 
              width: 85.6mm; 
              height: 53.9mm; 
              margin: 0 auto;
              font-family: Arial, sans-serif;
              border: 2px solid #dc2626;
              border-radius: 8px;
              overflow: hidden;
              background: white;
            }
            .no-print { display: none !important; }
          }
        `}</style>
        
        {/* Membership Card */}
        <div className="w-[85.6mm] h-[53.9mm] mx-auto bg-white border-2 border-red-600 rounded-lg overflow-hidden shadow-lg">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={logo} alt="Logo" className="w-6 h-6" />
                <div>
                  <h1 className="text-sm font-bold">Lotus Fitness Center</h1>
                  <p className="text-xs opacity-90">Membership Card</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-90">ID: {member.id}</p>
                <p className="text-xs font-semibold">{member.membershipType}</p>
              </div>
            </div>
          </div>

          {/* Member Info */}
          <div className="p-3">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-red-600">
                  {memberInitials}
                </span>
              </div>
              
              {/* Details */}
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-gray-900 truncate">
                  {member.name}
                </h2>
                <p className="text-xs text-gray-600 truncate">
                  {member.email}
                </p>
                <p className="text-xs text-gray-600">
                  {member.phone}
                </p>
                
                {/* Dates */}
                <div className="mt-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Start:</span>
                    <span className="font-medium">{format(startDate, 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Expires:</span>
                    <span className="font-medium">{getExpiryDate()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Plan Details */}
            {plan && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Plan:</span>
                  <span className="text-xs font-medium">{plan.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Duration:</span>
                  <span className="text-xs font-medium">{plan.duration}</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 bg-gray-50 px-3 py-1">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                Valid ID Required
              </p>
              <p className="text-xs text-gray-500">
                {format(new Date(), 'MMM yyyy')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

MembershipCard.displayName = 'MembershipCard';