import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiUser, 
  HiEnvelope, 
  HiPhone, 
  HiCreditCard, 
  HiCalendarDays,
  HiPencil,
  HiTrash,
  HiPlus,
  HiAcademicCap,
  HiXMark,
  HiPrinter
} from 'react-icons/hi2';
import { Member, FitnessClass, MEMBER_STATUSES, GENDERS } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { ContextMenu, ContextMenuItem } from '../ui/ContextMenu';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

interface MemberCardProps {
  member: Member;
  classes: FitnessClass[];
  onUpdate: (member: Member) => void;
  onDelete: (id: number) => void;
  onAddToClass: (memberId: number, classId: number) => void;
  onPrintMembershipCard?: (member: Member) => void;
}

const membershipTypeColors = {
  Basic: 'bg-gray-100 text-gray-800',
  Premium: 'bg-red-100 text-red-800',
  VIP: 'bg-red-600 text-white',
};

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  classes,
  onUpdate,
  onDelete,
  onAddToClass,
  onPrintMembershipCard
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Member>(member);
  const [showAddClass, setShowAddClass] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const enrolledClasses = classes.filter(cls => cls.enrolled.includes(member.id));
  const availableClasses = classes.filter(cls => 
    !cls.enrolled.includes(member.id) && cls.enrolled.length < cls.capacity
  );

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!editData.name.trim()) newErrors.name = 'Name is required';
    if (!editData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!editData.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(editData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    if (!editData.startDate) newErrors.startDate = 'Start date is required';

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
    setEditData(member);
    setIsEditing(false);
    setErrors({});
  };

  const handleAddToClass = () => {
    if (selectedClass) {
      onAddToClass(member.id, parseInt(selectedClass));
      setSelectedClass('');
      setShowAddClass(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${member.name}?`)) {
      onDelete(member.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Context menu items
  const contextMenuItems: ContextMenuItem[] = [
    {
      id: 'edit',
      label: 'Edit Member',
      icon: HiPencil,
      onClick: () => setIsEditing(true),
      shortcut: 'Ctrl+E'
    },
    {
      id: 'add-class',
      label: 'Add to Class',
      icon: HiPlus,
      onClick: () => setShowAddClass(true),
      shortcut: 'Ctrl+A'
    },
    {
      id: 'print-card',
      label: 'Print Membership Card',
      icon: HiPrinter,
      onClick: () => {
        if (onPrintMembershipCard) {
          onPrintMembershipCard(member);
          toast.success('Membership card sent to printer');
        } else {
          toast.error('Print function not available');
        }
      },
      shortcut: 'Ctrl+P'
    },
    {
      id: 'contact',
      label: 'Contact Member',
      icon: HiEnvelope,
      onClick: () => {
        window.open(`mailto:${member.email}?subject=Lotus Fitness Center`);
        toast.success('Email client opened');
      }
    },
    {
      id: 'call',
      label: 'Call Member',
      icon: HiPhone,
      onClick: () => {
        window.open(`tel:${member.phone}`);
        toast.success('Calling member');
      }
    },
    {
      id: 'divider-1',
      label: '',
      onClick: () => {},
      divider: true
    },
    {
      id: 'delete',
      label: 'Delete Member',
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
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-context-menu">
        <CardContent className="p-6">
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">Edit Member</h3>
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
                  label="Name"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  startIcon={<HiUser className="h-4 w-4" />}
                  error={errors.name}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  startIcon={<HiEnvelope className="h-4 w-4" />}
                  error={errors.email}
                  required
                />
                <Input
                  label="Phone"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  startIcon={<HiPhone className="h-4 w-4" />}
                  error={errors.phone}
                  required
                />
                <Select
                  label="Membership Type"
                  value={editData.membershipType}
                  onChange={(e) => setEditData({ ...editData, membershipType: e.target.value as MembershipType })}
                  options={MEMBERSHIP_TYPES.map(type => ({ value: type, label: type }))}
                  required
                />
                <Input
                  label="Start Date"
                  type="date"
                  value={editData.startDate}
                  onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                  startIcon={<HiCalendarDays className="h-4 w-4" />}
                  error={errors.startDate}
                  required
                />
              </div>
            </motion.div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-1">
                    {member.name}
                  </h3>
                  <Badge className={cn('text-xs', membershipTypeColors[member.membershipType])}>
                    {member.membershipType}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    <HiPencil className="h-4 w-4" />
                  </Button>
                  {onPrintMembershipCard && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPrintMembershipCard(member)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <HiPrinter className="h-4 w-4" />
                    </Button>
                  )}
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
                  <HiEnvelope className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{member.email}</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-600">
                  <HiPhone className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{member.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-600">
                  <HiCalendarDays className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">Started {formatDate(member.startDate)}</span>
                </div>
              </div>

              {/* Enrolled Classes */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                    <HiAcademicCap className="h-4 w-4" />
                    Enrolled Classes ({enrolledClasses.length})
                  </h4>
                  {availableClasses.length > 0 && (
                    <Button
                      size="xs"
                      onClick={() => setShowAddClass(!showAddClass)}
                    >
                      <HiPlus className="h-3 w-3 mr-1" />
                      Add Class
                    </Button>
                  )}
                </div>

                {enrolledClasses.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {enrolledClasses.map(cls => (
                      <Badge
                        key={cls.id}
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200"
                      >
                        {cls.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500 italic">
                    Not enrolled in any classes
                  </p>
                )}

                <AnimatePresence>
                  {showAddClass && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-neutral-200"
                    >
                      <div className="flex gap-2">
                        <Select
                          placeholder="Select a class"
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                          options={availableClasses.map(cls => ({
                            value: cls.id.toString(),
                            label: `${cls.name} (${cls.enrolled.length}/${cls.capacity})`
                          }))}
                          className="flex-1"
                          size="sm"
                        />
                        <Button size="sm" onClick={handleAddToClass} disabled={!selectedClass}>
                          Add
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setShowAddClass(false)}
                        >
                          <HiXMark className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      </ContextMenu>
    </motion.div>
  );
};