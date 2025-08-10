import React, { useState, useMemo, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiUserGroup, 
  HiPlus, 
  HiMagnifyingGlass,
  HiUsers,
  HiUser,
  HiEnvelope,
  HiPhone,
  HiCalendarDays
} from 'react-icons/hi2';
import { useMembers, useClasses, useDatasetDispatch, datasetActions } from '../../contexts/DatasetContext';
import { Member, MembershipType, MEMBERSHIP_TYPES } from '../../types';
import { ValidationUtils, DataUtils } from '../../utils/lodashHelpers';
import { MemberCard } from '../../components/members/MemberCard';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { fadeInUp, staggerChildren, pageVariants } from '../../theme';
import { useSearchAndFilterQuery } from '../../hooks/useQueryParams';
import { useDebouncedValue, useSearchQuery } from '../../hooks/useDeferredValue';
import { useFormTransition } from '../../hooks/useTransition';

export function Members(): JSX.Element {
  const dispatch = useDatasetDispatch();
  const members = useMembers();
  const classes = useClasses();
  
  // React 19-style hooks for state management
  const [isPending, startTransition] = useTransition();
  const { isPending: isSubmitting, submitForm } = useFormTransition();

  // URL-based search and filter state
  const {
    searchTerm,
    filters,
    updateSearch,
    updateFilter,
    clearSearch,
    clearFilters
  } = useSearchAndFilterQuery({
    membershipType: 'All' as MembershipType | 'All',
  });

  // Debounced search for better performance
  const { deferredQuery: deferredSearchTerm, isSearching } = useSearchQuery(searchTerm, 300);

  // Form state for adding new members
  const [newMember, setNewMember] = useState<Omit<Member, 'id'>>({
    name: '', 
    email: '', 
    phone: '', 
    membershipType: 'Basic', 
    startDate: ''
  });
  
  // UI state
  const [showAddForm, setShowAddForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Memoized filtered members with React 19 patterns
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||
                           member.phone.includes(deferredSearchTerm);
      
      const matchesFilter = filters.membershipType === 'All' || member.membershipType === filters.membershipType;
      
      return matchesSearch && matchesFilter;
    });
  }, [members, deferredSearchTerm, filters.membershipType]);

  // Memoized statistics
  const stats = useMemo(() => ({
    total: members.length,
    basic: members.filter(m => m.membershipType === 'Basic').length,
    premium: members.filter(m => m.membershipType === 'Premium').length,
    vip: members.filter(m => m.membershipType === 'VIP').length,
  }), [members]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!newMember.name.trim()) newErrors.name = 'Name is required';
    if (!newMember.email.trim()) newErrors.email = 'Email is required';
    else if (!ValidationUtils.isValidEmail(newMember.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!newMember.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!ValidationUtils.isValidPhone(newMember.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    if (!newMember.startDate) newErrors.startDate = 'Start date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddMember = (): void => {
    if (validate()) {
      // Use React 19-style form submission with transitions
      submitForm(
        async () => {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          startTransition(() => {
            dispatch(datasetActions.addMember({...newMember, id: Date.now()}));
            setNewMember({
              name: '', 
              email: '', 
              phone: '', 
              membershipType: 'Basic', 
              startDate: ''
            });
            setShowAddForm(false);
            setErrors({});
          });
        },
        {
          onSuccess: () => {
            console.log('Member added successfully');
          },
          onError: (error) => {
            console.error('Failed to add member:', error);
          }
        }
      );
    }
  };

  const handleUpdateMember = (member: Member): void => {
    startTransition(() => {
      dispatch(datasetActions.updateMember(member));
    });
  };

  const handleDeleteMember = (id: number): void => {
    startTransition(() => {
      dispatch(datasetActions.deleteMember(id));
    });
  };

  const handleAddMemberToClass = (memberId: number, classId: number): void => {
    const targetClass = DataUtils.findClassById(classes, classId);
    
    if (!targetClass) return;
    
    if (targetClass.enrolled.length >= targetClass.capacity) {
      alert('Class is full');
      return;
    }
    
    startTransition(() => {
      const newEnrolled = [...targetClass.enrolled, memberId];
      dispatch(datasetActions.updateClass({...targetClass, enrolled: newEnrolled}));
    });
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
                <HiUserGroup className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">Members</h1>
                <p className="text-neutral-600">Manage gym members and memberships</p>
              </div>
            </div>
            <Button onClick={() => setShowAddForm(true)} className="gap-2">
              <HiPlus className="h-4 w-4" />
              Add Member
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
            { label: 'Total Members', value: stats.total, icon: HiUsers, color: 'bg-blue-500' },
            { label: 'Basic', value: stats.basic, icon: HiUser, color: 'bg-gray-500' },
            { label: 'Premium', value: stats.premium, icon: HiUser, color: 'bg-red-500' },
            { label: 'VIP', value: stats.vip, icon: HiUser, color: 'bg-red-700' },
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

        {/* Search and Filters */}
        <motion.div variants={fadeInUp} className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => updateSearch(e.target.value)}
                  startIcon={<HiMagnifyingGlass className="h-4 w-4" />}
                  className="flex-1"
                />
                <Select
                  value={filters.membershipType}
                  onChange={(e) => updateFilter('membershipType', e.target.value as MembershipType | 'All')}
                  options={[
                    { value: 'All', label: 'All Types' },
                    ...MEMBERSHIP_TYPES.map(type => ({ value: type, label: type }))
                  ]}
                  className="sm:w-48"
                />
                {(searchTerm || filters.membershipType !== 'All') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="whitespace-nowrap"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Add Member Form Modal */}
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
                      Add New Member
                    </h2>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Name"
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        startIcon={<HiUser className="h-4 w-4" />}
                        error={errors.name}
                        required
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={newMember.email}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                        startIcon={<HiEnvelope className="h-4 w-4" />}
                        error={errors.email}
                        required
                      />
                      <Input
                        label="Phone"
                        value={newMember.phone}
                        onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                        startIcon={<HiPhone className="h-4 w-4" />}
                        error={errors.phone}
                        required
                      />
                      <Select
                        label="Membership Type"
                        value={newMember.membershipType}
                        onChange={(e) => setNewMember({ ...newMember, membershipType: e.target.value as MembershipType })}
                        options={MEMBERSHIP_TYPES.map(type => ({ value: type, label: type }))}
                        required
                      />
                      <Input
                        label="Start Date"
                        type="date"
                        value={newMember.startDate}
                        onChange={(e) => setNewMember({ ...newMember, startDate: e.target.value })}
                        startIcon={<HiCalendarDays className="h-4 w-4" />}
                        error={errors.startDate}
                        required
                        className="md:col-span-2"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button 
                        onClick={handleAddMember} 
                        className="flex-1"
                        disabled={isSubmitting || isPending}
                        loading={isSubmitting || isPending}
                      >
                        {isSubmitting || isPending ? 'Adding...' : 'Add Member'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAddForm(false)}
                        className="flex-1"
                        disabled={isSubmitting || isPending}
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

        {/* Members Grid */}
        <motion.div
          variants={staggerChildren}
          initial="initial"
          animate="animate"
          className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3"
        >
          <AnimatePresence>
            {filteredMembers.map(member => (
              <MemberCard
                key={member.id}
                member={member}
                classes={classes}
                onUpdate={handleUpdateMember}
                onDelete={handleDeleteMember}
                onAddToClass={handleAddMemberToClass}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Loading indicator */}
        {isSearching && (
          <motion.div
            variants={fadeInUp}
            className="text-center py-8"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
            <p className="text-sm text-neutral-600">Searching...</p>
          </motion.div>
        )}

        {filteredMembers.length === 0 && !isSearching && (
          <motion.div
            variants={fadeInUp}
            className="text-center py-12"
          >
            <HiUsers className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              {searchTerm || filters.membershipType !== 'All' ? 'No members found' : 'No members yet'}
            </h3>
            <p className="text-neutral-600">
              {searchTerm || filters.membershipType !== 'All'
                ? 'Try adjusting your search or filter criteria.'
                : 'Add your first member to get started.'
              }
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}