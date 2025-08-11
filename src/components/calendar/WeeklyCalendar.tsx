import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiChevronLeft, 
  HiChevronRight, 
  HiPlus,
  HiClock,
  HiUsers,
  HiUserGroup
} from 'react-icons/hi2';
import { Button, Badge } from '../ui';
import { FitnessClass, Trainer, Member } from '../../types';
import { format, startOfWeek, addDays, isSameDay, parseISO, addWeeks, subWeeks } from 'date-fns';
import { ClassScheduleModal } from './ClassScheduleModal';
import { useDataset } from '../../contexts/DatasetContext';

interface WeeklyCalendarProps {
  classes: FitnessClass[];
  onClassUpdate: (classData: FitnessClass) => void;
  onClassDelete: (classId: number) => void;
  onClassAdd: (classData: Omit<FitnessClass, 'id'>) => void;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 6); // 6 AM to 8 PM
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface ClassBlock {
  class: FitnessClass;
  startHour: number;
  duration: number;
  trainer?: Trainer;
  memberCount: number;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  classes,
  onClassUpdate,
  onClassDelete,
  onClassAdd
}) => {
  const { trainers, members } = useDataset();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState<FitnessClass | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    day: Date;
    hour: number;
  } | null>(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday start
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Parse and organize classes by day and time
  const classBlocks = useMemo(() => {
    const blocks: Record<string, ClassBlock[]> = {};
    
    weekDays.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      blocks[dayKey] = [];
      
      classes.forEach(classItem => {
        if (!classItem.schedule) return;
        
        // Parse schedule - expecting format like "Monday 10:00-11:00"
        const scheduleMatch = classItem.schedule.match(/(\w+)\s+(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
        if (!scheduleMatch) return;
        
        const [, dayName, startHour, startMinute, endHour, endMinute] = scheduleMatch;
        const classDay = dayName.toLowerCase();
        const currentDayName = format(day, 'EEEE').toLowerCase();
        
        if (classDay === currentDayName) {
          const startTime = parseInt(startHour) + parseInt(startMinute) / 60;
          const endTime = parseInt(endHour) + parseInt(endMinute) / 60;
          const duration = endTime - startTime;
          
          const trainer = trainers.find(t => t.id === classItem.trainerId);
          const memberCount = classItem.enrolled?.length || 0;
          
          blocks[dayKey].push({
            class: classItem,
            startHour: startTime,
            duration,
            trainer,
            memberCount
          });
        }
      });
      
      // Sort by start time
      blocks[dayKey].sort((a, b) => a.startHour - b.startHour);
    });
    
    return blocks;
  }, [classes, trainers, weekDays]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => 
      direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1)
    );
  };

  const handleTimeSlotClick = (day: Date, hour: number) => {
    setSelectedTimeSlot({ day, hour });
    setShowAddModal(true);
  };

  const handleClassClick = (classItem: FitnessClass) => {
    setSelectedClass(classItem);
  };

  const getClassPosition = (startHour: number, duration: number) => {
    const startIndex = HOURS.indexOf(Math.floor(startHour));
    const top = startIndex * 60 + (startHour % 1) * 60; // 60px per hour
    const height = duration * 60;
    return { top, height };
  };

  const getClassColor = (classItem: FitnessClass) => {
    const colors = [
      'bg-primary text-primary-content',
      'bg-secondary text-secondary-content',
      'bg-accent text-accent-content',
      'bg-success text-success-content',
      'bg-warning text-warning-content',
      'bg-info text-info-content'
    ];
    return colors[classItem.id % colors.length];
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-base-content">
            Week of {format(weekStart, 'MMM dd, yyyy')}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('prev')}
              icon={<HiChevronLeft className="h-4 w-4" />}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('next')}
              icon={<HiChevronRight className="h-4 w-4" />}
            />
          </div>
        </div>
        
        <Button
          onClick={() => setShowAddModal(true)}
          icon={<HiPlus className="h-5 w-5" />}
        >
          Add Class
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-base-100 rounded-lg border border-base-300 overflow-hidden">
        <div className="grid grid-cols-8 border-b border-base-300">
          {/* Time column header */}
          <div className="p-3 text-sm font-medium text-base-content/60 border-r border-base-300">
            Time
          </div>
          
          {/* Day headers */}
          {weekDays.map((day, index) => (
            <div
              key={day.toISOString()}
              className="p-3 text-center border-r border-base-300 last:border-r-0"
            >
              <div className="text-sm font-medium text-base-content">
                {DAYS[index]}
              </div>
              <div className={`text-lg font-semibold ${
                isSameDay(day, new Date()) ? 'text-primary' : 'text-base-content'
              }`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="relative">
          {/* Hour rows */}
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-base-300 last:border-b-0">
              {/* Time label */}
              <div className="p-2 text-xs text-base-content/60 border-r border-base-300 bg-base-50">
                {format(new Date().setHours(hour, 0), 'HH:mm')}
              </div>
              
              {/* Day cells */}
              {weekDays.map((day) => (
                <div
                  key={`${day.toISOString()}-${hour}`}
                  className="h-[60px] border-r border-base-300 last:border-r-0 relative hover:bg-base-200/50 cursor-pointer group"
                  onClick={() => handleTimeSlotClick(day, hour)}
                >
                  {/* Add class button on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <HiPlus className="h-4 w-4 text-base-content/40" />
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Class blocks overlay */}
          {weekDays.map((day, dayIndex) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayClasses = classBlocks[dayKey] || [];
            
            return dayClasses.map((block) => {
              const { top, height } = getClassPosition(block.startHour, block.duration);
              const leftOffset = 50 + (dayIndex * (100 / 7)); // Percentage based positioning
              
              return (
                <motion.div
                  key={`${block.class.id}-${dayKey}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02, zIndex: 10 }}
                  className={`absolute rounded-md shadow-sm cursor-pointer p-2 text-xs ${getClassColor(block.class)}`}
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    left: `${leftOffset}%`,
                    width: `calc(${100/7}% - 8px)`,
                    zIndex: 5
                  }}
                  onClick={() => handleClassClick(block.class)}
                >
                  <div className="font-semibold truncate">{block.class.name}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <HiClock className="h-3 w-3" />
                    <span>{block.class.schedule?.split(' ')[1]}</span>
                  </div>
                  {block.trainer && (
                    <div className="flex items-center gap-1 mt-1">
                      <HiUserGroup className="h-3 w-3" />
                      <span className="truncate">{block.trainer.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    <HiUsers className="h-3 w-3" />
                    <span>{block.memberCount}/{block.class.capacity}</span>
                  </div>
                </motion.div>
              );
            });
          })}
        </div>
      </div>

      {/* Class Details Modal */}
      <AnimatePresence>
        {selectedClass && (
          <ClassScheduleModal
            class={selectedClass}
            isOpen={!!selectedClass}
            onClose={() => setSelectedClass(null)}
            onUpdate={onClassUpdate}
            onDelete={() => {
              onClassDelete(selectedClass.id);
              setSelectedClass(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Add Class Modal */}
      <AnimatePresence>
        {showAddModal && (
          <ClassScheduleModal
            isOpen={showAddModal}
            onClose={() => {
              setShowAddModal(false);
              setSelectedTimeSlot(null);
            }}
            onAdd={onClassAdd}
            defaultTimeSlot={selectedTimeSlot}
          />
        )}
      </AnimatePresence>
    </div>
  );
};