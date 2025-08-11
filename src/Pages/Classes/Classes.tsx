import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiAcademicCap,
  HiPlus,
  HiMagnifyingGlass,
  HiUsers,
  HiClock,
  HiCalendarDays,
  HiViewColumns,
  HiChartBarSquare
} from 'react-icons/hi2';
import { useDataset, useDatasetDispatch } from '../../contexts/DatasetContext';
import { FitnessClass } from '../../types';
import { WeeklyCalendar } from '../../components/calendar/WeeklyCalendar';
import { StatCard } from '../../components/StatCard';
import { ClassCard } from '../../components/classes/ClassCard';
import { Card, Button, Input, Badge } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';
import { ClassScheduleModal } from '../../components/calendar/ClassScheduleModal';
import toast from 'react-hot-toast';
import { debounce } from 'lodash';

type ViewMode = 'calendar' | 'list';

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

export function Classes(): JSX.Element {
  const { classes, members, trainers } = useDataset();
  const dispatch = useDatasetDispatch();
  
  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Statistics
  const stats = useMemo(() => {
    const totalEnrolled = classes.reduce((sum, cls) => sum + (cls.enrolled?.length || 0), 0);
    const totalCapacity = classes.reduce((sum, cls) => sum + cls.capacity, 0);
    const utilizationRate = totalCapacity > 0 ? (totalEnrolled / totalCapacity) * 100 : 0;
    const activeTrainers = new Set(classes.map(cls => cls.trainerId)).size;

    return [
      {
        title: 'Total Classes',
        value: classes.length,
        icon: HiAcademicCap,
        color: 'blue' as const,
        change: { value: 12, type: 'increase' as const, period: 'last month' }
      },
      {
        title: 'Total Enrollment',
        value: totalEnrolled,
        icon: HiUsers,
        color: 'green' as const,
        change: { value: 8, type: 'increase' as const, period: 'last week' }
      },
      {
        title: 'Utilization Rate',
        value: `${utilizationRate.toFixed(1)}%`,
        icon: HiChartBarSquare,
        color: 'yellow' as const,
        change: { value: 5, type: 'increase' as const, period: 'last month' }
      },
      {
        title: 'Active Trainers',
        value: activeTrainers,
        icon: HiClock,
        color: 'gray' as const,
      }
    ];
  }, [classes]);

  // Get unique instructors for filtering
  const instructors = useMemo(() => {
    const uniqueInstructors = new Set(classes.map(cls => cls.instructor).filter(Boolean));
    return Array.from(uniqueInstructors).sort();
  }, [classes]);

  // Filter classes based on search and instructor
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cls.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (cls.schedule && cls.schedule.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesInstructor = !selectedInstructor || cls.instructor === selectedInstructor;
      
      return matchesSearch && matchesInstructor;
    });
  }, [classes, searchTerm, selectedInstructor]);

  const debouncedSearch = debounce((value: string) => {
    setSearchTerm(value);
  }, 300);

  const handleClassAdd = (classData: Omit<FitnessClass, 'id'>) => {
    dispatch({
      type: 'ADD_CLASS',
      payload: {
        ...classData,
        id: Date.now()
      }
    });
    toast.success('Class added successfully!');
  };

  const handleClassUpdate = (classData: FitnessClass) => {
    dispatch({
      type: 'UPDATE_CLASS',
      payload: classData
    });
    toast.success('Class updated successfully!');
  };

  const handleClassDelete = (classId: number) => {
    if (confirm('Are you sure you want to delete this class?')) {
      dispatch({
        type: 'DELETE_CLASS',
        payload: classId
      });
      toast.success('Class deleted successfully!');
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
            <h1 className="text-3xl font-bold text-base-content">Classes</h1>
            <p className="text-base-content/70">Manage fitness classes and schedules</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="btn-group">
              <Button
                variant={viewMode === 'calendar' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                icon={<HiCalendarDays className="h-4 w-4" />}
              >
                Calendar
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                icon={<HiViewColumns className="h-4 w-4" />}
              >
                List
              </Button>
            </div>
            
            <Button
              onClick={() => setShowAddModal(true)}
              icon={<HiPlus className="h-5 w-5" />}
              size="lg"
            >
              Add Class
            </Button>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </motion.div>

        {/* Calendar View */}
        <AnimatePresence mode="wait">
          {viewMode === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.4 }}
            >
              <WeeklyCalendar
                classes={filteredClasses}
                onClassAdd={handleClassAdd}
                onClassUpdate={handleClassUpdate}
                onClassDelete={handleClassDelete}
              />
            </motion.div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              {/* Filters */}
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search classes by name, instructor, or schedule..."
                      startIcon={<HiMagnifyingGlass className="h-5 w-5" />}
                      onChange={(e) => debouncedSearch(e.target.value)}
                    />
                  </div>
                  
                  <div className="sm:w-64">
                    <select
                      value={selectedInstructor}
                      onChange={(e) => setSelectedInstructor(e.target.value)}
                      className="select select-bordered w-full"
                    >
                      <option value="">All Instructors</option>
                      {instructors.map(instructor => (
                        <option key={instructor} value={instructor}>
                          {instructor}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Filter Summary */}
                <div className="mt-4 flex items-center gap-4 text-sm text-base-content/60">
                  <span>
                    Showing {filteredClasses.length} of {classes.length} classes
                  </span>
                  {searchTerm && (
                    <Badge variant="outline">
                      Search: {searchTerm}
                    </Badge>
                  )}
                  {selectedInstructor && (
                    <Badge variant="outline">
                      Instructor: {selectedInstructor}
                    </Badge>
                  )}
                </div>
              </Card>

              {/* Classes Grid */}
              {filteredClasses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredClasses.map((fitnessClass, index) => (
                    <motion.div
                      key={fitnessClass.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                    >
                      <ClassCard
                        fitnessClass={fitnessClass}
                        members={members}
                        onUpdate={handleClassUpdate}
                        onDelete={() => handleClassDelete(fitnessClass.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <HiAcademicCap className="h-16 w-16 text-base-content/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-base-content mb-2">
                    {searchTerm || selectedInstructor ? 'No classes found' : 'No classes yet'}
                  </h3>
                  <p className="text-base-content/60">
                    {searchTerm || selectedInstructor 
                      ? 'Try adjusting your search or filters' 
                      : 'Get started by adding your first class'
                    }
                  </p>
                  {!searchTerm && !selectedInstructor && (
                    <Button
                      onClick={() => setShowAddModal(true)}
                      icon={<HiPlus className="h-5 w-5" />}
                      className="mt-4"
                    >
                      Add First Class
                    </Button>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Class Modal */}
        <ClassScheduleModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleClassAdd}
        />
      </div>
    </motion.div>
  );
}