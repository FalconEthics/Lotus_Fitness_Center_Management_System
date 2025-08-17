import * as XLSX from 'xlsx';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { Dataset } from '../types';
import { ReportOption } from '../components/reports/ReportGenerationModal';

interface DateRange {
  start: string;
  end: string;
}

export const exportToExcel = async (
  reportOption: ReportOption, 
  dataset: Dataset, 
  dateRange: DateRange
): Promise<void> => {
  const workbook = XLSX.utils.book_new();
  
  try {
    switch (reportOption.id) {
      case 'members-full':
        await generateMembersFullReport(workbook, dataset);
        break;
      case 'members-active':
        await generateMembersActiveReport(workbook, dataset);
        break;
      case 'members-expiring':
        await generateMembersExpiringReport(workbook, dataset);
        break;
      case 'attendance-monthly':
        await generateAttendanceMonthlyReport(workbook, dataset, dateRange);
        break;
      case 'attendance-member-wise':
        await generateAttendanceMemberWiseReport(workbook, dataset, dateRange);
        break;
      case 'classes-schedule':
        await generateClassesScheduleReport(workbook, dataset);
        break;
      case 'classes-popular':
        await generateClassesPopularityReport(workbook, dataset);
        break;
      case 'trainers-report':
        await generateTrainersReport(workbook, dataset);
        break;
      case 'revenue-analysis':
        await generateRevenueAnalysisReport(workbook, dataset);
        break;
      default:
        throw new Error(`Unknown report type: ${reportOption.id}`);
    }

    // Generate filename with timestamp
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
    const filename = `${reportOption.name.replace(/\s+/g, '_')}_${timestamp}.xlsx`;
    
    // Save the file
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error(`Error generating ${reportOption.name}:`, error);
    throw error;
  }
};

// Helper function to get membership plan name
const getMembershipPlanName = (planId: number, dataset: Dataset): string => {
  const plan = dataset.membershipPlans.find(p => p.id === planId);
  return plan?.name || 'Unknown Plan';
};

// Helper function to get trainer name
const getTrainerName = (trainerId: number, dataset: Dataset): string => {
  const trainer = dataset.trainers.find(t => t.id === trainerId);
  return trainer?.name || 'Unknown Trainer';
};

// Helper function to get member name
const getMemberName = (memberId: number, dataset: Dataset): string => {
  const member = dataset.members.find(m => m.id === memberId);
  return member?.name || 'Unknown Member';
};

// Helper function to get class name
const getClassName = (classId: number, dataset: Dataset): string => {
  const fitnessClass = dataset.classes.find(c => c.id === classId);
  return fitnessClass?.name || 'Unknown Class';
};

// Helper function to filter by date range
const isWithinDateRange = (date: string, range: DateRange): boolean => {
  const checkDate = parseISO(date);
  const startDate = parseISO(range.start);
  const endDate = parseISO(range.end);
  
  return (isAfter(checkDate, startDate) || checkDate.getTime() === startDate.getTime()) &&
         (isBefore(checkDate, endDate) || checkDate.getTime() === endDate.getTime());
};

const generateMembersFullReport = async (workbook: XLSX.WorkBook, dataset: Dataset) => {
  const members = dataset.members.map(member => ({
    'Member ID': member.id,
    'Name': member.name,
    'Email': member.email,
    'Phone': member.phone,
    'Age': member.age,
    'Gender': member.gender,
    'Membership Plan': getMembershipPlanName(member.membershipPlanId, dataset),
    'Start Date': member.startDate,
    'End Date': member.endDate,
    'Status': member.status,
    'Renewal Count': member.renewalCount || 0,
    'Last Renewal': member.lastRenewalDate || 'N/A'
  }));

  const worksheet = XLSX.utils.json_to_sheet(members);
  
  // Auto-size columns
  const colWidths = Object.keys(members[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  worksheet['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Complete Members');
};

const generateMembersActiveReport = async (workbook: XLSX.WorkBook, dataset: Dataset) => {
  const activeMembers = dataset.members
    .filter(member => member.status === 'Active')
    .map(member => ({
      'Member ID': member.id,
      'Name': member.name,
      'Email': member.email,
      'Phone': member.phone,
      'Age': member.age,
      'Gender': member.gender,
      'Membership Plan': getMembershipPlanName(member.membershipPlanId, dataset),
      'Start Date': member.startDate,
      'End Date': member.endDate,
      'Renewal Count': member.renewalCount || 0
    }));

  const worksheet = XLSX.utils.json_to_sheet(activeMembers);
  
  const colWidths = Object.keys(activeMembers[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  worksheet['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Active Members');
};

const generateMembersExpiringReport = async (workbook: XLSX.WorkBook, dataset: Dataset) => {
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const expiringMembers = dataset.members
    .filter(member => {
      const endDate = parseISO(member.endDate);
      return isAfter(endDate, today) && isBefore(endDate, nextMonth);
    })
    .map(member => {
      const endDate = parseISO(member.endDate);
      const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        'Member ID': member.id,
        'Name': member.name,
        'Email': member.email,
        'Phone': member.phone,
        'Membership Plan': getMembershipPlanName(member.membershipPlanId, dataset),
        'End Date': member.endDate,
        'Days Until Expiry': daysUntilExpiry,
        'Status': member.status
      };
    })
    .sort((a, b) => a['Days Until Expiry'] - b['Days Until Expiry']);

  const worksheet = XLSX.utils.json_to_sheet(expiringMembers);
  
  const colWidths = Object.keys(expiringMembers[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  worksheet['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Expiring Memberships');
};

const generateAttendanceMonthlyReport = async (workbook: XLSX.WorkBook, dataset: Dataset, dateRange: DateRange) => {
  const attendanceRecords = dataset.attendance
    .filter(record => isWithinDateRange(record.date, dateRange))
    .map(record => ({
      'Date': record.date,
      'Member Name': getMemberName(record.memberId, dataset),
      'Member ID': record.memberId,
      'Class Name': getClassName(record.classId, dataset),
      'Class ID': record.classId,
      'Status': record.status,
      'Check-in Time': record.checkedInAt ? format(parseISO(record.checkedInAt), 'HH:mm:ss') : 'N/A'
    }))
    .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());

  const worksheet = XLSX.utils.json_to_sheet(attendanceRecords);
  
  const colWidths = Object.keys(attendanceRecords[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  worksheet['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Monthly Attendance');
};

const generateAttendanceMemberWiseReport = async (workbook: XLSX.WorkBook, dataset: Dataset, dateRange: DateRange) => {
  const attendanceByMember = dataset.members.map(member => {
    const memberAttendance = dataset.attendance.filter(record => 
      record.memberId === member.id && isWithinDateRange(record.date, dateRange)
    );
    
    const presentCount = memberAttendance.filter(record => record.status === 'Present').length;
    const absentCount = memberAttendance.filter(record => record.status === 'Absent').length;
    const lateCount = memberAttendance.filter(record => record.status === 'Late').length;
    const totalClasses = memberAttendance.length;
    const attendanceRate = totalClasses > 0 ? ((presentCount + lateCount) / totalClasses * 100).toFixed(1) : '0';

    return {
      'Member ID': member.id,
      'Member Name': member.name,
      'Email': member.email,
      'Membership Plan': getMembershipPlanName(member.membershipPlanId, dataset),
      'Total Classes': totalClasses,
      'Present': presentCount,
      'Late': lateCount,
      'Absent': absentCount,
      'Attendance Rate (%)': attendanceRate,
      'Status': member.status
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(attendanceByMember);
  
  const colWidths = Object.keys(attendanceByMember[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  worksheet['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Member-wise Attendance');
};

const generateClassesScheduleReport = async (workbook: XLSX.WorkBook, dataset: Dataset) => {
  const classSchedule = dataset.classes.map(fitnessClass => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return {
      'Class ID': fitnessClass.id,
      'Class Name': fitnessClass.name,
      'Trainer': getTrainerName(fitnessClass.trainerId, dataset),
      'Day of Week': dayNames[fitnessClass.schedule.dayOfWeek],
      'Start Time': fitnessClass.schedule.startTime,
      'End Time': fitnessClass.schedule.endTime,
      'Duration (minutes)': fitnessClass.schedule.duration,
      'Capacity': fitnessClass.capacity,
      'Current Enrollment': fitnessClass.enrolled.length,
      'Available Spots': fitnessClass.capacity - fitnessClass.enrolled.length,
      'Description': fitnessClass.description || 'N/A'
    };
  }).sort((a, b) => a['Day of Week'].localeCompare(b['Day of Week']) || a['Start Time'].localeCompare(b['Start Time']));

  const worksheet = XLSX.utils.json_to_sheet(classSchedule);
  
  const colWidths = Object.keys(classSchedule[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  worksheet['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Class Schedule');
};

const generateClassesPopularityReport = async (workbook: XLSX.WorkBook, dataset: Dataset) => {
  const classPopularity = dataset.classes.map(fitnessClass => {
    const enrollmentCount = fitnessClass.enrolled.length;
    const capacityUtilization = fitnessClass.capacity > 0 ? (enrollmentCount / fitnessClass.capacity * 100).toFixed(1) : '0';
    const attendanceRecords = dataset.attendance.filter(record => record.classId === fitnessClass.id);
    const totalAttendance = attendanceRecords.filter(record => record.status === 'Present' || record.status === 'Late').length;
    
    return {
      'Class Name': fitnessClass.name,
      'Trainer': getTrainerName(fitnessClass.trainerId, dataset),
      'Capacity': fitnessClass.capacity,
      'Current Enrollment': enrollmentCount,
      'Capacity Utilization (%)': capacityUtilization,
      'Total Attendance Records': attendanceRecords.length,
      'Successful Attendance': totalAttendance,
      'Attendance Rate (%)': attendanceRecords.length > 0 ? (totalAttendance / attendanceRecords.length * 100).toFixed(1) : '0',
      'Popularity Rank': 0 // Will be filled after sorting
    };
  }).sort((a, b) => parseFloat(b['Capacity Utilization (%)']) - parseFloat(a['Capacity Utilization (%)']));

  // Add popularity ranking
  classPopularity.forEach((item, index) => {
    item['Popularity Rank'] = index + 1;
  });

  const worksheet = XLSX.utils.json_to_sheet(classPopularity);
  
  const colWidths = Object.keys(classPopularity[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  worksheet['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Class Popularity');
};

const generateTrainersReport = async (workbook: XLSX.WorkBook, dataset: Dataset) => {
  const trainersData = dataset.trainers.map(trainer => {
    const assignedClasses = dataset.classes.filter(c => c.trainerId === trainer.id);
    const totalStudents = assignedClasses.reduce((sum, c) => sum + c.enrolled.length, 0);
    const totalCapacity = assignedClasses.reduce((sum, c) => sum + c.capacity, 0);
    const utilizationRate = totalCapacity > 0 ? (totalStudents / totalCapacity * 100).toFixed(1) : '0';

    return {
      'Trainer ID': trainer.id,
      'Name': trainer.name,
      'Email': trainer.email,
      'Phone': trainer.phone,
      'Expertise': trainer.expertise.join(', '),
      'Certifications': trainer.certifications.join(', '),
      'Experience (years)': trainer.experience || 'N/A',
      'Hourly Rate (₹)': trainer.hourlyRate || 'N/A',
      'Hired Date': trainer.hiredDate || 'N/A',
      'Rating': trainer.rating || 'N/A',
      'Classes Assigned': assignedClasses.length,
      'Total Students': totalStudents,
      'Total Capacity': totalCapacity,
      'Utilization Rate (%)': utilizationRate,
      'Status': trainer.isActive ? 'Active' : 'Inactive',
      'Bio': trainer.bio || 'N/A'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(trainersData);
  
  const colWidths = Object.keys(trainersData[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  worksheet['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Trainers Report');
};

const generateRevenueAnalysisReport = async (workbook: XLSX.WorkBook, dataset: Dataset) => {
  const revenueByPlan = dataset.membershipPlans.map(plan => {
    const membersWithPlan = dataset.members.filter(member => member.membershipPlanId === plan.id);
    const activeMembers = membersWithPlan.filter(member => member.status === 'Active');
    const totalRevenue = activeMembers.length * plan.cost;
    const renewalRevenue = membersWithPlan.reduce((sum, member) => sum + (member.renewalCount || 0) * plan.cost, 0);

    return {
      'Plan Name': plan.name,
      'Plan Cost (₹)': plan.cost,
      'Duration (months)': plan.duration,
      'Total Members': membersWithPlan.length,
      'Active Members': activeMembers.length,
      'Monthly Revenue (₹)': totalRevenue,
      'Renewal Revenue (₹)': renewalRevenue,
      'Total Revenue (₹)': totalRevenue + renewalRevenue,
      'Features': plan.features.join(', '),
      'Status': plan.isActive ? 'Active' : 'Inactive'
    };
  });

  const totalRevenue = revenueByPlan.reduce((sum, plan) => sum + plan['Total Revenue (₹)'], 0);
  
  // Add summary row
  const summaryData = [
    ...revenueByPlan,
    {},  // Empty row for separation
    {
      'Plan Name': 'TOTAL REVENUE',
      'Plan Cost (₹)': '',
      'Duration (months)': '',
      'Total Members': dataset.members.length,
      'Active Members': dataset.members.filter(m => m.status === 'Active').length,
      'Monthly Revenue (₹)': '',
      'Renewal Revenue (₹)': '',
      'Total Revenue (₹)': totalRevenue,
      'Features': '',
      'Status': ''
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(summaryData);
  
  const colWidths = Object.keys(revenueByPlan[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  worksheet['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Revenue Analysis');
};