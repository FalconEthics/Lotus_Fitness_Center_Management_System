import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTag, FaCalendarAlt, FaRupeeSign, FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { MembershipPlan } from '../../types';
import { useDatasetDispatch, datasetActions } from '../../contexts/DatasetContext';
import { Modal } from '../ui/Modal';

interface MembershipPlanFormProps {
    plan?: MembershipPlan;
    onClose: () => void;
    onSuccess?: () => void;
}

export function MembershipPlanForm({ plan, onClose, onSuccess }: MembershipPlanFormProps) {
    const dispatch = useDatasetDispatch();

    const [formData, setFormData] = useState({
        name: '',
        duration: 30,
        cost: 1500,
        description: '',
        features: [''],
        isActive: true,
    });

    useEffect(() => {
        if (plan) {
            setFormData({
                name: plan.name,
                duration: plan.duration,
                cost: plan.cost,
                description: plan.description,
                features: plan.features.length > 0 ? plan.features : [''],
                isActive: plan.isActive,
            });
        }
    }, [plan]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Plan name is required');
            return;
        }

        if (formData.cost <= 0) {
            toast.error('Cost must be greater than 0');
            return;
        }

        if (formData.duration <= 0) {
            toast.error('Duration must be greater than 0');
            return;
        }

        const filteredFeatures = formData.features.filter(f => f.trim() !== '');
        if (filteredFeatures.length === 0) {
            toast.error('At least one feature is required');
            return;
        }

        const planData: MembershipPlan = {
            id: plan?.id || Date.now(),
            name: formData.name.trim(),
            duration: formData.duration,
            cost: formData.cost,
            description: formData.description.trim(),
            features: filteredFeatures,
            isActive: formData.isActive,
        };

        if (plan) {
            dispatch(datasetActions.updateMembershipPlan(planData));
            toast.success('Membership plan updated successfully!');
        } else {
            dispatch(datasetActions.addMembershipPlan(planData));
            toast.success('Membership plan created successfully!');
        }

        onSuccess?.();
        onClose();
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addFeature = () => {
        setFormData(prev => ({
            ...prev,
            features: [...prev.features, '']
        }));
    };

    const removeFeature = (index: number) => {
        if (formData.features.length > 1) {
            setFormData(prev => ({
                ...prev,
                features: prev.features.filter((_, i) => i !== index)
            }));
        }
    };

    const updateFeature = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.map((feature, i) => i === index ? value : feature)
        }));
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={plan ? 'Edit Membership Plan' : 'Create New Plan'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FaTag className="text-primary" />
                        Basic Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Plan Name *</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="e.g., Premium Plan"
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Status</span>
                            </label>
                            <div className="flex items-center gap-3 min-h-[3rem]">
                                <input
                                    type="checkbox"
                                    className="toggle toggle-primary"
                                    checked={formData.isActive}
                                    onChange={(e) => handleChange('isActive', e.target.checked)}
                                />
                                <span className="label-text">
                                    {formData.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Description</span>
                        </label>
                        <textarea
                            className="textarea textarea-bordered h-20 w-full"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Brief description of the plan..."
                        />
                    </div>
                </div>

                {/* Pricing & Duration */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FaRupeeSign className="text-primary" />
                        Pricing & Duration
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Cost (₹) *</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                className="input input-bordered"
                                value={formData.cost}
                                onChange={(e) => handleChange('cost', parseFloat(e.target.value))}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Duration (days) *</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                className="input input-bordered"
                                value={formData.duration}
                                onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                                required
                            />
                        </div>
                    </div>

                    {/* Cost Calculator */}
                    <div className="alert alert-info">
                        <div>
                            <h4 className="font-bold">Cost Breakdown</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                                <div>
                                    <span className="font-medium">Daily: </span>
                                    ₹{Math.round(formData.cost / formData.duration)}
                                </div>
                                <div>
                                    <span className="font-medium">Weekly: </span>
                                    ₹{Math.round((formData.cost / formData.duration) * 7)}
                                </div>
                                <div>
                                    <span className="font-medium">Monthly: </span>
                                    ₹{Math.round((formData.cost / formData.duration) * 30)}
                                </div>
                                <div>
                                    <span className="font-medium">Yearly: </span>
                                    ₹{Math.round((formData.cost / formData.duration) * 365)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <FaCalendarAlt className="text-primary" />
                            Features & Benefits
                        </h3>
                        <button
                            type="button"
                            onClick={addFeature}
                            className="btn btn-sm btn-outline gap-2"
                        >
                            <FaPlus />
                            Add Feature
                        </button>
                    </div>

                    <div className="space-y-3">
                        {formData.features.map((feature, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    className="input input-bordered flex-1"
                                    value={feature}
                                    onChange={(e) => updateFeature(index, e.target.value)}
                                    placeholder="e.g., Gym Access, Personal Trainer, etc."
                                />
                                {formData.features.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeFeature(index)}
                                        className="btn btn-square btn-error btn-outline"
                                    >
                                        <FaTrash />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="text-sm text-base-content/70">
                        <p>💡 Tip: Add features that make this plan attractive to customers</p>
                    </div>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Preview</h3>
                    <div className="card bg-base-200 shadow-lg">
                        <div className="card-body">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="card-title text-xl">{formData.name || 'Plan Name'}</h4>
                                    <p className="text-base-content/70">{formData.description || 'Plan description'}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-primary">₹{formData.cost.toLocaleString()}</div>
                                    <div className="text-sm text-base-content/70">{formData.duration} days</div>
                                </div>
                            </div>

                            {formData.features.filter(f => f.trim()).length > 0 && (
                                <div className="mt-4">
                                    <h5 className="font-semibold mb-2">Features:</h5>
                                    <ul className="list-disc list-inside space-y-1">
                                        {formData.features.filter(f => f.trim()).map((feature, index) => (
                                            <li key={index} className="text-sm">{feature}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex items-center gap-2 mt-4">
                                <span className={`badge ${formData.isActive ? 'badge-success' : 'badge-error'}`}>
                                    {formData.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            </form>

            <Modal.Footer>
                <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-ghost"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    onClick={handleSubmit}
                    className="btn btn-primary gap-2"
                >
                    <FaSave />
                    {plan ? 'Update Plan' : 'Create Plan'}
                </button>
            </Modal.Footer>
        </Modal>
    );
}
