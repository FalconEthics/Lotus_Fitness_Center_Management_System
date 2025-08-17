import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiTrash, HiUsers, HiClock, HiUserGroup } from 'react-icons/hi2';
import { Modal } from '../ui/Modal';
import { Button, Input, Badge } from '../ui';
import { FitnessClass, Trainer, Member } from '../../types';
import { useDataset } from '../../contexts/DatasetContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface ClassScheduleModalProps {
    class?: FitnessClass;
    editingClass?: FitnessClass;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: (classData: FitnessClass) => void;
    onDelete?: () => void;
    onAdd?: (classData: Omit<FitnessClass, 'id'>) => void;
    defaultTimeSlot?: {
        day: Date;
        hour: number;
    } | null;
}

const DAYS_OF_WEEK = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const CLASS_TYPES = [
    'Yoga', 'HIIT', 'Pilates', 'CrossFit', 'Cardio', 'Strength Training',
    'Zumba', 'Boxing', 'Spinning', 'Aerobics', 'Functional Training',
    'Dance Fitness', 'Martial Arts', 'Swimming', 'Personal Training'
];

export const ClassScheduleModal: React.FC<ClassScheduleModalProps> = ({
    class: classData,
    editingClass,
    isOpen,
    onClose,
    onUpdate,
    onDelete,
    onAdd,
    defaultTimeSlot
}) => {
    const { trainers, members } = useDataset();
    const [formData, setFormData] = useState({
        name: '',
        instructor: '',
        trainerId: 0,
        schedule: '',
        capacity: 20,
        enrolled: [] as number[],
        description: '',
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:00'
    });

    const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const dataToEdit = editingClass || classData;
        if (dataToEdit) {
            // Parse existing class data - handle both old string format and new object format
            let day = 'Monday', startTime = '09:00', endTime = '10:00';

            if (typeof dataToEdit.schedule === 'object' && dataToEdit.schedule) {
                const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                day = dayNames[dataToEdit.schedule.dayOfWeek] || 'Monday';
                startTime = dataToEdit.schedule.startTime || '09:00';
                endTime = dataToEdit.schedule.endTime || '10:00';
            } else if (typeof dataToEdit.schedule === 'string') {
                const scheduleMatch = dataToEdit.schedule.match(/(\w+)\s+(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/) || [];
                const [, dayMatch, startHour, startMinute, endHour, endMinute] = scheduleMatch;
                day = dayMatch || 'Monday';
                startTime = scheduleMatch.length > 0 ? `${startHour}:${startMinute}` : '09:00';
                endTime = scheduleMatch.length > 0 ? `${endHour}:${endMinute}` : '10:00';
            }

            setFormData({
                name: dataToEdit.name || '',
                instructor: '', // We don't store instructor name anymore
                trainerId: dataToEdit.trainerId || 0,
                schedule: '',
                capacity: dataToEdit.capacity || 20,
                enrolled: dataToEdit.enrolled || [],
                description: dataToEdit.description || '',
                day,
                startTime,
                endTime
            });
        } else if (defaultTimeSlot) {
            // Set default time slot from calendar click
            const dayName = format(defaultTimeSlot.day, 'EEEE');
            const startTime = String(defaultTimeSlot.hour).padStart(2, '0') + ':00';
            const endTime = String(defaultTimeSlot.hour + 1).padStart(2, '0') + ':00';

            setFormData(prev => ({
                ...prev,
                day: dayName,
                startTime,
                endTime
            }));
        }
    }, [classData, editingClass, defaultTimeSlot]);

    useEffect(() => {
        // Filter available members based on search
        const filtered = (members || []).filter(member =>
            member.status === 'Active' &&
            !formData.enrolled.includes(member.id) &&
            (searchTerm === '' ||
                member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setAvailableMembers(filtered);
    }, [members, searchTerm, formData.enrolled]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            toast.error('Class name is required');
            return;
        }

        if (!formData.trainerId) {
            toast.error('Please select a trainer');
            return;
        }

        if (formData.startTime >= formData.endTime) {
            toast.error('End time must be after start time');
            return;
        }

        // Build schedule object to match FitnessClass interface
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = dayNames.indexOf(formData.day);

        // Calculate duration in minutes
        const [startHour, startMinute] = formData.startTime.split(':').map(Number);
        const [endHour, endMinute] = formData.endTime.split(':').map(Number);
        const duration = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);

        const classPayload = {
            name: formData.name.trim(),
            trainerId: formData.trainerId,
            schedule: {
                dayOfWeek,
                startTime: formData.startTime,
                endTime: formData.endTime,
                duration
            },
            capacity: formData.capacity,
            enrolled: formData.enrolled,
            description: formData.description.trim()
        };

        const dataToUpdate = editingClass || classData;
        if (dataToUpdate && onUpdate) {
            onUpdate({ ...classPayload, id: dataToUpdate.id });
            toast.success('Class updated successfully!');
        } else if (onAdd) {
            onAdd(classPayload);
            toast.success('Class added successfully!');
        }

        onClose();
    };

    const handleAddMember = (memberId: number) => {
        if (formData.enrolled.length >= formData.capacity) {
            toast.error('Class is at full capacity');
            return;
        }

        setFormData(prev => ({
            ...prev,
            enrolled: [...prev.enrolled, memberId]
        }));

        const member = members.find(m => m.id === memberId);
        if (member) {
            toast.success(`${member.name} added to class`);
        }
    };

    const handleRemoveMember = (memberId: number) => {
        setFormData(prev => ({
            ...prev,
            enrolled: prev.enrolled.filter(id => id !== memberId)
        }));

        const member = members.find(m => m.id === memberId);
        if (member) {
            toast.success(`${member.name} removed from class`);
        }
    };

    const enrolledMembers = members.filter(m => formData.enrolled.includes(m.id));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingClass ? 'Edit Class' : 'Add New Class'}
            size="xl"
        >
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <Input
                            label="Class Name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                            placeholder="e.g., Morning Yoga, HIIT Training"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-base-content">
                            Class Type <span className="text-error ml-1">*</span>
                        </label>
                        <select
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="select select-bordered w-full"
                        >
                            <option value="">Select class type...</option>
                            {CLASS_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-base-content">
                            Trainer <span className="text-error ml-1">*</span>
                        </label>
                        <select
                            value={formData.trainerId}
                            onChange={(e) => setFormData(prev => ({ ...prev, trainerId: parseInt(e.target.value) }))}
                            className="select select-bordered w-full"
                            required
                        >
                            <option value={0}>Select trainer...</option>
                            {(trainers || [])
                                .filter(trainer => trainer.isActive)
                                .map(trainer => (
                                    <option key={trainer.id} value={trainer.id}>
                                        {trainer.name} - {(trainer.expertise || []).join(', ')}
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                    <Input
                        label="Capacity"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.capacity}
                        onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 20 }))}
                        required
                    />
                </div>

                {/* Schedule */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-base-content">Schedule</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-base-content">
                                Day of Week
                            </label>
                            <select
                                value={formData.day}
                                onChange={(e) => setFormData(prev => ({ ...prev, day: e.target.value }))}
                                className="select select-bordered w-full"
                            >
                                {DAYS_OF_WEEK.map(day => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Start Time"
                            type="time"
                            value={formData.startTime}
                            onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                            required
                        />

                        <Input
                            label="End Time"
                            type="time"
                            value={formData.endTime}
                            onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                            required
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-base-content">
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="textarea textarea-bordered w-full"
                        placeholder="Brief description of the class..."
                    />
                </div>

                {/* Enrolled Members */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-base-content">
                            Enrolled Members ({formData.enrolled.length}/{formData.capacity})
                        </h3>
                        <Badge variant={formData.enrolled.length >= formData.capacity ? 'warning' : 'success'}>
                            {formData.enrolled.length >= formData.capacity ? 'Full' : 'Available'}
                        </Badge>
                    </div>

                    {/* Current Enrollments */}
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {enrolledMembers.length > 0 ? (
                            enrolledMembers.map(member => (
                                <div key={member.id} className="flex items-center justify-between p-2 bg-base-200 rounded-lg">
                                    <div>
                                        <span className="font-medium">{member.name}</span>
                                        <span className="text-sm text-base-content/60 ml-2">{member.email}</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveMember(member.id)}
                                        icon={<HiTrash className="h-4 w-4" />}
                                        className="text-error hover:bg-error/10"
                                    />
                                </div>
                            ))
                        ) : (
                            <p className="text-base-content/60 text-sm text-center py-4">
                                No members enrolled yet
                            </p>
                        )}
                    </div>

                    {/* Add Members */}
                    {formData.enrolled.length < formData.capacity && (
                        <div className="space-y-2">
                            <Input
                                placeholder="Search members to add..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                startIcon={<HiUsers className="h-4 w-4" />}
                            />

                            <div className="max-h-32 overflow-y-auto space-y-1">
                                {availableMembers.slice(0, 5).map(member => (
                                    <button
                                        key={member.id}
                                        type="button"
                                        onClick={() => handleAddMember(member.id)}
                                        className="w-full text-left p-2 hover:bg-base-200 rounded-lg flex items-center justify-between group"
                                    >
                                        <div>
                                            <span className="font-medium">{member.name}</span>
                                            <span className="text-sm text-base-content/60 ml-2">{member.status}</span>
                                        </div>
                                        <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                            Add
                                        </span>
                                    </button>
                                ))}
                                {availableMembers.length === 0 && (
                                    <p className="text-base-content/60 text-sm text-center py-2">
                                        {searchTerm ? 'No members found matching your search' : 'No active members available to add'}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-base-300">
                    <div>
                        {classData && onDelete && (
                            <Button
                                type="button"
                                variant="danger"
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete this class?')) {
                                        onDelete();
                                    }
                                }}
                                icon={<HiTrash className="h-4 w-4" />}
                            >
                                Delete Class
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
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
                            {editingClass ? 'Update Class' : 'Create Class'}
                        </Button>
                    </div>
                </div>
            </motion.form>
        </Modal>
    );
};
