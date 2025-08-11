import React from 'react';
import { AttendanceRecord, Member, FitnessClass } from '../../types';
import { format, parseISO } from 'date-fns';
import logo from '../../assets/logo.png';

interface AttendanceSummaryProps {
  records: AttendanceRecord[];
  members: Member[];
  classes: FitnessClass[];
  dateRange: { start: Date; end: Date };
  reportType: 'member' | 'class';
  selectedEntity?: Member | FitnessClass;
}

export const AttendanceSummary = React.forwardRef<HTMLDivElement, AttendanceSummaryProps>(
  ({ records, members, classes, dateRange, reportType, selectedEntity }, ref) => {
    // Filter records by selected entity if provided
    const filteredRecords = selectedEntity 
      ? records.filter(record => 
          reportType === 'member' 
            ? record.memberId === (selectedEntity as Member).id
            : record.classId === (selectedEntity as FitnessClass).id
        )
      : records;

    // Calculate statistics
    const totalAttendance = filteredRecords.length;
    const presentCount = filteredRecords.filter(r => r.status === 'present').length;
    const absentCount = filteredRecords.filter(r => r.status === 'absent').length;
    const lateCount = filteredRecords.filter(r => r.status === 'late').length;
    const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

    // Group records by date
    const recordsByDate = filteredRecords.reduce((acc, record) => {
      const date = record.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(record);
      return acc;
    }, {} as Record<string, AttendanceRecord[]>);

    const sortedDates = Object.keys(recordsByDate).sort();

    return (
      <div ref={ref} className="print-content">
        <style>{`
          @media print {
            body { margin: 0; padding: 20px; }
            .print-content { 
              width: 210mm; 
              max-width: 210mm;
              margin: 0 auto;
              font-family: Arial, sans-serif;
              background: white;
            }
            .no-print { display: none !important; }
            .page-break { page-break-before: always; }
          }
        `}</style>
        
        {/* Attendance Summary Report */}
        <div className="max-w-4xl mx-auto bg-white">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={logo} alt="Logo" className="w-12 h-12" />
                <div>
                  <h1 className="text-2xl font-bold">Lotus Fitness Center</h1>
                  <p className="text-sm opacity-90">Attendance Summary Report</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Report Generated</p>
                <p className="text-lg font-bold">{format(new Date(), 'MMM dd, yyyy')}</p>
              </div>
            </div>
          </div>

          {/* Report Info */}
          <div className="p-6 bg-gray-50 border-x border-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Report Details</h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="w-24 text-gray-500 text-sm">Period:</span>
                    <span className="font-medium text-gray-900">
                      {format(dateRange.start, 'MMM dd, yyyy')} - {format(dateRange.end, 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-gray-500 text-sm">Type:</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {reportType === 'member' ? 'Member Report' : 'Class Report'}
                    </span>
                  </div>
                  {selectedEntity && (
                    <div className="flex">
                      <span className="w-24 text-gray-500 text-sm">
                        {reportType === 'member' ? 'Member:' : 'Class:'}
                      </span>
                      <span className="font-medium text-gray-900">
                        {selectedEntity.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-2xl font-bold text-green-600">{presentCount}</p>
                    <p className="text-sm text-gray-500">Present</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-2xl font-bold text-yellow-600">{lateCount}</p>
                    <p className="text-sm text-gray-500">Late</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-2xl font-bold text-red-600">{absentCount}</p>
                    <p className="text-sm text-gray-500">Absent</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-2xl font-bold text-blue-600">{attendanceRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-500">Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Records */}
          <div className="p-6 border-x border-b border-gray-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Attendance Records</h3>
            
            {sortedDates.length > 0 ? (
              <div className="space-y-6">
                {sortedDates.map(date => {
                  const dayRecords = recordsByDate[date];
                  const dayDate = parseISO(date);
                  
                  return (
                    <div key={date} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-100 p-3 border-b border-gray-200">
                        <h4 className="font-semibold text-gray-900">
                          {format(dayDate, 'EEEE, MMMM dd, yyyy')}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {dayRecords.length} record{dayRecords.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Time
                              </th>
                              {reportType === 'class' ? (
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Member
                                </th>
                              ) : (
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Class
                                </th>
                              )}
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Notes
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {dayRecords.map(record => {
                              const member = members.find(m => m.id === record.memberId);
                              const fitnessClass = classes.find(c => c.id === record.classId);
                              
                              return (
                                <tr key={record.id}>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                    {record.checkInTime || '--:--'}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                    {reportType === 'class' 
                                      ? (member?.name || 'Unknown Member')
                                      : (fitnessClass?.name || 'Unknown Class')
                                    }
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      record.status === 'present' 
                                        ? 'bg-green-100 text-green-800'
                                        : record.status === 'late'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-500">
                                    {record.notes || '-'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No attendance records found for the selected period.</p>
              </div>
            )}
          </div>

          {/* Entity-specific Summary */}
          {selectedEntity && (
            <div className="p-6 border-x border-b border-gray-300 bg-blue-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {reportType === 'member' ? 'Member Details' : 'Class Details'}
              </h3>
              
              {reportType === 'member' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Name:</strong> {selectedEntity.name}</p>
                    <p><strong>Email:</strong> {(selectedEntity as Member).email}</p>
                    <p><strong>Phone:</strong> {(selectedEntity as Member).phone}</p>
                  </div>
                  <div>
                    <p><strong>Membership:</strong> {(selectedEntity as Member).membershipType}</p>
                    <p><strong>Status:</strong> {(selectedEntity as Member).status}</p>
                    <p><strong>Start Date:</strong> {format(parseISO((selectedEntity as Member).startDate), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Class:</strong> {selectedEntity.name}</p>
                    <p><strong>Instructor:</strong> {(selectedEntity as FitnessClass).instructor}</p>
                    <p><strong>Schedule:</strong> {(selectedEntity as FitnessClass).schedule}</p>
                  </div>
                  <div>
                    <p><strong>Capacity:</strong> {(selectedEntity as FitnessClass).capacity}</p>
                    <p><strong>Enrolled:</strong> {(selectedEntity as FitnessClass).enrolled?.length || 0}</p>
                    {(selectedEntity as FitnessClass).description && (
                      <p><strong>Description:</strong> {(selectedEntity as FitnessClass).description}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="bg-gray-100 p-4 text-center border-x border-b border-gray-300 rounded-b-lg">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Lotus Fitness Center</span>
              <span>Phone: +44 20 1234 5678</span>
              <span>Email: info@lotusfit.co.uk</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This report was generated on {format(new Date(), 'MMMM dd, yyyy \'at\' HH:mm')}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

AttendanceSummary.displayName = 'AttendanceSummary';