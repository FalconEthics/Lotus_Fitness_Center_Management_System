import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUsers, 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaDownload, 
  FaUserCheck,
  FaUserTimes,
  FaUserClock,
  FaUserShield
} from 'react-icons/fa';
import { debounce } from 'lodash';
import { useCallback } from 'react';
import { 
  useMembers, 
  useMembershipPlans,
  useDatasetDispatch, 
  datasetActions 
} from '../../contexts/DatasetContext';
import { Member, MEMBER_STATUSES, GENDERS } from '../../types';
import { MemberForm } from '../../components/forms/MemberForm';
import { StatCard } from '../../components/StatCard';
import { usePrintManager } from '../../components/printables';
import { usePageShortcuts, commonPageShortcuts, PageShortcut } from '../../hooks/usePageShortcuts';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 120
    }
  }
};

export function Members(): JSX.Element {
  const members = useMembers();
  const membershipPlans = useMembershipPlans();
  const dispatch = useDatasetDispatch();
  const { printMembershipCard, PrintManagerComponent } = usePrintManager();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [planFilter, setPlanFilter] = useState<string>('All');
  const [genderFilter, setGenderFilter] = useState<string>('All');
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>();

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  // Page-specific keyboard shortcuts
  const pageShortcuts: PageShortcut[] = [
    commonPageShortcuts.search(() => {
      const searchInput = document.querySelector('input[type="text"][placeholder*="search" i]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
        toast.success('Search focused');
      }
    }),
    commonPageShortcuts.add(() => {
      setShowForm(true);
      setEditingMember(undefined);
      toast.success('Add new member form opened');
    }),
    commonPageShortcuts.clearFilters(() => {
      setStatusFilter('All');
      setPlanFilter('All');
      setGenderFilter('All');
      setSearchTerm('');
      toast.success('All filters cleared');
    }),
    {
      key: 'p',
      action: () => {
        // Print all membership cards
        if (filteredMembers.length > 0) {
          filteredMembers.forEach(member => printMembershipCard(member));
          toast.success(`Printing ${filteredMembers.length} membership cards`);
        } else {
          toast.info('No members to print');
        }
      },
      description: 'Print all visible membership cards'
    },
    {
      key: '1',
      action: () => setStatusFilter('Active'),
      description: 'Filter by Active status'
    },
    {
      key: '2',
      action: () => setStatusFilter('Expired'),
      description: 'Filter by Expired status'
    },
    {
      key: '3',
      action: () => setStatusFilter('Trial'),
      description: 'Filter by Trial status'
    },
    {
      key: '4',
      action: () => setStatusFilter('Suspended'),
      description: 'Filter by Suspended status'
    }
  ];

  usePageShortcuts(pageShortcuts);

  // Helper function to get membership plan name
  const getMembershipPlanName = (planId: number) => {
    const plan = membershipPlans.find(p => p.id === planId);
    return plan ? plan.name : 'Unknown Plan';
  };

  // Filtered and searched members
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = searchTerm === '' || 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm);

      const matchesStatus = statusFilter === 'All' || member.status === statusFilter;
      const matchesPlan = planFilter === 'All' || member.membershipPlanId === parseInt(planFilter);
      const matchesGender = genderFilter === 'All' || member.gender === genderFilter;

      return matchesSearch && matchesStatus && matchesPlan && matchesGender;
    });
  }, [members, searchTerm, statusFilter, planFilter, genderFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: members.length,
      active: members.filter(m => m.status === 'Active').length,
      expired: members.filter(m => m.status === 'Expired').length,
      trial: members.filter(m => m.status === 'Trial').length,
      suspended: members.filter(m => m.status === 'Suspended').length,
    };
  }, [members]);

  const handleDeleteMember = (member: Member) => {
    if (confirm(`Are you sure you want to delete ${member.name}?`)) {
      dispatch(datasetActions.deleteMember(member.id));
      toast.success('Member deleted successfully!');
    }
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMember(undefined);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <FaUserCheck className="text-green-500" />;
      case 'Expired':
        return <FaUserTimes className="text-red-500" />;
      case 'Trial':
        return <FaUserClock className="text-blue-500" />;
      case 'Suspended':
        return <FaUserShield className="text-orange-500" />;
      default:
        return <FaUsers />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Active':
        return 'badge-success';
      case 'Expired':
        return 'badge-error';
      case 'Trial':
        return 'badge-info';
      case 'Suspended':
        return 'badge-warning';
      default:
        return 'badge-ghost';
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-base-100 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">Members</h1>
            <p className="text-base-content/70">Manage gym members and memberships</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary gap-2"
            >
              <FaPlus />
              Add Member
            </button>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={FaUsers}
            title="Total Members"
            value={stats.total}
            className="bg-primary text-primary-content"
          />
          <StatCard
            icon={FaUserCheck}
            title="Active"
            value={stats.active}
            className="bg-success text-success-content"
          />
          <StatCard
            icon={FaUserTimes}
            title="Expired"
            value={stats.expired}
            className="bg-error text-error-content"
          />
          <StatCard
            icon={FaUserClock}
            title="Trial"
            value={stats.trial}
            className="bg-info text-info-content"
          />
          <StatCard
            icon={FaUserShield}
            title="Suspended"
            value={stats.suspended}
            className="bg-warning text-warning-content"
          />
        </motion.div>

        {/* Search and Filters */}
        <motion.div variants={itemVariants} className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Search</span>
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" />
                  <input
                    type="text"
                    placeholder="Name, email, or phone..."
                    className="input input-bordered pl-10 w-full"
                    onChange={handleSearchChange}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Status</span>
                </label>
                <select
                  className="select select-bordered"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  {MEMBER_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Plan Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Plan</span>
                </label>
                <select
                  className="select select-bordered"
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                >
                  <option value="All">All Plans</option>
                  {membershipPlans.map(plan => (
                    <option key={plan.id} value={plan.id.toString()}>{plan.name}</option>
                  ))}
                </select>
              </div>

              {/* Gender Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Gender</span>
                </label>
                <select
                  className="select select-bordered"
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                >
                  <option value="All">All Genders</option>
                  {GENDERS.map(gender => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
              </div>

              {/* Results Count */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Results</span>
                </label>
                <div className="stat">
                  <div className="stat-value text-primary text-2xl">{filteredMembers.length}</div>
                  <div className="stat-desc">members found</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Members Grid */}
        <motion.div variants={itemVariants}>
          {filteredMembers.length === 0 ? (
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center py-12">
                <FaUsers className="mx-auto text-6xl text-base-content/20 mb-4" />
                <h3 className="text-xl font-bold mb-2">No Members Found</h3>
                <p className="text-base-content/70 mb-4">
                  {searchTerm || statusFilter !== 'All' || planFilter !== 'All' || genderFilter !== 'All'
                    ? 'No members match your current filters.'
                    : 'Get started by adding your first member.'}
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn btn-primary gap-2"
                >
                  <FaPlus />
                  Add First Member
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member) => (
                <motion.div
                  key={member.id}
                  variants={itemVariants}
                  className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow"
                >
                  <div className="card-body">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-primary text-primary-content rounded-full w-12">
                            <span className="text-lg font-bold">
                              {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{member.name}</h3>
                          <p className="text-sm text-base-content/70">Age: {member.age}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(member.status)}
                        <span className={`badge ${getStatusBadgeClass(member.status)}`}>
                          {member.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Email:</span> {member.email}</p>
                      <p><span className="font-medium">Phone:</span> {member.phone}</p>
                      <p><span className="font-medium">Gender:</span> {member.gender}</p>
                      <p><span className="font-medium">Plan:</span> {getMembershipPlanName(member.membershipPlanId)}</p>
                      <p><span className="font-medium">Start:</span> {new Date(member.startDate).toLocaleDateString()}</p>
                      <p><span className="font-medium">Expires:</span> {new Date(member.endDate).toLocaleDateString()}</p>
                    </div>

                    <div className="card-actions justify-end mt-4">
                      <button
                        onClick={() => {
                          const plan = membershipPlans.find(p => p.id === member.membershipPlanId);
                          printMembershipCard(member, plan);
                        }}
                        className="btn btn-sm btn-outline btn-primary"
                      >
                        Print Card
                      </button>
                      <button
                        onClick={() => handleEditMember(member)}
                        className="btn btn-sm btn-outline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member)}
                        className="btn btn-sm btn-error"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Member Form Modal */}
      <AnimatePresence>
        {showForm && (
          <MemberForm
            member={editingMember}
            onClose={handleFormClose}
            onSuccess={() => {
              // Refresh could be handled here if needed
            }}
          />
        )}
      </AnimatePresence>

      {/* Print Manager */}
      <PrintManagerComponent />
    </motion.div>
  );
}