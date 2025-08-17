import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    HiPlus,
    HiMagnifyingGlass,
    HiUsers,
    HiAcademicCap,
    HiStar,
    HiEye
} from 'react-icons/hi2';
import { Button, Input, Card, Badge } from '../../components/ui';
import { StatCard } from '../../components/StatCard';
import { TrainerForm } from '../../components/forms/TrainerForm';
import { TrainerCard } from '../../components/trainers/TrainerCard';
import { Modal } from '../../components/ui/Modal';
import { useDataset, useDatasetDispatch } from '../../contexts/DatasetContext';
import { Trainer } from '../../types';
import { debounce } from 'lodash';

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
};

const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4
};

export function Trainers() {
    const { trainers, classes } = useDataset();
    const dispatch = useDatasetDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);

    // Get unique specialties for filtering
    const specialties = useMemo(() => {
        const allSpecialties = trainers.flatMap(trainer => trainer.expertise || []);
        return Array.from(new Set(allSpecialties)).sort();
    }, [trainers]);

    // Filter trainers based on search and specialty
    const filteredTrainers = useMemo(() => {
        return trainers.filter(trainer => {
            const matchesSearch = trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                trainer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (trainer.expertise || []).some(spec =>
                    spec.toLowerCase().includes(searchTerm.toLowerCase())
                );

            const matchesSpecialty = !selectedSpecialty ||
                (trainer.expertise || []).includes(selectedSpecialty);

            return matchesSearch && matchesSpecialty;
        });
    }, [trainers, searchTerm, selectedSpecialty]);

    // Statistics
    const stats = useMemo(() => {
        const activeTrainers = trainers.filter(t => t.isActive).length;
        const totalClasses = classes.length;
        const avgRating = trainers.length > 0
            ? trainers.reduce((sum, t) => sum + (4.5), 0) / trainers.length  // Default rating since not in interface
            : 0;

        return [
            {
                title: 'Active Trainers',
                value: activeTrainers,
                icon: HiUsers,
                color: 'blue' as const,
                change: { value: 12, type: 'increase' as const, period: 'last month' }
            },
            {
                title: 'Total Classes',
                value: totalClasses,
                icon: HiAcademicCap,
                color: 'green' as const,
                change: { value: 8, type: 'increase' as const, period: 'last month' }
            },
            {
                title: 'Average Rating',
                value: avgRating.toFixed(1),
                icon: HiStar,
                color: 'yellow' as const,
                change: { value: 3, type: 'increase' as const, period: 'last month' }
            },
            {
                title: 'Total Trainers',
                value: trainers.length,
                icon: HiEye,
                color: 'gray' as const,
            }
        ];
    }, [trainers, classes]);

    const debouncedSearch = debounce((value: string) => {
        setSearchTerm(value);
    }, 300);

    const handleAddTrainer = (trainerData: Omit<Trainer, 'id'>) => {
        dispatch({
            type: 'ADD_TRAINER',
            payload: {
                ...trainerData,
                id: Date.now()
            }
        });
        setShowAddModal(false);
    };

    const handleEditTrainer = (trainerData: Trainer) => {
        dispatch({
            type: 'UPDATE_TRAINER',
            payload: trainerData
        });
        setEditingTrainer(null);
    };

    const handleDeleteTrainer = (trainerId: number) => {
        if (confirm('Are you sure you want to delete this trainer?')) {
            dispatch({
                type: 'DELETE_TRAINER',
                payload: trainerId
            });
        }
    };

    return (
        <motion.div
            className="min-h-screen bg-base-100 p-6"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
        >
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-base-content">Trainers</h1>
                        <p className="text-base-content/70">Manage fitness trainers and instructors</p>
                    </div>

                    <Button
                        onClick={() => setShowAddModal(true)}
                        icon={<HiPlus className="h-5 w-5" />}
                        size="lg"
                    >
                        Add Trainer
                    </Button>
                </motion.div>

                {/* Statistics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            className="h-full"
                        >
                            <StatCard {...stat} />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Search trainers by name, email, or specialty..."
                                    startIcon={<HiMagnifyingGlass className="h-5 w-5" />}
                                    onChange={(e) => debouncedSearch(e.target.value)}
                                />
                            </div>

                            <div className="sm:w-64">
                                <select
                                    value={selectedSpecialty}
                                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                                    className="select select-bordered w-full"
                                >
                                    <option value="">All Specialties</option>
                                    {specialties.map(specialty => (
                                        <option key={specialty} value={specialty}>
                                            {specialty}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Filter Summary */}
                        <div className="mt-4 flex items-center gap-4 text-sm text-base-content/60">
                            <span>
                                Showing {filteredTrainers.length} of {trainers.length} trainers
                            </span>
                            {searchTerm && (
                                <Badge variant="outline">
                                    Search: {searchTerm}
                                </Badge>
                            )}
                            {selectedSpecialty && (
                                <Badge variant="outline">
                                    Specialty: {selectedSpecialty}
                                </Badge>
                            )}
                        </div>
                    </Card>
                </motion.div>

                {/* Trainers Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    {filteredTrainers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredTrainers.map((trainer, index) => (
                                <motion.div
                                    key={trainer.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + index * 0.05 }}
                                >
                                    <TrainerCard
                                        trainer={trainer}
                                        onEdit={() => setEditingTrainer(trainer)}
                                        onDelete={() => handleDeleteTrainer(trainer.id)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16"
                        >
                            <HiUsers className="h-16 w-16 text-base-content/30 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-base-content mb-2">
                                {searchTerm || selectedSpecialty ? 'No trainers found' : 'No trainers yet'}
                            </h3>
                            <p className="text-base-content/60">
                                {searchTerm || selectedSpecialty
                                    ? 'Try adjusting your search or filters'
                                    : 'Get started by adding your first trainer'
                                }
                            </p>
                            {!searchTerm && !selectedSpecialty && (
                                <Button
                                    onClick={() => setShowAddModal(true)}
                                    icon={<HiPlus className="h-5 w-5" />}
                                    className="mt-4"
                                >
                                    Add First Trainer
                                </Button>
                            )}
                        </motion.div>
                    )}
                </motion.div>

                {/* Add Trainer Modal */}
                <Modal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    title="Add New Trainer"
                    size="lg"
                >
                    <TrainerForm
                        onSubmit={handleAddTrainer}
                        onCancel={() => setShowAddModal(false)}
                    />
                </Modal>

                {/* Edit Trainer Modal */}
                <Modal
                    isOpen={!!editingTrainer}
                    onClose={() => setEditingTrainer(null)}
                    title="Edit Trainer"
                    size="lg"
                >
                    {editingTrainer && (
                        <TrainerForm
                            trainer={editingTrainer}
                            onSubmit={handleEditTrainer}
                            onCancel={() => setEditingTrainer(null)}
                        />
                    )}
                </Modal>
            </div>
        </motion.div>
    );
}
