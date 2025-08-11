import React from 'react';
import { motion } from 'framer-motion';
import { 
  HiArrowTrendingUp, 
  HiArrowTrendingDown, 
  HiClock, 
  HiChartBar,
  HiCalendarDays,
  HiBanknotes
} from 'react-icons/hi2';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { format, addDays, subDays, differenceInDays } from 'date-fns';
import { Card } from '../ui';
import { useMembers, useMembershipPlans } from '../../contexts/DatasetContext';

interface MembershipTrend {
  date: string;
  newMembers: number;
  renewals: number;
  expirations: number;
  netGrowth: number;
}

interface RevenueProjection {
  month: string;
  currentRevenue: number;
  projectedRevenue: number;
  renewalRisk: number;
}

export function MembershipAnalytics(): JSX.Element {
  const members = useMembers();
  const plans = useMembershipPlans();

  // Calculate membership trends over last 30 days
  const membershipTrends = React.useMemo(() => {
    const trends: MembershipTrend[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dateLabel = format(date, 'MMM dd');

      const newMembers = members.filter(m => 
        format(new Date(m.startDate), 'yyyy-MM-dd') === dateStr
      ).length;

      const renewals = members.filter(m => 
        m.renewalCount && m.renewalCount > 0 && 
        m.lastRenewalDate && format(new Date(m.lastRenewalDate), 'yyyy-MM-dd') === dateStr
      ).length;

      const expirations = members.filter(m => 
        format(new Date(m.endDate), 'yyyy-MM-dd') === dateStr && m.status === 'Expired'
      ).length;

      trends.push({
        date: dateLabel,
        newMembers,
        renewals,
        expirations,
        netGrowth: newMembers + renewals - expirations
      });
    }

    return trends;
  }, [members]);

  // Calculate revenue projections for next 6 months
  const revenueProjections = React.useMemo(() => {
    const projections: RevenueProjection[] = [];
    const today = new Date();

    for (let i = 0; i < 6; i++) {
      const monthStart = addDays(today, i * 30);
      const monthEnd = addDays(monthStart, 30);
      const monthLabel = format(monthStart, 'MMM yyyy');

      // Current active revenue
      const activeMembers = members.filter(m => 
        m.status === 'Active' && 
        new Date(m.endDate) > monthStart
      );

      const currentRevenue = activeMembers.reduce((sum, member) => {
        const plan = plans.find(p => p.id === member.membershipPlanId);
        return sum + (plan?.cost || 0);
      }, 0);

      // Members expiring this month (renewal risk)
      const expiringMembers = activeMembers.filter(m => {
        const endDate = new Date(m.endDate);
        return endDate >= monthStart && endDate <= monthEnd;
      });

      const renewalRisk = expiringMembers.reduce((sum, member) => {
        const plan = plans.find(p => p.id === member.membershipPlanId);
        return sum + (plan?.cost || 0);
      }, 0);

      // Projected revenue (assuming 80% renewal rate)
      const projectedRevenue = currentRevenue - (renewalRisk * 0.2);

      projections.push({
        month: monthLabel,
        currentRevenue,
        projectedRevenue,
        renewalRisk
      });
    }

    return projections;
  }, [members, plans]);

  // Calculate retention metrics
  const retentionMetrics = React.useMemo(() => {
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'Active').length;
    const expiredMembers = members.filter(m => m.status === 'Expired').length;
    const renewedMembers = members.filter(m => m.renewalCount && m.renewalCount > 0).length;

    const retentionRate = totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0;
    const renewalRate = totalMembers > 0 ? (renewedMembers / totalMembers) * 100 : 0;
    const churnRate = totalMembers > 0 ? (expiredMembers / totalMembers) * 100 : 0;

    return {
      retentionRate,
      renewalRate,
      churnRate,
      totalMembers,
      activeMembers,
      expiredMembers,
      renewedMembers
    };
  }, [members]);

  // Calculate average membership duration
  const avgMembershipDuration = React.useMemo(() => {
    const expiredMembers = members.filter(m => m.status === 'Expired');
    
    if (expiredMembers.length === 0) return 0;

    const totalDays = expiredMembers.reduce((sum, member) => {
      const startDate = new Date(member.startDate);
      const endDate = new Date(member.endDate);
      return sum + differenceInDays(endDate, startDate);
    }, 0);

    return Math.round(totalDays / expiredMembers.length);
  }, [members]);

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60">Retention Rate</p>
                <p className="text-2xl font-bold text-success">
                  {retentionMetrics.retentionRate.toFixed(1)}%
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                <HiArrowTrendingUp className="h-5 w-5 text-success" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60">Churn Rate</p>
                <p className="text-2xl font-bold text-error">
                  {retentionMetrics.churnRate.toFixed(1)}%
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center">
                <HiArrowTrendingDown className="h-5 w-5 text-error" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60">Avg Duration</p>
                <p className="text-2xl font-bold text-info">
                  {avgMembershipDuration} days
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-info/20 flex items-center justify-center">
                <HiClock className="h-5 w-5 text-info" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60">Renewal Rate</p>
                <p className="text-2xl font-bold text-warning">
                  {retentionMetrics.renewalRate.toFixed(1)}%
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                <HiCalendarDays className="h-5 w-5 text-warning" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Membership Trends Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <HiChartBar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-base-content">Membership Trends (30 Days)</h3>
                <p className="text-sm text-base-content/60">New members, renewals, and expirations</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span>New Members</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-info rounded-full"></div>
                <span>Renewals</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-error rounded-full"></div>
                <span>Expirations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span>Net Growth</span>
              </div>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={membershipTrends}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--b1))',
                  border: '1px solid hsl(var(--b3))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="newMembers" 
                stroke="#22c55e" 
                strokeWidth={2}
                name="New Members"
              />
              <Line 
                type="monotone" 
                dataKey="renewals" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Renewals"
              />
              <Line 
                type="monotone" 
                dataKey="expirations" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Expirations"
              />
              <Line 
                type="monotone" 
                dataKey="netGrowth" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                name="Net Growth"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Revenue Projections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
              <HiBanknotes className="h-5 w-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-base-content">Revenue Projections (6 Months)</h3>
              <p className="text-sm text-base-content/60">Current vs projected revenue with renewal risk</p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueProjections}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--b1))',
                  border: '1px solid hsl(var(--b3))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`£${value.toLocaleString()}`, '']}
              />
              <Bar dataKey="currentRevenue" fill="#22c55e" name="Current Revenue" />
              <Bar dataKey="projectedRevenue" fill="#3b82f6" name="Projected Revenue" />
              <Bar dataKey="renewalRisk" fill="#ef4444" name="Renewal Risk" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="flex items-center gap-4 text-sm mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span>Current Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span>Projected Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-error rounded-full"></div>
              <span>Renewal Risk</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}