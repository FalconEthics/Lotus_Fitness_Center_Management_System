import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiTrash } from 'react-icons/hi2';
import { Button, Input, Badge } from '../ui';
import { Trainer } from '../../types';
import toast from 'react-hot-toast';

interface TrainerFormProps {
  trainer?: Trainer;
  onSubmit: (trainer: Trainer | Omit<Trainer, 'id'>) => void;
  onCancel: () => void;
}

const TRAINER_STATUSES = ['active', 'inactive', 'suspended'] as const;

const COMMON_SPECIALTIES = [
  'Personal Training',
  'Weight Training',
  'Cardio Training',
  'Yoga',
  'Pilates',
  'CrossFit',
  'HIIT',
  'Strength Training',
  'Functional Training',
  'Rehabilitation',
  'Nutrition Coaching',
  'Group Fitness',
  'Boxing',
  'Martial Arts',
  'Dance Fitness',
  'Swimming',
  'Cycling'
];

const COMMON_CERTIFICATIONS = [
  'NASM-CPT',
  'ACE Personal Trainer',
  'ACSM-CPT',
  'NSCA-CPT',
  'ISSA-CPT',
  'RYT-200 (Yoga)',
  'RYT-500 (Yoga)',
  'Pilates Mat Certification',
  'CrossFit Level 1',
  'First Aid/CPR',
  'Nutrition Specialist',
  'Corrective Exercise Specialist'
];

export const TrainerForm: React.FC<TrainerFormProps> = ({
  trainer,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: trainer?.name || '',
    email: trainer?.email || '',
    phone: trainer?.phone || '',
    status: trainer?.status || 'active',
    specialties: trainer?.specialties || [],
    experience: trainer?.experience || 0,
    bio: trainer?.bio || '',
    rating: trainer?.rating || 0,
    hiredDate: trainer?.hiredDate || new Date().toISOString().split('T')[0],
    certifications: trainer?.certifications || []
  });

  const [newSpecialty, setNewSpecialty] = useState('');
  const [newCertification, setNewCertification] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Trainer name is required');
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    
    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }
    
    if (formData.specialties.length === 0) {
      toast.error('At least one specialty is required');
      return;
    }

    const trainerData = {
      ...formData,
      rating: Math.max(0, Math.min(5, formData.rating)) // Ensure rating is between 0-5
    };

    if (trainer) {
      onSubmit({ ...trainerData, id: trainer.id });
    } else {
      onSubmit(trainerData);
    }
    
    toast.success(trainer ? 'Trainer updated successfully!' : 'Trainer added successfully!');
  };

  const addSpecialty = (specialty: string) => {
    const trimmedSpecialty = specialty.trim();
    if (trimmedSpecialty && !formData.specialties.includes(trimmedSpecialty)) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, trimmedSpecialty]
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const addCertification = (certification: string) => {
    const trimmedCert = certification.trim();
    if (trimmedCert && !formData.certifications.includes(trimmedCert)) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, trimmedCert]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (certification: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== certification)
    }));
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
          placeholder="Enter trainer's full name"
        />
        
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
          placeholder="trainer@example.com"
        />
        
        <Input
          label="Phone Number"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          required
          placeholder="+44 7XXX XXXXXX"
        />
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-base-content">
            Status <span className="text-error ml-1">*</span>
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as typeof TRAINER_STATUSES[0] }))}
            className="select select-bordered w-full"
            required
          >
            {TRAINER_STATUSES.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <Input
          label="Years of Experience"
          type="number"
          min="0"
          max="50"
          value={formData.experience}
          onChange={(e) => setFormData(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
          placeholder="0"
        />
        
        <Input
          label="Hired Date"
          type="date"
          value={formData.hiredDate}
          onChange={(e) => setFormData(prev => ({ ...prev, hiredDate: e.target.value }))}
          required
        />
      </div>

      {/* Rating */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-base-content">
          Rating (0-5)
        </label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={formData.rating}
          onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
          className="range range-primary"
        />
        <div className="flex justify-between text-sm text-base-content/60">
          <span>0</span>
          <span className="font-medium">{formData.rating.toFixed(1)}</span>
          <span>5</span>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-base-content">
          Bio
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          rows={3}
          className="textarea textarea-bordered w-full"
          placeholder="Brief description of the trainer's background and approach..."
        />
      </div>

      {/* Specialties */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-base-content">
          Specialties <span className="text-error ml-1">*</span>
        </label>
        
        {/* Current Specialties */}
        <div className="flex flex-wrap gap-2 min-h-[2rem]">
          {formData.specialties.map((specialty) => (
            <Badge
              key={specialty}
              variant="primary"
              className="flex items-center gap-1"
            >
              {specialty}
              <button
                type="button"
                onClick={() => removeSpecialty(specialty)}
                className="ml-1 hover:text-primary-content/70"
              >
                <HiTrash className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {formData.specialties.length === 0 && (
            <span className="text-base-content/40 text-sm">No specialties added yet</span>
          )}
        </div>

        {/* Add Specialty */}
        <div className="flex gap-2">
          <Input
            placeholder="Add custom specialty"
            value={newSpecialty}
            onChange={(e) => setNewSpecialty(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSpecialty(newSpecialty);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => addSpecialty(newSpecialty)}
            disabled={!newSpecialty.trim()}
            icon={<HiPlus className="h-4 w-4" />}
          >
            Add
          </Button>
        </div>

        {/* Common Specialties */}
        <div>
          <p className="text-sm text-base-content/60 mb-2">Quick add common specialties:</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_SPECIALTIES.filter(spec => !formData.specialties.includes(spec)).slice(0, 6).map((specialty) => (
              <Button
                key={specialty}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => addSpecialty(specialty)}
                className="text-xs"
              >
                + {specialty}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-base-content">
          Certifications
        </label>
        
        {/* Current Certifications */}
        <div className="flex flex-wrap gap-2 min-h-[2rem]">
          {formData.certifications.map((certification) => (
            <Badge
              key={certification}
              variant="success"
              className="flex items-center gap-1"
            >
              {certification}
              <button
                type="button"
                onClick={() => removeCertification(certification)}
                className="ml-1 hover:text-success-content/70"
              >
                <HiTrash className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {formData.certifications.length === 0 && (
            <span className="text-base-content/40 text-sm">No certifications added yet</span>
          )}
        </div>

        {/* Add Certification */}
        <div className="flex gap-2">
          <Input
            placeholder="Add custom certification"
            value={newCertification}
            onChange={(e) => setNewCertification(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCertification(newCertification);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => addCertification(newCertification)}
            disabled={!newCertification.trim()}
            icon={<HiPlus className="h-4 w-4" />}
          >
            Add
          </Button>
        </div>

        {/* Common Certifications */}
        <div>
          <p className="text-sm text-base-content/60 mb-2">Quick add common certifications:</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_CERTIFICATIONS.filter(cert => !formData.certifications.includes(cert)).slice(0, 6).map((certification) => (
              <Button
                key={certification}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => addCertification(certification)}
                className="text-xs"
              >
                + {certification}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-base-300">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
        >
          {trainer ? 'Update Trainer' : 'Add Trainer'}
        </Button>
      </div>
    </motion.form>
  );
};