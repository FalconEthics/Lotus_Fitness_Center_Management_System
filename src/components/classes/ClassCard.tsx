import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiAcademicCap,
    HiUser,
    HiClock,
    HiUsers,
    HiPencil,
    HiTrash,
    HiPlus,
    HiXMark,
    HiUserGroup
} from 'react-icons/hi2';
import { FitnessClass, Member, Trainer } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { ContextMenu, ContextMenuItem } from '../ui/ContextMenu';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

interface ClassCardProps {
    fitnessClass: FitnessClass;
    members: Member[];
    trainers: Trainer[];
    onUpdate: (fitnessClass: FitnessClass) => void;
    onDelete: (id: number) => void;
    onAddMember?: (classId: number, memberId: number) => void;
    onEdit?: (fitnessClass: FitnessClass) => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({
    fitnessClass,
    members,
    trainers,
    onUpdate,
    onDelete,
    onAddMember,
    onEdit
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<FitnessClass>(fitnessClass);
    const [showAddMember, setShowAddMember] = useState(false);
    const [selectedMember, setSelectedMember] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showEnrolledMembers, setShowEnrolledMembers] = useState(false);

    const enrolledMembers = (members || []).filter(member => fitnessClass.enrolled.includes(member.id));
    const availableMembers = (members || []).filter(member => !fitnessClass.enrolled.includes(member.id));

    // Get trainer name from trainerId
    const trainer = (trainers || []).find(t => t.id === fitnessClass.trainerId);
    const trainerName = trainer ? trainer.name : 'Unassigned';

    // Format schedule display
    const scheduleDisplay = useMemo(() => {
        if (typeof fitnessClass.schedule === 'object' && fitnessClass.schedule) {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = days[fitnessClass.schedule.dayOfWeek] || 'Unknown';
            return `${dayName} ${fitnessClass.schedule.startTime}-${fitnessClass.schedule.endTime}`;
        }
        return fitnessClass.schedule || 'Schedule TBD';
    }, [fitnessClass.schedule]);

    const capacityUtilization = (fitnessClass.enrolled.length / fitnessClass.capacity) * 100;
    const isFullyBooked = fitnessClass.enrolled.length >= fitnessClass.capacity;

    const getCapacityColor = () => {
        if (capacityUtilization >= 90) return 'text-red-600 bg-red-50';
        if (capacityUtilization >= 70) return 'text-yellow-600 bg-yellow-50';
        return 'text-green-600 bg-green-50';
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!editData.name.trim()) newErrors.name = 'Class name is required';
        if (!editData.trainerId) newErrors.trainerId = 'Trainer is required';

        // Validate schedule based on its type
        if (typeof editData.schedule === 'string') {
            if (!editData.schedule.trim()) newErrors.schedule = 'Schedule is required';
        } else if (typeof editData.schedule === 'object') {
            if (!editData.schedule || !editData.schedule.startTime || !editData.schedule.endTime) {
                newErrors.schedule = 'Schedule is required';
            }
        } else {
            newErrors.schedule = 'Schedule is required';
        }

        if (!editData.capacity || editData.capacity <= 0) {
            newErrors.capacity = 'Capacity must be greater than 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validate()) {
            onUpdate(editData);
            setIsEditing(false);
            setErrors({});
        }
    };

    const handleCancel = () => {
        setEditData(fitnessClass);
        setIsEditing(false);
        setErrors({});
    };

    const handleAddMember = () => {
        if (selectedMember) {
            const memberId = parseInt(selectedMember);
            const updatedClass = {
                ...fitnessClass,
                enrolled: [...fitnessClass.enrolled, memberId]
            };
            onUpdate(updatedClass);
            setSelectedMember('');
            setShowAddMember(false);
            toast.success('Member added to class successfully!');
        }
    };

    const handleRemoveMember = (memberId: number) => {
        const updatedClass = {
            ...fitnessClass,
            enrolled: fitnessClass.enrolled.filter(id => id !== memberId)
        };
        onUpdate(updatedClass);
        toast.success('Member removed from class successfully!');
    };

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't open modal if clicking on interactive elements
        if ((e.target as HTMLElement).closest('button, select, input')) {
            return;
        }
        if (onEdit) {
            onEdit(fitnessClass);
        }
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete "${fitnessClass.name}" class?`)) {
            onDelete(fitnessClass.id);
        }
    };

    // Context menu items for classes
    const contextMenuItems: ContextMenuItem[] = [
        {
            id: 'edit',
            label: 'Edit Class',
            icon: HiPencil,
            onClick: () => setIsEditing(true),
            shortcut: 'Ctrl+E'
        },
        {
            id: 'add-member',
            label: 'Add Member',
            icon: HiPlus,
            onClick: () => setShowAddMember(true),
            disabled: isFullyBooked,
            shortcut: 'Ctrl+M'
        },
        {
            id: 'view-members',
            label: 'View Members',
            icon: HiUsers,
            onClick: () => {
                if (enrolledMembers.length > 0) {
                    toast.success(`Class has ${enrolledMembers.length} enrolled members`);
                } else {
                    toast.info('No members enrolled in this class');
                }
            }
        },
        {
            id: 'schedule',
            label: 'View Schedule',
            icon: HiClock,
            onClick: () => {
                const scheduleText = typeof fitnessClass.schedule === 'object' && fitnessClass.schedule
                    ? (() => {
                        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        return `${days[fitnessClass.schedule.dayOfWeek]} at ${fitnessClass.schedule.startTime}`;
                    })()
                    : typeof fitnessClass.schedule === 'string'
                        ? fitnessClass.schedule
                        : 'No schedule set';

                toast.success(`${fitnessClass.name} - ${scheduleText}`);
            }
        },
        {
            id: 'divider-1',
            label: '',
            onClick: () => { },
            divider: true
        },
        {
            id: 'delete',
            label: 'Delete Class',
            icon: HiTrash,
            onClick: handleDelete,
            variant: 'danger',
            shortcut: 'Del'
        }
    ];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
        >
            <ContextMenu items={contextMenuItems}>
                <Card
                    className="overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full"
                    onClick={handleCardClick}
                >
                    <CardContent className="p-6 h-full flex flex-col">
                        {isEditing ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-neutral-900">Edit Class</h3>
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={handleSave}>
                                            Save
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={handleCancel}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Class Name"
                                        value={editData.name}
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                        startIcon={<HiAcademicCap className="h-4 w-4" />}
                                        error={errors.name}
                                        required
                                    />
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-neutral-700">
                                            Trainer <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={editData.trainerId}
                                            onChange={(e) => setEditData({ ...editData, trainerId: parseInt(e.target.value) })}
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
                                        {errors.trainerId && (
                                            <p className="text-xs text-red-500 mt-1">{errors.trainerId}</p>
                                        )}
                                    </div>
                                    <div className="md:col-span-2 space-y-1">
                                        <label className="block text-sm font-medium text-neutral-700">
                                            Schedule <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={typeof editData.schedule === 'string' ? editData.schedule : scheduleDisplay}
                                            onChange={(e) => setEditData({ ...editData, schedule: e.target.value })}
                                            className="input input-bordered w-full"
                                            placeholder="e.g., Monday 10:00-11:00"
                                            required
                                        />
                                        {errors.schedule && (
                                            <p className="text-xs text-red-500 mt-1">{errors.schedule}</p>
                                        )}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                                            Capacity: {editData.capacity}
                                        </label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="50"
                                            value={editData.capacity}
                                            onChange={(e) => setEditData({ ...editData, capacity: parseInt(e.target.value) })}
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
                            </motion.div>
                        ) : (
                            <div className="flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-neutral-900 mb-1">
                                            {fitnessClass.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge
                                                className={cn('text-xs px-2 py-1', getCapacityColor())}
                                            >
                                                {fitnessClass.enrolled.length}/{fitnessClass.capacity} enrolled
                                            </Badge>
                                            {isFullyBooked && (
                                                <Badge className="bg-red-100 text-red-800 text-xs">
                                                    Full
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            <HiPencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleDelete}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <HiTrash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-neutral-600">
                                        <HiUser className="h-4 w-4 flex-shrink-0" />
                                        <span className="text-sm font-medium">Instructor:</span>
                                        <span className="text-sm">{trainerName}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-neutral-600">
                                        <HiClock className="h-4 w-4 flex-shrink-0" />
                                        <span className="text-sm font-medium">Schedule:</span>
                                        <span className="text-sm">{scheduleDisplay}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-neutral-600">
                                        <HiUsers className="h-4 w-4 flex-shrink-0" />
                                        <span className="text-sm font-medium">Capacity:</span>
                                        <span className="text-sm">{fitnessClass.capacity} members</span>
                                    </div>
                                </div>

                                {/* Capacity Progress Bar */}
                                <div className="mb-6">
                                    <div className="flex justify-between text-sm font-medium text-neutral-700 mb-2">
                                        <span>Enrollment</span>
                                        <span>{Math.round(capacityUtilization)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <motion.div
                                            className={cn(
                                                'h-2 rounded-full transition-all duration-500',
                                                capacityUtilization >= 90 ? 'bg-red-500' :
                                                    capacityUtilization >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                                            )}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${capacityUtilization}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Enrolled Members */}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-3">
                                        <button
                                            className="text-sm font-semibold text-neutral-700 flex items-center gap-2 hover:text-neutral-900 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowEnrolledMembers(!showEnrolledMembers);
                                            }}
                                        >
                                            <HiUserGroup className="h-4 w-4" />
                                            Enrolled Members ({enrolledMembers.length})
                                            <motion.span
                                                animate={{ rotate: showEnrolledMembers ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="text-xs"
                                            >
                                                ▼
                                            </motion.span>
                                        </button>
                                        {availableMembers.length > 0 && !isFullyBooked && (
                                            <Button
                                                size="xs"
                                                className='p-2 px-4 flex flex-row items-center gap-1'
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowAddMember(!showAddMember);
                                                }}
                                            >
                                                + Add Member
                                            </Button>
                                        )}
                                    </div>

                                    <AnimatePresence>
                                        {showEnrolledMembers && enrolledMembers.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="space-y-2 mb-4"
                                            >
                                                {enrolledMembers.map(member => (
                                                    <div
                                                        key={member.id}
                                                        className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                                <HiUser className="h-3 w-3 text-blue-600" />
                                                            </div>
                                                            <span className="text-sm text-blue-700 font-medium">
                                                                {member.name}
                                                            </span>
                                                        </div>
                                                        <Button
                                                            size="xs"
                                                            variant="outline"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveMember(member.id);
                                                            }}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <HiXMark className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {!showEnrolledMembers && enrolledMembers.length === 0 && (
                                        <p className="text-sm text-neutral-500 italic">
                                            No members enrolled yet
                                        </p>
                                    )}

                                    <AnimatePresence>
                                        {showAddMember && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-3 pt-3 border-t border-neutral-200"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="flex gap-2">
                                                    <select
                                                        value={selectedMember}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedMember(e.target.value);
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="select select-bordered select-sm flex-1"
                                                    >
                                                        <option value="">Select a member</option>
                                                        {availableMembers.map(member => (
                                                            <option key={member.id} value={member.id.toString()}>
                                                                {member.name} ({member.status})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <Button
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAddMember();
                                                        }}
                                                        disabled={!selectedMember}
                                                    >
                                                        Add
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowAddMember(false);
                                                        }}
                                                    >
                                                        <HiXMark className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </ContextMenu>
        </motion.div>
    );
};
