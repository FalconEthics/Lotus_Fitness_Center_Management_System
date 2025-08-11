import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTag, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaEyeSlash,
  FaRupeeSign,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import { 
  useMembershipPlans,
  useMembers,
  useDatasetDispatch, 
  datasetActions 
} from '../../contexts/DatasetContext';
import { MembershipPlan } from '../../types';
import { MembershipPlanForm } from '../../components/forms/MembershipPlanForm';
import { StatCard } from '../../Reusable_Components/StatCard';
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

export function Plans(): JSX.Element {
  const membershipPlans = useMembershipPlans();
  const members = useMembers();
  const dispatch = useDatasetDispatch();

  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | undefined>();
  const [viewFilter, setViewFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Filtered plans
  const filteredPlans = useMemo(() => {
    return membershipPlans.filter(plan => {
      switch (viewFilter) {
        case 'active':
          return plan.isActive;
        case 'inactive':
          return !plan.isActive;
        default:
          return true;
      }
    });
  }, [membershipPlans, viewFilter]);

  // Statistics
  const stats = useMemo(() => {
    const planUsage = membershipPlans.map(plan => ({
      ...plan,
      memberCount: members.filter(m => m.membershipPlanId === plan.id).length,
      revenue: members.filter(m => m.membershipPlanId === plan.id && m.status === 'Active').length * plan.cost
    }));

    return {
      totalPlans: membershipPlans.length,
      activePlans: membershipPlans.filter(p => p.isActive).length,
      inactivePlans: membershipPlans.filter(p => !p.isActive).length,
      totalRevenue: planUsage.reduce((sum, plan) => sum + plan.revenue, 0),
      planUsage
    };
  }, [membershipPlans, members]);

  const handleDeletePlan = (plan: MembershipPlan) => {
    const membersUsingPlan = members.filter(m => m.membershipPlanId === plan.id);
    
    if (membersUsingPlan.length > 0) {
      toast.error(`Cannot delete plan "${plan.name}" - ${membersUsingPlan.length} members are using it`);
      return;
    }

    if (confirm(`Are you sure you want to delete the plan "${plan.name}"?`)) {
      dispatch(datasetActions.deleteMembershipPlan(plan.id));
      toast.success('Membership plan deleted successfully!');
    }
  };

  const handleToggleStatus = (plan: MembershipPlan) => {
    const updatedPlan = { ...plan, isActive: !plan.isActive };
    dispatch(datasetActions.updateMembershipPlan(updatedPlan));
    toast.success(`Plan ${updatedPlan.isActive ? 'activated' : 'deactivated'} successfully!`);
  };

  const handleEditPlan = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPlan(undefined);
  };

  const getMemberCount = (planId: number) => {
    return members.filter(m => m.membershipPlanId === planId).length;
  };

  const getActiveRevenue = (plan: MembershipPlan) => {
    const activeMembers = members.filter(m => m.membershipPlanId === plan.id && m.status === 'Active').length;
    return activeMembers * plan.cost;
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
            <h1 className="text-4xl font-bold text-primary mb-2">Membership Plans</h1>
            <p className="text-base-content/70">Create and manage subscription plans</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <div className="join">
              <button
                onClick={() => setViewFilter('all')}
                className={`btn join-item btn-sm ${viewFilter === 'all' ? 'btn-active' : 'btn-outline'}`}
              >
                All
              </button>
              <button
                onClick={() => setViewFilter('active')}
                className={`btn join-item btn-sm ${viewFilter === 'active' ? 'btn-active' : 'btn-outline'}`}
              >
                Active
              </button>
              <button
                onClick={() => setViewFilter('inactive')}
                className={`btn join-item btn-sm ${viewFilter === 'inactive' ? 'btn-active' : 'btn-outline'}`}
              >
                Inactive
              </button>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary gap-2"
            >
              <FaPlus />
              New Plan
            </button>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={FaTag}
            title="Total Plans"
            value={stats.totalPlans}
            className="bg-primary text-primary-content"
          />
          <StatCard
            icon={FaCheckCircle}
            title="Active Plans"
            value={stats.activePlans}
            className="bg-success text-success-content"
          />
          <StatCard
            icon={FaTimesCircle}
            title="Inactive Plans"
            value={stats.inactivePlans}
            className="bg-error text-error-content"
          />
          <StatCard
            icon={FaRupeeSign}
            title="Monthly Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            className="bg-secondary text-secondary-content"
          />
        </motion.div>

        {/* Plans Grid */}
        <motion.div variants={itemVariants}>
          {filteredPlans.length === 0 ? (
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center py-12">
                <FaTag className="mx-auto text-6xl text-base-content/20 mb-4" />
                <h3 className="text-xl font-bold mb-2">No Plans Found</h3>
                <p className="text-base-content/70 mb-4">
                  {viewFilter === 'all' 
                    ? 'Create your first membership plan to get started.' 
                    : `No ${viewFilter} plans found.`}
                </p>
                {viewFilter === 'all' && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="btn btn-primary gap-2"
                  >
                    <FaPlus />
                    Create First Plan
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlans.map((plan) => (
                <motion.div
                  key={plan.id}
                  variants={itemVariants}
                  className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow"
                >
                  <div className="card-body">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-xl">{plan.name}</h3>
                        <p className="text-base-content/70 text-sm">{plan.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${plan.isActive ? 'badge-success' : 'badge-error'}`}>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="text-center py-4 border-y border-base-300">
                      <div className="text-3xl font-bold text-primary">₹{plan.cost.toLocaleString()}</div>
                      <div className="text-sm text-base-content/70">{plan.duration} days</div>
                      <div className="text-xs text-base-content/50">
                        ₹{Math.round(plan.cost / plan.duration)}/day
                      </div>
                    </div>

                    {/* Features */}
                    <div className="py-4">
                      <h4 className="font-semibold mb-2 text-sm">Features:</h4>
                      <ul className="space-y-1">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <FaCheckCircle className="text-success text-xs" />
                            {feature}
                          </li>
                        ))}
                        {plan.features.length > 3 && (
                          <li className="text-xs text-base-content/50">
                            +{plan.features.length - 3} more features
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Statistics */}
                    <div className="stats stats-vertical shadow mb-4">
                      <div className="stat py-2">
                        <div className="stat-title text-xs">Members</div>
                        <div className="stat-value text-lg">{getMemberCount(plan.id)}</div>
                      </div>
                      <div className="stat py-2">
                        <div className="stat-title text-xs">Monthly Revenue</div>
                        <div className="stat-value text-lg">₹{getActiveRevenue(plan).toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="card-actions justify-end">
                      <div className="dropdown dropdown-top dropdown-end">
                        <button className="btn btn-sm btn-outline">Actions</button>
                        <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                          <li>
                            <button onClick={() => handleEditPlan(plan)}>
                              <FaEdit /> Edit Plan
                            </button>
                          </li>
                          <li>
                            <button onClick={() => handleToggleStatus(plan)}>
                              {plan.isActive ? <FaEyeSlash /> : <FaEye />}
                              {plan.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </li>
                          <li>
                            <button 
                              onClick={() => handleDeletePlan(plan)}
                              className="text-error"
                            >
                              <FaTrash /> Delete Plan
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Usage Analytics */}
        {stats.planUsage.length > 0 && (
          <motion.div variants={itemVariants} className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">Plan Performance</h2>
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Plan Name</th>
                      <th>Price</th>
                      <th>Duration</th>
                      <th>Members</th>
                      <th>Revenue</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.planUsage.map((plan) => (
                      <tr key={plan.id}>
                        <td className="font-bold">{plan.name}</td>
                        <td>₹{plan.cost.toLocaleString()}</td>
                        <td>{plan.duration} days</td>
                        <td>
                          <span className="badge badge-primary">{plan.memberCount}</span>
                        </td>
                        <td className="font-mono">₹{plan.revenue.toLocaleString()}</td>
                        <td>
                          <span className={`badge ${plan.isActive ? 'badge-success' : 'badge-error'}`}>
                            {plan.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Plan Form Modal */}
      <AnimatePresence>
        {showForm && (
          <MembershipPlanForm
            plan={editingPlan}
            onClose={handleFormClose}
            onSuccess={() => {
              // Refresh could be handled here if needed
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}