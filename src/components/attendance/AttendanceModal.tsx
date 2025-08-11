import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiCheckCircle, HiXCircle, HiClock, HiMagnifyingGlass } from 'react-icons/hi2';
import { Modal } from '../ui/Modal';
import { Button, Input, Badge } from '../ui';
import { AttendanceRecord, Member, FitnessClass } from '../../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (attendance: Omit<AttendanceRecord, 'id'>) => void;
  members: Member[];
  classes: FitnessClass[];
  defaultClassId?: number;
  defaultDate?: string;
}

const STATUS_OPTIONS = [
  {
    value: 'present' as const,
    label: 'Present',
    icon: HiCheckCircle,
    color: 'success' as const,
    description: 'Member attended the class'
  },
  {
    value: 'absent' as const,
    label: 'Absent',
    icon: HiXCircle,
    color: 'error' as const,
    description: 'Member did not attend'
  },
  {
    value: 'late' as const,
    label: 'Late',
    icon: HiClock,
    color: 'warning' as const,
    description: 'Member arrived late'
  }
];

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  members,
  classes,
  defaultClassId,
  defaultDate
}) => {
  const [formData, setFormData] = useState({
    date: defaultDate || format(new Date(), 'yyyy-MM-dd'),
    classId: defaultClassId || 0,
    memberId: 0,
    status: 'present' as AttendanceRecord['status'],
    checkInTime: format(new Date(), 'HH:mm'),
    notes: ''
  });

  const [memberSearch, setMemberSearch] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

  // Filter active members based on search
  const filteredMembers = useMemo(() => {
    return members.filter(member => 
      member.status === 'active' &&
      (member.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
       member.email.toLowerCase().includes(memberSearch.toLowerCase()))
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [members, memberSearch]);

  // Get enrolled members for selected class
  const enrolledMembers = useMemo(() => {
    if (!formData.classId) return [];
    
    const selectedClass = classes.find(c => c.id === formData.classId);
    if (!selectedClass || !selectedClass.enrolled) return [];
    
    return members.filter(m => selectedClass.enrolled.includes(m.id));
  }, [formData.classId, classes, members]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (bulkMode) {
      // Submit attendance for multiple members
      if (selectedMembers.length === 0) {
        toast.error('Please select at least one member');
        return;
      }
      
      if (!formData.classId) {
        toast.error('Please select a class');
        return;
      }
      
      // Submit each selected member
      selectedMembers.forEach(memberId => {
        onSubmit({
          date: formData.date,
          classId: formData.classId,
          memberId,
          status: formData.status,
          checkInTime: formData.checkInTime,
          notes: formData.notes
        });
      });
      
      toast.success(`Attendance marked for ${selectedMembers.length} members`);
    } else {
      // Single member submission
      if (!formData.memberId) {
        toast.error('Please select a member');
        return;
      }
      
      if (!formData.classId) {
        toast.error('Please select a class');
        return;
      }
      
      onSubmit(formData);
    }
    
    // Reset form and close
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      classId: 0,
      memberId: 0,
      status: 'present',
      checkInTime: format(new Date(), 'HH:mm'),
      notes: ''
    });
    setSelectedMembers([]);
    setBulkMode(false);
    setMemberSearch('');
    onClose();
  };

  const toggleMemberSelection = (memberId: number) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const selectAllEnrolled = () => {
    setSelectedMembers(enrolledMembers.map(m => m.id));
  };

  const clearSelection = () => {
    setSelectedMembers([]);
  };

  const selectedClass = classes.find(c => c.id === formData.classId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mark Attendance"
      size="xl"
    >
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Mode Toggle */}
        <div className="flex items-center gap-4">
          <div className="btn-group">
            <Button
              type="button"
              variant={!bulkMode ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setBulkMode(false)}
            >
              Single Member
            </Button>
            <Button
              type="button"
              variant={bulkMode ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setBulkMode(true)}
            >
              Bulk Entry
            </Button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            required
          />
          
          <Input
            label="Check-in Time"
            type="time"
            value={formData.checkInTime}
            onChange={(e) => setFormData(prev => ({ ...prev, checkInTime: e.target.value }))}
            required
          />
        </div>

        {/* Class Selection */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-base-content">
            Class <span className="text-error ml-1">*</span>
          </label>
          <select
            value={formData.classId}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              classId: parseInt(e.target.value),
              memberId: 0 // Reset member selection when class changes
            }))}
            className="select select-bordered w-full"
            required
          >
            <option value={0}>Select a class...</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name} - {cls.schedule} ({cls.enrolled?.length || 0} enrolled)
              </option>
            ))}
          </select>
          
          {selectedClass && (
            <p className="text-sm text-base-content/60 mt-1">
              Capacity: {selectedClass.enrolled?.length || 0}/{selectedClass.capacity}
            </p>
          )}
        </div>

        {/* Status Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-base-content">
            Attendance Status
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {STATUS_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <label
                  key={option.value}
                  className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                    formData.status === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-base-300 hover:border-base-content/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={formData.status === option.value}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      status: e.target.value as AttendanceRecord['status'] 
                    }))}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 text-${option.color}`} />
                    <div>
                      <p className="font-medium text-base-content">{option.label}</p>
                      <p className="text-sm text-base-content/60">{option.description}</p>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Member Selection */}
        {!bulkMode ? (
          /* Single Member Selection */
          <div className="space-y-1">
            <label className="block text-sm font-medium text-base-content">
              Member <span className="text-error ml-1">*</span>
            </label>
            <select
              value={formData.memberId}
              onChange={(e) => setFormData(prev => ({ ...prev, memberId: parseInt(e.target.value) }))}
              className="select select-bordered w-full"
              required
            >
              <option value={0}>Select a member...</option>
              {(formData.classId ? enrolledMembers : filteredMembers).map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.membershipType}
                </option>
              ))}
            </select>
            
            {formData.classId && enrolledMembers.length === 0 && (
              <p className="text-sm text-warning mt-1">
                No members enrolled in this class
              </p>
            )}
          </div>
        ) : (
          /* Bulk Member Selection */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-base-content">
                Select Members ({selectedMembers.length} selected)
              </label>
              
              {enrolledMembers.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllEnrolled}
                  >
                    Select All Enrolled
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>
            
            <Input
              placeholder="Search members..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              startIcon={<HiMagnifyingGlass className="h-4 w-4" />}
            />
            
            <div className="max-h-64 overflow-y-auto border border-base-300 rounded-lg">
              {(formData.classId ? enrolledMembers : filteredMembers).map(member => (
                <label
                  key={member.id}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-base-200 border-b border-base-300 last:border-b-0 ${
                    selectedMembers.includes(member.id) ? 'bg-primary/5' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => toggleMemberSelection(member.id)}
                    className="checkbox checkbox-primary"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-base-content">{member.name}</p>
                    <p className="text-sm text-base-content/60">
                      {member.membershipType} • {member.email}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedMembers.map(memberId => {
                  const member = members.find(m => m.id === memberId);
                  return member ? (
                    <Badge key={memberId} variant="primary">
                      {member.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-base-content">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="textarea textarea-bordered w-full"
            placeholder="Additional notes about attendance..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-base-300">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            {bulkMode ? 
              `Mark Attendance (${selectedMembers.length})` : 
              'Mark Attendance'
            }
          </Button>
        </div>
      </motion.form>
    </Modal>
  );
};