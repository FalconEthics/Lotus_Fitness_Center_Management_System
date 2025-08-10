import { useMemo } from 'react';
import { sumBy, differenceWith, take, sortBy, groupBy, meanBy } from 'lodash';
import { Member, FitnessClass } from '../types';

interface DashboardStats {
  totalMembers: number;
  totalClasses: number;
  availableSeats: number;
  unassignedUsers: number;
  recentMembers: Member[];
  membershipDistribution: Record<string, number>;
  averageClassSize: number;
  classUtilization: number;
  popularInstructors: Array<{ instructor: string; classCount: number }>;
}

export function useDashboardStats(members: Member[], classes: FitnessClass[]): DashboardStats {
  return useMemo(() => {
    // Basic stats
    const totalMembers = members.length;
    const totalClasses = classes.length;
    
    // Available seats calculation using Lodash sumBy
    const availableSeats = sumBy(classes, cls => Math.max(0, cls.capacity - cls.enrolled.length));
    
    // Unassigned users using Lodash differenceWith
    const enrolledMemberIds = classes.flatMap(cls => cls.enrolled);
    const unassignedUsers = differenceWith(
      members,
      enrolledMemberIds,
      (member, enrolledId) => member.id === enrolledId
    ).length;
    
    // Recent members (sorted by join date, take 7)
    const recentMembers = take(
      sortBy(members, member => new Date(member.startDate)).reverse(),
      7
    );
    
    // Membership distribution using Lodash groupBy
    const membershipGroups = groupBy(members, 'membershipType');
    const membershipDistribution = Object.entries(membershipGroups).reduce(
      (acc, [type, membersList]) => {
        acc[type] = membersList.length;
        return acc;
      },
      {} as Record<string, number>
    );
    
    // Average class size using Lodash meanBy
    const averageClassSize = Math.round(meanBy(classes, cls => cls.enrolled.length) || 0);
    
    // Overall class utilization percentage
    const totalCapacity = sumBy(classes, 'capacity');
    const totalEnrolled = sumBy(classes, cls => cls.enrolled.length);
    const classUtilization = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;
    
    // Popular instructors using Lodash groupBy
    const instructorGroups = groupBy(classes, 'instructor');
    const popularInstructors = Object.entries(instructorGroups)
      .map(([instructor, classesList]) => ({
        instructor,
        classCount: classesList.length
      }))
      .sort((a, b) => b.classCount - a.classCount)
      .slice(0, 5); // Top 5 instructors
    
    return {
      totalMembers,
      totalClasses,
      availableSeats,
      unassignedUsers,
      recentMembers,
      membershipDistribution,
      averageClassSize,
      classUtilization,
      popularInstructors,
    };
  }, [members, classes]);
}