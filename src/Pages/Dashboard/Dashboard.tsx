import React from 'react';
import { motion } from 'framer-motion';
import { 
  HiUsers, 
  HiAcademicCap, 
  HiChartBarSquare, 
  HiUserPlus,
  HiArrowTrendingUp,
  HiSparkles
} from 'react-icons/hi2';
import { useDataset } from '../../contexts/DatasetContext';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { StatCard } from '../../components/StatCard';
import { MemberCard } from '../../components/MemberCard';
import { Card, Button } from '../../components/ui';
import { staggerChildren, fadeInUp } from '../../theme';
import { useDeviceType, useResponsiveGrid, useResponsiveContainer } from '../../utils/responsive';

export function Dashboard(): JSX.Element {
  const dataset = useDataset();
  const stats = useDashboardStats(dataset.members, dataset.classes);
  
  // Responsive hooks
  const { isMobile, isTablet, isDesktop } = useDeviceType();
  const statsGrid = useResponsiveGrid({ xs: 1, sm: 2, lg: 4 });
  const analyticsGrid = useResponsiveGrid({ xs: 1, md: 2, lg: 3 });
  const containerClass = useResponsiveContainer();

  return (
    <motion.div
      variants={staggerChildren}
      initial="initial"
      animate="animate"
      className={`space-y-6 md:space-y-8 ${containerClass}`}
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center justify-between'}`}>
        <div>
          <h1 className={`font-bold text-neutral-900 mb-2 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            Dashboard
          </h1>
          <p className={`text-neutral-600 ${isMobile ? 'text-sm' : ''}`}>
            Welcome back! Here's what's happening at Lotus Fitness Center.
          </p>
        </div>
        
        <Button
          variant="primary"
          size={isMobile ? 'sm' : 'md'}
          icon={<HiSparkles className="h-5 w-5" />}
          onClick={() => alert('Coming soon!')}
          className={isMobile ? 'w-full' : ''}
        >
          {isMobile ? 'Report' : 'Generate Report'}
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={fadeInUp}
        className={`grid ${statsGrid.gridCols} gap-4 md:gap-6`}
      >
        <StatCard
          title="Total Members"
          value={stats.totalMembers}
          icon={HiUsers}
          color="red"
          change={{
            value: 12,
            type: 'increase',
            period: 'last month',
          }}
        />
        
        <StatCard
          title="Active Classes"
          value={stats.totalClasses}
          icon={HiAcademicCap}
          color="blue"
          change={{
            value: 5,
            type: 'increase',
            period: 'last month',
          }}
        />
        
        <StatCard
          title="Available Seats"
          value={stats.availableSeats}
          icon={HiChartBarSquare}
          color="green"
        />
        
        <StatCard
          title="Unassigned Members"
          value={stats.unassignedUsers}
          icon={HiUserPlus}
          color="yellow"
        />
      </motion.div>

      {/* Analytics Cards */}
      <motion.div 
        variants={fadeInUp}
        className={`grid ${analyticsGrid.gridCols} gap-4 md:gap-6`}
      >
        {/* Class Utilization */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              Class Utilization
            </h3>
            <div className="flex items-center gap-2">
              <HiArrowTrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-600">
                {stats.classUtilization}%
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Overall capacity usage</span>
              <span className="font-medium text-neutral-900">{stats.classUtilization}%</span>
            </div>
            
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.classUtilization}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full"
              />
            </div>
            
            <p className="text-xs text-neutral-500">
              Average class size: {stats.averageClassSize} members
            </p>
          </div>
        </Card>

        {/* Membership Distribution */}
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Membership Types
          </h3>
          
          <div className="space-y-3">
            {Object.entries(stats.membershipDistribution).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    type === 'VIP' ? 'bg-green-500' :
                    type === 'Premium' ? 'bg-red-500' : 'bg-neutral-400'
                  }`} />
                  <span className="text-sm text-neutral-600">{type}</span>
                </div>
                <span className="font-medium text-neutral-900">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Popular Instructors */}
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Top Instructors
          </h3>
          
          <div className="space-y-3">
            {stats.popularInstructors.slice(0, 3).map((instructor, index) => (
              <div key={instructor.instructor} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-neutral-100 text-neutral-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    #{index + 1}
                  </div>
                  <span className="text-sm text-neutral-900">{instructor.instructor}</span>
                </div>
                <span className="text-sm font-medium text-neutral-600">
                  {instructor.classCount} classes
                </span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Recent Members */}
      <motion.div variants={fadeInUp}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">Recent Members</h2>
            <p className="text-neutral-600 text-sm">Latest members who joined the gym</p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/managemembers'}
          >
            View All
          </Button>
        </div>

        <div className={`flex gap-4 overflow-x-auto pb-4 ${isMobile ? 'gap-3' : 'gap-4'}`}>
          {stats.recentMembers.map((member) => (
            <MemberCard 
              key={member.id} 
              member={member} 
              compact 
              className={isMobile ? 'min-w-[250px]' : 'min-w-[300px]'}
            />
          ))}
          
          {stats.recentMembers.length === 0 && (
            <Card padding="lg" className={isMobile ? 'min-w-[250px]' : 'min-w-[300px]'}>
              <div className="text-center py-8">
                <HiUsers className={`mx-auto mb-3 text-neutral-300 ${isMobile ? 'h-8 w-8' : 'h-12 w-12'}`} />
                <p className={`text-neutral-500 ${isMobile ? 'text-sm' : ''}`}>No recent members</p>
                <p className="text-xs text-neutral-400">Members will appear here when they join</p>
              </div>
            </Card>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}