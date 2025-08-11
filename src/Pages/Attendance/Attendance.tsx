import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiClipboardDocumentCheck,
  HiPlus,
  HiMagnifyingGlass,
  HiUsers,
  HiCalendarDays,
  HiChartBarSquare,
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiEye
} from 'react-icons/hi2';
import { useDataset, useDatasetDispatch } from '../../contexts/DatasetContext';
import { AttendanceRecord, Member, FitnessClass } from '../../types';
import { StatCard } from '../../components/StatCard';
import { AttendanceCard } from '../../components/attendance/AttendanceCard';
import { AttendanceModal } from '../../components/attendance/AttendanceModal';
import { AttendanceStats } from '../../components/attendance/AttendanceStats';
import { Card, Button, Input, Badge } from '../../components/ui';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { debounce } from 'lodash';
import toast from 'react-hot-toast';

type ViewPeriod = 'today' | 'week' | 'month';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

export function Attendance(): JSX.Element {
  const { attendanceRecords, members, classes } = useDataset();
  const dispatch = useDatasetDispatch();
  
  // UI state
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Get date range based on view period
  const dateRange = useMemo(() => {
    const today = new Date();
    const selectedDateObj = parseISO(selectedDate);
    
    switch (viewPeriod) {
      case 'today':
        return {
          start: selectedDateObj,
          end: selectedDateObj
        };
      case 'week':
        return {
          start: startOfWeek(selectedDateObj, { weekStartsOn: 1 }),
          end: endOfWeek(selectedDateObj, { weekStartsOn: 1 })
        };
      case 'month':
        return {
          start: startOfMonth(selectedDateObj),
          end: endOfMonth(selectedDateObj)
        };
      default:
        return { start: today, end: today };
    }
  }, [viewPeriod, selectedDate]);

  // Filter attendance records
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter(record => {
      const recordDate = parseISO(record.date);
      const member = members.find(m => m.id === record.memberId);
      const fitnessClass = classes.find(c => c.id === record.classId);
      
      // Date filter
      const inDateRange = isWithinInterval(recordDate, dateRange);
      
      // Search filter
      const matchesSearch = !searchTerm || (
        member?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fitnessClass?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Class filter
      const matchesClass = !selectedClass || record.classId.toString() === selectedClass;
      
      return inDateRange && matchesSearch && matchesClass;
    });
  }, [attendanceRecords, dateRange, searchTerm, selectedClass, members, classes]);

  // Statistics
  const stats = useMemo(() => {
    const totalAttendance = filteredRecords.length;
    const presentCount = filteredRecords.filter(r => r.status === 'present').length;
    const absentCount = filteredRecords.filter(r => r.status === 'absent').length;
    const lateCount = filteredRecords.filter(r => r.status === 'late').length;
    
    const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;
    const uniqueMembers = new Set(filteredRecords.map(r => r.memberId)).size;

    return [
      {
        title: 'Total Check-ins',
        value: totalAttendance,
        icon: HiClipboardDocumentCheck,
        color: 'blue' as const,
        change: { value: 12, type: 'increase' as const, period: 'vs yesterday' }
      },
      {
        title: 'Attendance Rate',
        value: `${attendanceRate.toFixed(1)}%`,
        icon: HiCheckCircle,
        color: 'green' as const,
        change: { value: 5, type: 'increase' as const, period: 'vs last period' }
      },
      {
        title: 'Active Members',
        value: uniqueMembers,
        icon: HiUsers,
        color: 'yellow' as const,
        change: { value: 8, type: 'increase' as const, period: 'this period' }
      },
      {
        title: 'Late Arrivals',
        value: lateCount,
        icon: HiClock,
        color: 'gray' as const,
      }
    ];
  }, [filteredRecords]);

  // Get unique classes for filtering
  const classOptions = useMemo(() => {
    const classIds = new Set(attendanceRecords.map(r => r.classId));
    return classes.filter(c => classIds.has(c.id));
  }, [classes, attendanceRecords]);

  const debouncedSearch = debounce((value: string) => {
    setSearchTerm(value);
  }, 300);

  const handleMarkAttendance = (attendanceData: Omit<AttendanceRecord, 'id'>) => {
    dispatch({
      type: 'ADD_ATTENDANCE',
      payload: {
        ...attendanceData,
        id: Date.now()
      }
    });
    toast.success('Attendance marked successfully!');
  };

  const handleUpdateAttendance = (record: AttendanceRecord) => {
    dispatch({
      type: 'UPDATE_ATTENDANCE',
      payload: record
    });
    toast.success('Attendance updated successfully!');
  };

  const handleDeleteAttendance = (recordId: number) => {
    if (confirm('Are you sure you want to delete this attendance record?')) {
      dispatch({
        type: 'DELETE_ATTENDANCE',
        payload: recordId
      });
      toast.success('Attendance record deleted successfully!');
    }
  };

  const getPeriodLabel = () => {
    switch (viewPeriod) {
      case 'today':
        return format(parseISO(selectedDate), 'MMMM d, yyyy');
      case 'week':
        return `Week of ${format(dateRange.start, 'MMM d')} - ${format(dateRange.end, 'MMM d, yyyy')}`;
      case 'month':
        return format(parseISO(selectedDate), 'MMMM yyyy');
      default:
        return '';
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-base-100 p-6"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-base-content">Attendance Tracking</h1>
            <p className="text-base-content/70">Monitor member attendance and participation</p>
          </div>
          
          <Button
            onClick={() => setShowAddModal(true)}
            icon={<HiPlus className="h-5 w-5" />}
            size="lg"
          >
            Mark Attendance
          </Button>
        </motion.div>

        {/* Period Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="btn-group">
                  <Button
                    variant={viewPeriod === 'today' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setViewPeriod('today')}
                  >
                    Today
                  </Button>
                  <Button
                    variant={viewPeriod === 'week' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setViewPeriod('week')}
                  >
                    Week
                  </Button>
                  <Button
                    variant={viewPeriod === 'month' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setViewPeriod('month')}
                  >
                    Month
                  </Button>
                </div>
                
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-auto"
                />
              </div>
              
              <div className="text-lg font-semibold text-base-content">
                {getPeriodLabel()}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </motion.div>

        {/* Attendance Stats Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AttendanceStats
            records={filteredRecords}
            members={members}
            classes={classes}
            dateRange={dateRange}
          />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by member name or class..."
                  startIcon={<HiMagnifyingGlass className="h-5 w-5" />}
                  onChange={(e) => debouncedSearch(e.target.value)}
                />
              </div>
              
              <div className="sm:w-64">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option value="">All Classes</option>
                  {classOptions.map(cls => (
                    <option key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Summary */}
            <div className="mt-4 flex items-center gap-4 text-sm text-base-content/60">
              <span>
                Showing {filteredRecords.length} attendance records
              </span>
              {searchTerm && (
                <Badge variant="outline">
                  Search: {searchTerm}
                </Badge>
              )}
              {selectedClass && (
                <Badge variant="outline">
                  Class: {classOptions.find(c => c.id.toString() === selectedClass)?.name}
                </Badge>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Attendance Records */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {filteredRecords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecords.map((record, index) => {
                const member = members.find(m => m.id === record.memberId);
                const fitnessClass = classes.find(c => c.id === record.classId);
                
                return (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                  >
                    <AttendanceCard
                      record={record}
                      member={member}
                      fitnessClass={fitnessClass}
                      onUpdate={handleUpdateAttendance}
                      onDelete={() => handleDeleteAttendance(record.id)}
                    />
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <HiClipboardDocumentCheck className="h-16 w-16 text-base-content/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-base-content mb-2">
                {searchTerm || selectedClass ? 'No attendance records found' : 'No attendance records yet'}
              </h3>
              <p className="text-base-content/60">
                {searchTerm || selectedClass 
                  ? 'Try adjusting your search or filters' 
                  : 'Start marking attendance for classes'
                }
              </p>
              {!searchTerm && !selectedClass && (
                <Button
                  onClick={() => setShowAddModal(true)}
                  icon={<HiPlus className="h-5 w-5" />}
                  className="mt-4"
                >
                  Mark First Attendance
                </Button>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Add Attendance Modal */}
        <AttendanceModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleMarkAttendance}
          members={members}
          classes={classes}
        />
      </div>
    </motion.div>
  );
}