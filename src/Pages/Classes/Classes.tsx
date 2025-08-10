import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiAcademicCap,
  HiPlus,
  HiMagnifyingGlass,
  HiUsers,
  HiUser,
  HiClock,
  HiHashtag
} from 'react-icons/hi2';
import { useClasses, useMembers, useDatasetDispatch, datasetActions } from '../../contexts/DatasetContext';
import { FitnessClass } from '../../types';
import { ValidationUtils, DataUtils } from '../../utils/lodashHelpers';
import { ClassCard } from '../../components/classes/ClassCard';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { fadeInUp, staggerChildren, pageVariants } from '../../theme';

export function Classes(): JSX.Element {
  const dispatch = useDatasetDispatch();
  const classes = useClasses();
  const members = useMembers();

  // Form state for adding new classes
  const [newClass, setNewClass] = useState<Omit<FitnessClass, 'id' | 'enrolled'>>({
    name: '', 
    instructor: '', 
    schedule: '', 
    capacity: 20
  });
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filtered classes based on search
  const filteredClasses = classes.filter(fitnessClass => 
    fitnessClass.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fitnessClass.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fitnessClass.schedule.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: classes.length,
    totalCapacity: classes.reduce((sum, cls) => sum + cls.capacity, 0),
    totalEnrolled: classes.reduce((sum, cls) => sum + cls.enrolled.length, 0),
    averageUtilization: classes.length > 0 
      ? Math.round((classes.reduce((sum, cls) => sum + (cls.enrolled.length / cls.capacity) * 100, 0) / classes.length))
      : 0
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!newClass.name.trim()) newErrors.name = 'Class name is required';
    if (!newClass.instructor.trim()) newErrors.instructor = 'Instructor is required';
    if (!newClass.schedule.trim()) newErrors.schedule = 'Schedule is required';
    if (!newClass.capacity || newClass.capacity <= 0) {
      newErrors.capacity = 'Capacity must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddClass = (): void => {
    if (validate()) {
      dispatch(datasetActions.addClass({...newClass, id: Date.now(), enrolled: []}));
      setNewClass({name: '', instructor: '', schedule: '', capacity: 20});
      setShowAddForm(false);
      setErrors({});
    }
  };

  const handleUpdateClass = (fitnessClass: FitnessClass): void => {
    dispatch(datasetActions.updateClass(fitnessClass));
  };

  const handleDeleteClass = (id: number): void => {
    dispatch(datasetActions.deleteClass(id));
  };

  const handleAddMemberToClass = (classId: number, memberId: number): void => {
    const targetClass = DataUtils.findClassById(classes, classId);
    
    if (!targetClass) return;
    
    if (targetClass.enrolled.length >= targetClass.capacity) {
      alert('Class is full');
      return;
    }
    
    const newEnrolled = [...targetClass.enrolled, memberId];
    dispatch(datasetActions.updateClass({...targetClass, enrolled: newEnrolled}));
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      className="min-h-screen bg-neutral-50 p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={fadeInUp} className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <HiAcademicCap className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">Classes</h1>
                <p className="text-neutral-600">Manage fitness classes and schedules</p>
              </div>
            </div>
            <Button onClick={() => setShowAddForm(true)} className="gap-2">
              <HiPlus className="h-4 w-4" />
              Add Class
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          variants={staggerChildren}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            { label: 'Total Classes', value: stats.total, icon: HiAcademicCap, color: 'bg-blue-500' },
            { label: 'Total Enrolled', value: stats.totalEnrolled, icon: HiUsers, color: 'bg-red-500' },
            { label: 'Total Capacity', value: stats.totalCapacity, icon: HiHashtag, color: 'bg-green-500' },
            { label: 'Avg. Utilization', value: `${stats.averageUtilization}%`, icon: HiUser, color: 'bg-yellow-500' },
          ].map((stat, index) => (
            <motion.div key={index} variants={fadeInUp}>
              <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
                <CardContent className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                    <p className="text-sm text-neutral-600">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div variants={fadeInUp} className="mb-8">
          <Card>
            <CardContent className="p-6">
              <Input
                placeholder="Search classes by name, instructor, or schedule..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startIcon={<HiMagnifyingGlass className="h-4 w-4" />}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Add Class Form Modal */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowAddForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl"
              >
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <HiPlus className="h-5 w-5" />
                      Add New Class
                    </h2>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Class Name"
                        value={newClass.name}
                        onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                        startIcon={<HiAcademicCap className="h-4 w-4" />}
                        error={errors.name}
                        required
                      />
                      <Input
                        label="Instructor"
                        value={newClass.instructor}
                        onChange={(e) => setNewClass({ ...newClass, instructor: e.target.value })}
                        startIcon={<HiUser className="h-4 w-4" />}
                        error={errors.instructor}
                        required
                      />
                      <Input
                        label="Schedule"
                        value={newClass.schedule}
                        onChange={(e) => setNewClass({ ...newClass, schedule: e.target.value })}
                        startIcon={<HiClock className="h-4 w-4" />}
                        error={errors.schedule}
                        required
                        className="md:col-span-2"
                        placeholder="e.g., Mon, Wed, Fri 9:00 AM - 10:00 AM"
                      />
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Capacity: {newClass.capacity} members
                          {errors.capacity && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="50"
                          value={newClass.capacity}
                          onChange={(e) => setNewClass({ ...newClass, capacity: parseInt(e.target.value) })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex justify-between text-sm text-neutral-500 mt-1">
                          <span>1</span>
                          <span>50</span>
                        </div>
                        {errors.capacity && (
                          <p className="text-xs text-red-500 mt-1">{errors.capacity}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleAddClass} className="flex-1">
                        Add Class
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAddForm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Classes Grid */}
        <motion.div
          variants={staggerChildren}
          initial="initial"
          animate="animate"
          className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3"
        >
          <AnimatePresence>
            {filteredClasses.map(fitnessClass => (
              <ClassCard
                key={fitnessClass.id}
                fitnessClass={fitnessClass}
                members={members}
                onUpdate={handleUpdateClass}
                onDelete={handleDeleteClass}
                onAddMember={handleAddMemberToClass}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredClasses.length === 0 && (
          <motion.div
            variants={fadeInUp}
            className="text-center py-12"
          >
            <HiAcademicCap className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              {searchTerm ? 'No classes found' : 'No classes yet'}
            </h3>
            <p className="text-neutral-600">
              {searchTerm 
                ? 'Try adjusting your search criteria.'
                : 'Add your first class to get started.'
              }
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}