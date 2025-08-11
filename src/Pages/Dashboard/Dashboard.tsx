import { motion } from 'framer-motion';
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
import { useDataset, saveDataToLocalStorage, exportDataAsJSON } from '../../contexts/DatasetContext';
import { StatCard } from '../../Reusable_Components/StatCard';
import { ExpiringMembershipsAlert } from '../../components/alerts/ExpiringMembershipsAlert';
import { MembershipAnalytics } from '../../components/analytics/MembershipAnalytics';

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
  const dataset = useDataset();
  const stats = useDashboardStats();
  const memberStats = useMemberStatistics();

  const handleManualSave = () => {
    saveDataToLocalStorage(dataset);
    toast.success('Data saved successfully!');
  };

  const handleExportData = () => {
    exportDataAsJSON(dataset);
    toast.success('Data exported successfully!');
  };

  return (
    <motion.div
      className="min-h-screen bg-base-100 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">Dashboard</h1>
            <p className="text-base-content/70">Welcome to Lotus Fitness Center Management</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <button
              onClick={handleManualSave}
              className="btn btn-outline btn-sm gap-2"
            >
              <FaSave className="h-4 w-4" />
              Save Data
            </button>
            <button
              onClick={handleExportData}
              className="btn btn-primary btn-sm gap-2"
            >
              <FaDownload className="h-4 w-4" />
              Export
            </button>
          </div>
        </motion.div>

        {/* Key Statistics Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Membership Distribution Pie Chart */}
          <motion.div variants={itemVariants} className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">Membership Distribution</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.membershipDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
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
              <h2 className="card-title text-xl mb-4">Attendance Trend (7 Days)</h2>
              <div className="h-64">
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
                      strokeWidth={2}
                      dot={{ fill: '#8884d8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Class Popularity Bar Chart */}
          <motion.div variants={itemVariants} className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">Most Popular Classes</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.classPopularity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value">
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
              <h2 className="card-title text-xl mb-4">Revenue by Plan (Monthly)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.revenueByPlan}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="value">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Age Distribution */}
          <motion.div variants={itemVariants} className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">Age Distribution</h2>
              <div className="space-y-3">
                {Object.entries(memberStats.ageGroups).map(([ageGroup, count]) => (
                  <div key={ageGroup} className="flex justify-between items-center">
                    <span className="font-medium">{ageGroup}</span>
                    <span className="badge badge-primary">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Gender Distribution */}
          <motion.div variants={itemVariants} className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">Gender Distribution</h2>
              <div className="space-y-3">
                {Object.entries(memberStats.genderDistribution).map(([gender, count]) => (
                  <div key={gender} className="flex justify-between items-center">
                    <span className="font-medium">{gender}</span>
                    <span className="badge badge-secondary">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Status Distribution */}
          <motion.div variants={itemVariants} className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">Member Status</h2>
              <div className="space-y-3">
                {Object.entries(memberStats.statusDistribution).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="font-medium">{status}</span>
                    <span className={`badge ${
                      status === 'Active' ? 'badge-success' :
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
        <motion.div variants={itemVariants}>
          <ExpiringMembershipsAlert />
        </motion.div>

        {/* Enhanced Membership Analytics */}
        <motion.div variants={itemVariants}>
          <MembershipAnalytics />
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="btn btn-outline">
                Add New Member
              </button>
              <button className="btn btn-outline">
                Schedule Class
              </button>
              <button className="btn btn-outline">
                Mark Attendance
              </button>
              <button className="btn btn-outline">
                Generate Report
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}