import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
    FaUsers,
    FaDumbbell,
    FaChartLine,
    FaCalendarCheck,
    FaUserTie,
    FaExclamationTriangle,
    FaDownload,
    FaSave
} from 'react-icons/fa';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import toast from 'react-hot-toast';
import { useDashboardStats, useMemberStatistics } from '../../hooks/useDashboardStats';
import { useDataset } from '../../contexts/DatasetContext';
import { StatCard } from '../../components/StatCard';
import { ExpiringMembershipsAlert } from '../../components/alerts/ExpiringMembershipsAlert';
import { MembershipAnalytics } from '../../components/analytics/MembershipAnalytics';
import { ReportGenerationModal } from '../../components/reports/ReportGenerationModal';
import { getCurrentUsername } from '../../utils/auth';

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

export function Dashboard(): JSX.Element {
    const navigate = useNavigate();
    const dataset = useDataset();
    const stats = useDashboardStats();
    const memberStats = useMemberStatistics();
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const handleQuickAction = (action: string) => {
        switch (action) {
            case 'add-member':
                navigate('/managemembers');
                toast.success('Navigating to Member Management');
                break;
            case 'schedule-class':
                navigate('/manageclasses');
                toast.success('Navigating to Class Management');
                break;
            case 'mark-attendance':
                navigate('/attendance');
                toast.success('Navigating to Attendance Tracking');
                break;
            case 'generate-report':
                setIsReportModalOpen(true);
                break;
            default:
                toast.error('Action not implemented yet');
        }
    };

    return (
        <motion.div
            className="min-h-screen bg-base-100 p-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
                    <div className="space-y-2">
                        <h1 className="text-5xl font-bold text-primary">Dashboard</h1>
                        <p className="text-lg text-base-content/70">Welcome to Lotus Fitness Center Management</p>
                        <p className="text-sm text-base-content/50">
                            Logged in as: <span className="font-medium text-primary">{getCurrentUsername()}</span>
                        </p>
                    </div>
                </motion.div>

                {/* Key Statistics Cards */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        icon={FaUsers}
                        title="Total Members"
                        value={stats.totalMembers}
                        className="bg-primary text-primary-content"
                    />
                    <StatCard
                        icon={FaUsers}
                        title="Active Members"
                        value={stats.activeMembers}
                        className="bg-success text-success-content"
                    />
                    <StatCard
                        icon={FaExclamationTriangle}
                        title="Expiring Soon"
                        value={stats.expiringMembers}
                        className="bg-warning text-warning-content"
                    />
                    <StatCard
                        icon={FaDumbbell}
                        title="Classes"
                        value={stats.totalClasses}
                        className="bg-secondary text-secondary-content"
                    />
                    <StatCard
                        icon={FaUserTie}
                        title="Trainers"
                        value={stats.totalTrainers}
                        className="bg-info text-info-content"
                    />
                    <StatCard
                        icon={FaCalendarCheck}
                        title="Today's Attendance"
                        value={stats.todayAttendance}
                        className="bg-accent text-accent-content"
                    />
                </motion.div>

                {/* Primary Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Membership Distribution Pie Chart */}
                    <motion.div variants={itemVariants} className="card bg-base-200 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title text-xl mb-6">Membership Distribution</h2>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.membershipDistribution}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={90}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {stats.membershipDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>

                    {/* Attendance Trend Line Chart */}
                    <motion.div variants={itemVariants} className="card bg-base-200 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title text-xl mb-6">Attendance Trend (7 Days)</h2>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats.attendanceTrend}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#8884d8"
                                            strokeWidth={3}
                                            dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Secondary Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Class Popularity Bar Chart */}
                    <motion.div variants={itemVariants} className="card bg-base-200 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title text-xl mb-6">Most Popular Classes</h2>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.classPopularity} margin={{ bottom: 60 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="name"
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                            interval={0}
                                        />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {stats.classPopularity.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>

                    {/* Revenue by Plan */}
                    <motion.div variants={itemVariants} className="card bg-base-200 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title text-xl mb-6">Revenue by Plan (Monthly)</h2>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.revenueByPlan}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                        />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {stats.revenueByPlan.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Additional Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Age Distribution */}
                    <motion.div variants={itemVariants} className="card bg-base-200 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title text-xl mb-6">Age Distribution</h2>
                            <div className="space-y-4">
                                {Object.entries(memberStats.ageGroups).map(([ageGroup, count]) => (
                                    <div key={ageGroup} className="flex justify-between items-center p-2 rounded-lg bg-base-100">
                                        <span className="font-medium text-base">{ageGroup}</span>
                                        <span className="badge badge-primary badge-lg">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Gender Distribution */}
                    <motion.div variants={itemVariants} className="card bg-base-200 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title text-xl mb-6">Gender Distribution</h2>
                            <div className="space-y-4">
                                {Object.entries(memberStats.genderDistribution).map(([gender, count]) => (
                                    <div key={gender} className="flex justify-between items-center p-2 rounded-lg bg-base-100">
                                        <span className="font-medium text-base">{gender}</span>
                                        <span className="badge badge-secondary badge-lg">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Status Distribution */}
                    <motion.div variants={itemVariants} className="card bg-base-200 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title text-xl mb-6">Member Status</h2>
                            <div className="space-y-4">
                                {Object.entries(memberStats.statusDistribution).map(([status, count]) => (
                                    <div key={status} className="flex justify-between items-center p-2 rounded-lg bg-base-100">
                                        <span className="font-medium text-base">{status}</span>
                                        <span className={`badge badge-lg ${status === 'Active' ? 'badge-success' :
                                            status === 'Expired' ? 'badge-error' :
                                                status === 'Trial' ? 'badge-info' :
                                                    'badge-warning'
                                            }`}>
                                            {count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Expiring Memberships Alert */}
                <motion.div variants={itemVariants} className="mb-8">
                    <ExpiringMembershipsAlert />
                </motion.div>

                {/* Enhanced Membership Analytics */}
                <motion.div variants={itemVariants} className="mb-8">
                    <MembershipAnalytics />
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants} className="card bg-base-200 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-xl mb-6">Quick Actions</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <button
                                className="btn btn-outline btn-lg h-16 flex-col gap-2 hover:btn-primary transition-colors"
                                onClick={() => handleQuickAction('add-member')}
                            >
                                <FaUsers className="text-lg" />
                                <span className="text-sm">Add New Member</span>
                            </button>
                            <button
                                className="btn btn-outline btn-lg h-16 flex-col gap-2 hover:btn-secondary transition-colors"
                                onClick={() => handleQuickAction('schedule-class')}
                            >
                                <FaDumbbell className="text-lg" />
                                <span className="text-sm">Schedule Class</span>
                            </button>
                            <button
                                className="btn btn-outline btn-lg h-16 flex-col gap-2 hover:btn-accent transition-colors"
                                onClick={() => handleQuickAction('mark-attendance')}
                            >
                                <FaCalendarCheck className="text-lg" />
                                <span className="text-sm">Mark Attendance</span>
                            </button>
                            <button
                                className="btn btn-outline btn-lg h-16 flex-col gap-2 hover:btn-info transition-colors"
                                onClick={() => handleQuickAction('generate-report')}
                            >
                                <FaChartLine className="text-lg" />
                                <span className="text-sm">Generate Report</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Report Generation Modal */}
            <ReportGenerationModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
            />
        </motion.div>
    );
}
