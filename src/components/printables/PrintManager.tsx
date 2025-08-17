import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPrinter, HiEye, HiXMark } from 'react-icons/hi2';
import { Button, Modal } from '../ui';
import { MembershipCard } from './MembershipCard';
import { ClassBookingReceipt } from './ClassBookingReceipt';
import { AttendanceSummary } from './AttendanceSummary';
import { Member, FitnessClass, Trainer, AttendanceRecord, MembershipPlan } from '../../types';
import toast from 'react-hot-toast';

export type PrintType = 'membershipCard' | 'classReceipt' | 'attendanceSummary';

interface PrintData {
  membershipCard?: {
    member: Member;
    plan?: MembershipPlan;
  };
  classReceipt?: {
    member: Member;
    fitnessClass: FitnessClass;
    trainer?: Trainer;
    bookingDate?: string;
    receiptNumber?: string;
  };
  attendanceSummary?: {
    records: AttendanceRecord[];
    members: Member[];
    classes: FitnessClass[];
    dateRange: { start: Date; end: Date };
    reportType: 'member' | 'class';
    selectedEntity?: Member | FitnessClass;
  };
}

interface PrintManagerProps {
  type: PrintType;
  data: PrintData;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintManager: React.FC<PrintManagerProps> = ({
  type,
  data,
  isOpen,
  onClose
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const reactToPrintFn = useReactToPrint({
    contentRef: printRef,
    documentTitle: getDocumentTitle(),
    onAfterPrint: () => {
      toast.success('Document printed successfully!');
      onClose();
    },
    onPrintError: (error) => {
      console.error('Print error:', error);
      toast.error('Failed to print document. Please try again.');
    },
    pageStyle: `
      @page {
        margin: 20mm;
        size: A4;
      }
      @media print {
        body { 
          -webkit-print-color-adjust: exact; 
          color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `
  });

  const handlePrint = () => {
    // Check if ref is attached before printing
    if (!printRef.current) {
      console.error('Print ref not attached');
      toast.error('Print content not ready. Please try again.');
      return;
    }
    
    reactToPrintFn();
  };

  function getDocumentTitle(): string {
    switch (type) {
      case 'membershipCard':
        return `Membership_Card_${data.membershipCard?.member.name.replace(/\s+/g, '_')}`;
      case 'classReceipt':
        return `Class_Receipt_${data.classReceipt?.member.name.replace(/\s+/g, '_')}`;
      case 'attendanceSummary':
        return 'Attendance_Summary_Report';
      default:
        return 'Document';
    }
  }

  function renderPrintContent() {
    switch (type) {
      case 'membershipCard':
        if (!data.membershipCard) return null;
        return (
          <MembershipCard
            member={data.membershipCard.member}
            plan={data.membershipCard.plan}
          />
        );
      
      case 'classReceipt':
        if (!data.classReceipt) return null;
        return (
          <ClassBookingReceipt
            member={data.classReceipt.member}
            fitnessClass={data.classReceipt.fitnessClass}
            trainer={data.classReceipt.trainer}
            bookingDate={data.classReceipt.bookingDate}
            receiptNumber={data.classReceipt.receiptNumber}
          />
        );
      
      case 'attendanceSummary':
        if (!data.attendanceSummary) return null;
        return (
          <AttendanceSummary
            records={data.attendanceSummary.records}
            members={data.attendanceSummary.members}
            classes={data.attendanceSummary.classes}
            dateRange={data.attendanceSummary.dateRange}
            reportType={data.attendanceSummary.reportType}
            selectedEntity={data.attendanceSummary.selectedEntity}
          />
        );
      
      default:
        return null;
    }
  }

  function getTitle(): string {
    switch (type) {
      case 'membershipCard':
        return 'Print Membership Card';
      case 'classReceipt':
        return 'Print Class Booking Receipt';
      case 'attendanceSummary':
        return 'Print Attendance Summary';
      default:
        return 'Print Document';
    }
  }

  function getDescription(): string {
    switch (type) {
      case 'membershipCard':
        return data.membershipCard 
          ? `Membership card for ${data.membershipCard.member.name}`
          : 'Membership card';
      case 'classReceipt':
        return data.classReceipt 
          ? `Class booking receipt for ${data.classReceipt.member.name} - ${data.classReceipt.fitnessClass.name}`
          : 'Class booking receipt';
      case 'attendanceSummary':
        return data.attendanceSummary
          ? `Attendance summary report (${data.attendanceSummary.records.length} records)`
          : 'Attendance summary report';
      default:
        return 'Document preview and printing';
    }
  }

  return (
    <>
      {/* Print Modal */}
      <Modal
        isOpen={isOpen && !showPreview}
        onClose={onClose}
        title={getTitle()}
        size="md"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiPrinter className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-base-content mb-2">
              Ready to Print
            </h3>
            <p className="text-base-content/70">
              {getDescription()}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
              icon={<HiEye className="h-4 w-4" />}
            >
              Preview
            </Button>
            <Button
              variant="primary"
              onClick={handlePrint}
              icon={<HiPrinter className="h-4 w-4" />}
            >
              Print Now
            </Button>
          </div>

          <div className="pt-4 border-t border-base-300">
            <div className="flex items-center justify-end">
              <Button
                variant="ghost"
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      </Modal>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-base-100 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              {/* Preview Header */}
              <div className="flex items-center justify-between p-4 border-b border-base-300">
                <div>
                  <h3 className="text-lg font-semibold text-base-content">
                    Print Preview
                  </h3>
                  <p className="text-sm text-base-content/60">
                    {getDescription()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    onClick={handlePrint}
                    icon={<HiPrinter className="h-4 w-4" />}
                  >
                    Print
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowPreview(false)}
                    icon={<HiXMark className="h-4 w-4" />}
                  />
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-4 overflow-auto max-h-[calc(90vh-200px)]">
                <div className="transform scale-75 origin-top-left w-[133.33%] h-[133.33%] border border-base-300 bg-white shadow-lg">
                  {renderPrintContent()}
                </div>
              </div>

              {/* Preview Footer */}
              <div className="p-4 border-t border-base-300 bg-base-50">
                <div className="flex items-center justify-between text-sm text-base-content/60">
                  <span>Preview scaled to 75% for display</span>
                  <span>Actual print will be full size</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden print content - use visibility instead of display:none so DOM elements exist */}
      <div ref={printRef} style={{ position: 'absolute', left: '-9999px', visibility: 'hidden' }}>
        {renderPrintContent()}
      </div>
    </>
  );
};

// Utility functions for easy printing
export const usePrintManager = () => {
  const [printConfig, setPrintConfig] = useState<{
    isOpen: boolean;
    type: PrintType;
    data: PrintData;
  }>({
    isOpen: false,
    type: 'membershipCard',
    data: {}
  });

  const printMembershipCard = (member: Member, plan?: MembershipPlan) => {
    setPrintConfig({
      isOpen: true,
      type: 'membershipCard',
      data: { membershipCard: { member, plan } }
    });
  };

  const printClassReceipt = (
    member: Member, 
    fitnessClass: FitnessClass, 
    trainer?: Trainer,
    bookingDate?: string,
    receiptNumber?: string
  ) => {
    setPrintConfig({
      isOpen: true,
      type: 'classReceipt',
      data: { 
        classReceipt: { 
          member, 
          fitnessClass, 
          trainer, 
          bookingDate,
          receiptNumber
        }
      }
    });
  };

  const printAttendanceSummary = (
    records: AttendanceRecord[],
    members: Member[],
    classes: FitnessClass[],
    dateRange: { start: Date; end: Date },
    reportType: 'member' | 'class',
    selectedEntity?: Member | FitnessClass
  ) => {
    setPrintConfig({
      isOpen: true,
      type: 'attendanceSummary',
      data: {
        attendanceSummary: {
          records,
          members,
          classes,
          dateRange,
          reportType,
          selectedEntity
        }
      }
    });
  };

  const closePrintManager = () => {
    setPrintConfig(prev => ({ ...prev, isOpen: false }));
  };

  return {
    printConfig,
    printMembershipCard,
    printClassReceipt,
    printAttendanceSummary,
    closePrintManager,
    PrintManagerComponent: () => (
      <PrintManager
        type={printConfig.type}
        data={printConfig.data}
        isOpen={printConfig.isOpen}
        onClose={closePrintManager}
      />
    )
  };
};