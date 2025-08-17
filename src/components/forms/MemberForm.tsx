import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaSave, FaTimes } from 'react-icons/fa';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';
import { 
  Member, 
  MembershipPlan,
  MEMBER_STATUSES, 
  GENDERS 
} from '../../types';
import { 
  useMembershipPlans, 
  useDatasetDispatch, 
  datasetActions 
} from '../../contexts/DatasetContext';

interface MemberFormProps {
  member?: Member;
  onClose: () => void;
  onSuccess?: () => void;
}

export function MemberForm({ member, onClose, onSuccess }: MemberFormProps) {
  const membershipPlans = useMembershipPlans();
  const dispatch = useDatasetDispatch();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: 18,
    gender: 'Male' as const,
    membershipPlanId: 1,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    status: 'Active' as const,
  });

  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | undefined>();

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        email: member.email,
        phone: member.phone,
        age: member.age,
        gender: member.gender,
        membershipPlanId: member.membershipPlanId,
        startDate: member.startDate,
        status: member.status,
      });
    }
  }, [member]);

  useEffect(() => {
    const plan = membershipPlans.find(p => p.id === formData.membershipPlanId);
    setSelectedPlan(plan);
  }, [formData.membershipPlanId, membershipPlans]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlan) {
      toast.error('Please select a membership plan');
      return;
    }

    // Calculate end date based on plan duration
    const startDate = new Date(formData.startDate);
    const endDate = format(addDays(startDate, selectedPlan.duration), 'yyyy-MM-dd');

    const memberData: Member = {
      id: member?.id || Date.now(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      age: formData.age,
      gender: formData.gender,
      membershipPlanId: formData.membershipPlanId,
      startDate: formData.startDate,
      endDate: endDate,
      status: formData.status,
    };

    if (member) {
      dispatch(datasetActions.updateMember(memberData));
      toast.success('Member updated successfully!');
    } else {
      dispatch(datasetActions.addMember(memberData));
      toast.success('Member added successfully!');
    }

    onSuccess?.();
    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-base-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-base-100 border-b border-base-300 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary">
              {member ? 'Edit Member' : 'Add New Member'}
            </h2>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FaUser className="text-primary" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Full Name *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Age *</span>
                </label>
                <input
                  type="number"
                  min="16"
                  max="100"
                  className="input input-bordered"
                  value={formData.age}
                  onChange={(e) => handleChange('age', parseInt(e.target.value))}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Gender *</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  required
                >
                  {GENDERS.map(gender => (
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Status *</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  required
                >
                  {MEMBER_STATUSES.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FaEnvelope className="text-primary" />
              Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email *</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Phone *</span>
                </label>
                <input
                  type="tel"
                  className="input input-bordered"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Membership Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FaCalendarAlt className="text-primary" />
              Membership Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Membership Plan *</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.membershipPlanId}
                  onChange={(e) => handleChange('membershipPlanId', parseInt(e.target.value))}
                  required
                >
                  {membershipPlans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - ₹{plan.cost} ({plan.duration} days)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Start Date *</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Plan Details */}
            {selectedPlan && (
              <div className="alert alert-info">
                <div>
                  <h4 className="font-bold">{selectedPlan.name}</h4>
                  <p className="text-sm">{selectedPlan.description}</p>
                  <div className="mt-2">
                    <span className="badge badge-primary mr-2">₹{selectedPlan.cost}</span>
                    <span className="badge badge-secondary mr-2">{selectedPlan.duration} days</span>
                    <span className="text-xs text-base-content/70">
                      End Date: {format(addDays(new Date(formData.startDate), selectedPlan.duration), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-medium">Features:</p>
                    <ul className="text-xs text-base-content/70">
                      {selectedPlan.features.map((feature, index) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-base-300">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1 gap-2"
            >
              <FaSave />
              {member ? 'Update Member' : 'Add Member'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}