import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaFileExcel, 
  FaUsers, 
  FaDumbbell, 
  FaCalendarCheck, 
  FaUserTie,
  FaCreditCard,
  FaChartLine,
  FaDownload
} from 'react-icons/fa';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useDataset } from '../../contexts/DatasetContext';
import { exportToExcel } from '../../utils/reportExporter';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface ReportGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ReportOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  type: 'members' | 'attendance' | 'classes' | 'trainers' | 'revenue' | 'analytics';
}

const reportOptions: ReportOption[] = [
  {
    id: 'members-full',
    name: 'Complete Member Report',
    description: 'Full member database with all details, membership status, and contact information',
    icon: FaUsers,
    color: 'text-primary',
    type: 'members'
  },
  {
    id: 'members-active',
    name: 'Active Members Only',
    description: 'Only currently active members with valid memberships',
    icon: FaUsers,
    color: 'text-success',
    type: 'members'
  },
  {
    id: 'members-expiring',
    name: 'Expiring Memberships',
    description: 'Members whose memberships are expiring soon',
    icon: FaUsers,
    color: 'text-warning',
    type: 'members'
  },
  {
    id: 'attendance-monthly',
    name: 'Monthly Attendance Report',
    description: 'Detailed attendance records for the current month',
    icon: FaCalendarCheck,
    color: 'text-info',
    type: 'attendance'
  },
  {
    id: 'attendance-member-wise',
    name: 'Member-wise Attendance',
    description: 'Attendance summary for each member',
    icon: FaCalendarCheck,
    color: 'text-secondary',
    type: 'attendance'
  },
  {
    id: 'classes-schedule',
    name: 'Class Schedule Report',
    description: 'Complete class timetable with trainer assignments and enrollment',
    icon: FaDumbbell,
    color: 'text-accent',
    type: 'classes'
  },
  {
    id: 'classes-popular',
    name: 'Class Popularity Analysis',
    description: 'Most and least popular classes with enrollment statistics',
    icon: FaChartLine,
    color: 'text-primary',
    type: 'analytics'
  },
  {
    id: 'trainers-report',
    name: 'Trainers Performance Report',
    description: 'Trainer details, assigned classes, and performance metrics',
    icon: FaUserTie,
    color: 'text-info',
    type: 'trainers'
  },
  {
    id: 'revenue-analysis',
    name: 'Revenue Analysis',
    description: 'Income breakdown by membership plans and payment analysis',
    icon: FaCreditCard,
    color: 'text-success',
    type: 'revenue'
  }
];

export const ReportGenerationModal: React.FC<ReportGenerationModalProps> = ({
  isOpen,
  onClose
}) => {
  const dataset = useDataset();
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  const handleReportToggle = (reportId: string) => {
    setSelectedReports(prev => 
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleSelectAll = () => {
    setSelectedReports(reportOptions.map(option => option.id));
  };

  const handleClearAll = () => {
    setSelectedReports([]);
  };

  const handleGenerateReports = async () => {
    if (selectedReports.length === 0) {
      toast.error('Please select at least one report to generate');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Generate each selected report
      for (const reportId of selectedReports) {
        const reportOption = reportOptions.find(option => option.id === reportId);
        if (reportOption) {
          await exportToExcel(reportOption, dataset, dateRange);
        }
      }
      
      toast.success(`Successfully generated ${selectedReports.length} report(s)`);
      onClose();
      setSelectedReports([]);
    } catch (error) {
      console.error('Error generating reports:', error);
      toast.error('Failed to generate reports. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const groupedReports = reportOptions.reduce((groups, report) => {
    const category = report.type;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(report);
    return groups;
  }, {} as Record<string, ReportOption[]>);

  const categoryTitles = {
    members: 'Member Reports',
    attendance: 'Attendance Reports', 
    classes: 'Class Reports',
    trainers: 'Trainer Reports',
    revenue: 'Financial Reports',
    analytics: 'Analytics Reports'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Reports"
      description="Select the reports you want to generate and export to Excel"
      size="xl"
    >
      <div className="space-y-6">
        {/* Date Range Selection */}
        <div className="bg-base-200 rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FaCalendarCheck className="text-primary" />
            Date Range (for time-based reports)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Start Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">End Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Selection Controls */}
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
            >
              Clear All
            </Button>
          </div>
          <div className="text-sm text-base-content/70">
            {selectedReports.length} report(s) selected
          </div>
        </div>

        {/* Report Options */}
        <div className="space-y-6">
          {Object.entries(groupedReports).map(([category, reports]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-semibold text-primary border-b border-base-300 pb-2">
                {categoryTitles[category as keyof typeof categoryTitles]}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reports.map((report) => (
                  <motion.div
                    key={report.id}
                    className={`card bg-base-200 cursor-pointer transition-all duration-200 ${
                      selectedReports.includes(report.id)
                        ? 'ring-2 ring-primary bg-primary/10'
                        : 'hover:bg-base-300'
                    }`}
                    onClick={() => handleReportToggle(report.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="card-body p-4">
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 ${report.color}`}>
                          <report.icon className="text-xl" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-base">{report.name}</h4>
                          <p className="text-sm text-base-content/70 mt-1">{report.description}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary"
                            checked={selectedReports.includes(report.id)}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal.Footer>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isGenerating}
        >
          Cancel
        </Button>
        <Button
          onClick={handleGenerateReports}
          disabled={selectedReports.length === 0 || isGenerating}
          loading={isGenerating}
          icon={<FaDownload />}
        >
          {isGenerating ? 'Generating...' : `Generate ${selectedReports.length > 0 ? selectedReports.length : ''} Report(s)`}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};