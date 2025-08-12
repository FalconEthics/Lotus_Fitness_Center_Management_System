import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui';
import { AttendanceRecord, Member, FitnessClass } from '../../types';
import { format, eachDayOfInterval, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface AttendanceStatsProps {
  records: AttendanceRecord[];
  members: Member[];
  classes: FitnessClass[];
  dateRange: { start: Date; end: Date };
}

const COLORS = {
  Present: '#10b981',
  Absent: '#ef4444', 
  Late: '#f59e0b'
};

const STATUS_COLORS = ['#10b981', '#ef4444', '#f59e0b'];

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({
  records,
  members,
  classes,
  dateRange
}) => {
  // Daily attendance data
  const dailyData = useMemo(() => {
    const days = eachDayOfInterval(dateRange);
    
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayRecords = records.filter(r => r.date === dayStr);
      
      return {
        date: format(day, 'MMM dd'),
        fullDate: dayStr,
        present: dayRecords.filter(r => r.status === 'Present').length,
        absent: dayRecords.filter(r => r.status === 'Absent').length,
        late: dayRecords.filter(r => r.status === 'Late').length,
        total: dayRecords.length
      };
    });
  }, [records, dateRange]);

  // Status distribution data
  const statusData = useMemo(() => {
    const statusCounts = records.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      percentage: ((count / records.length) * 100).toFixed(1)
    }));
  }, [records]);

  // Class popularity data
  const classData = useMemo(() => {
    const classAttendance = records.reduce((acc, record) => {
      const className = classes.find(c => c.id === record.classId)?.name || 'Unknown';
      if (!acc[className]) {
        acc[className] = { present: 0, total: 0 };
      }
      acc[className].total++;
      if (record.status === 'Present') {
        acc[className].present++;
      }
      return acc;
    }, {} as Record<string, { present: number; total: number }>);

    return Object.entries(classAttendance)
      .map(([name, data]) => ({
        name,
        attendance: data.present,
        rate: ((data.present / data.total) * 100).toFixed(1),
        total: data.total
      }))
      .sort((a, b) => b.attendance - a.attendance)
      .slice(0, 6); // Top 6 classes
  }, [records, classes]);

  // Member attendance leaders
  const memberLeaders = useMemo(() => {
    const memberAttendance = records.reduce((acc, record) => {
      if (record.status === 'Present') {
        acc[record.memberId] = (acc[record.memberId] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(memberAttendance)
      .map(([memberId, count]) => {
        const member = members.find(m => m.id === parseInt(memberId));
        return {
          name: member?.name || 'Unknown',
          attendance: count,
          membershipType: member?.membershipType || 'Unknown'
        };
      })
      .sort((a, b) => b.attendance - a.attendance)
      .slice(0, 5); // Top 5 members
  }, [records, members]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-base-100 border border-base-300 rounded-lg shadow-lg p-3">
          <p className="font-medium text-base-content">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (records.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-lg font-semibold text-base-content mb-2">
          No Attendance Data
        </h3>
        <p className="text-base-content/60">
          No attendance records found for the selected period.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Attendance Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-base-content mb-4">
            Daily Attendance Trends
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="present" stackId="a" fill={COLORS.Present} name="Present" />
                <Bar dataKey="late" stackId="a" fill={COLORS.Late} name="Late" />
                <Bar dataKey="absent" stackId="a" fill={COLORS.Absent} name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Status Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-base-content mb-4">
            Status Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Class Popularity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-base-content mb-4">
            Most Popular Classes
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="attendance" fill="#3b82f6" name="Attendance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Top Members */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-base-content mb-4">
            Attendance Leaders
          </h3>
          <div className="space-y-3">
            {memberLeaders.map((member, index) => (
              <div key={member.name} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      #{index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-base-content">{member.name}</p>
                    <p className="text-sm text-base-content/60">{member.membershipType}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{member.attendance}</p>
                  <p className="text-xs text-base-content/60">sessions</p>
                </div>
              </div>
            ))}
            {memberLeaders.length === 0 && (
              <p className="text-center text-base-content/60 py-8">
                No attendance data available
              </p>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};