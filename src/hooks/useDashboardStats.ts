import { useMemo } from 'react';
import { format, isAfter, isBefore, addDays, startOfDay, endOfDay } from 'date-fns';
import { 
  useMembers, 
  useClasses, 
  useTrainers, 
  useAttendance, 
  useMembershipPlans 
} from '../contexts/DatasetContext';
import { DashboardStats, ChartDataPoint, Member } from '../types';

export function useDashboardStats(): DashboardStats & {
  membershipDistribution: ChartDataPoint[];
  attendanceTrend: ChartDataPoint[];
  classPopularity: ChartDataPoint[];
  revenueByPlan: ChartDataPoint[];
} {
  const members = useMembers();
  const classes = useClasses();
  const trainers = useTrainers();
  const attendance = useAttendance();
  const membershipPlans = useMembershipPlans();

  return useMemo(() => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    // Basic stats
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'Active').length;
    
    // Members expiring in next 7 days
    const next7Days = format(addDays(today, 7), 'yyyy-MM-dd');
    const expiringMembers = members.filter(member => {
      const endDate = new Date(member.endDate);
      return isAfter(endDate, today) && isBefore(endDate, addDays(today, 7));
    }).length;

    const totalClasses = classes.length;
    const totalTrainers = trainers.filter(t => t.isActive).length;
    
    // Today's attendance
    const todayAttendance = attendance.filter(a => a.date === todayStr).length;

    // Membership distribution for pie chart
    const membershipDistribution: ChartDataPoint[] = membershipPlans.map(plan => {
      const count = members.filter(m => m.membershipPlanId === plan.id).length;
      return {
        name: plan.name,
        value: count,
        fill: getColorForPlan(plan.id),
      };
    }).filter(item => item.value > 0);

    // Attendance trend for last 7 days
    const attendanceTrend: ChartDataPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = format(addDays(today, -i), 'yyyy-MM-dd');
      const dateLabel = format(addDays(today, -i), 'MMM dd');
      const attendanceCount = attendance.filter(a => a.date === date && a.status === 'Present').length;
      
      attendanceTrend.push({
        name: dateLabel,
        value: attendanceCount,
      });
    }

    // Class popularity (number of enrolled members)
    const classPopularity: ChartDataPoint[] = classes
      .map(cls => ({
        name: cls.name,
        value: cls.enrolled.length,
        fill: getColorForClass(cls.id),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 popular classes

    // Revenue by plan (estimated)
    const revenueByPlan: ChartDataPoint[] = membershipPlans.map(plan => {
      const memberCount = members.filter(m => m.membershipPlanId === plan.id && m.status === 'Active').length;
      const revenue = memberCount * plan.cost;
      
      return {
        name: plan.name,
        value: revenue,
        fill: getColorForPlan(plan.id),
      };
    }).filter(item => item.value > 0);

    return {
      totalMembers,
      activeMembers,
      expiringMembers,
      totalClasses,
      totalTrainers,
      todayAttendance,
      membershipDistribution,
      attendanceTrend,
      classPopularity,
      revenueByPlan,
    };
  }, [members, classes, trainers, attendance, membershipPlans]);
}

// Helper functions for chart colors
function getColorForPlan(planId: number): string {
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#d084d0'];
  return colors[planId % colors.length];
}

function getColorForClass(classId: number): string {
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#d084d0', '#8dd1e1', '#d084d0'];
  return colors[classId % colors.length];
}

// Additional utility hook for member statistics
export function useMemberStatistics() {
  const members = useMembers();
  const membershipPlans = useMembershipPlans();

  return useMemo(() => {
    // Age distribution
    const ageGroups = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '55+': 0,
    };

    members.forEach(member => {
      const age = member.age;
      if (age >= 18 && age <= 25) ageGroups['18-25']++;
      else if (age >= 26 && age <= 35) ageGroups['26-35']++;
      else if (age >= 36 && age <= 45) ageGroups['36-45']++;
      else if (age >= 46 && age <= 55) ageGroups['46-55']++;
      else if (age > 55) ageGroups['55+']++;
    });

    // Gender distribution
    const genderDistribution = {
      Male: members.filter(m => m.gender === 'Male').length,
      Female: members.filter(m => m.gender === 'Female').length,
      Other: members.filter(m => m.gender === 'Other').length,
    };

    // Status distribution
    const statusDistribution = {
      Active: members.filter(m => m.status === 'Active').length,
      Expired: members.filter(m => m.status === 'Expired').length,
      Trial: members.filter(m => m.status === 'Trial').length,
      Suspended: members.filter(m => m.status === 'Suspended').length,
    };

    return {
      ageGroups,
      genderDistribution,
      statusDistribution,
    };
  }, [members, membershipPlans]);
}