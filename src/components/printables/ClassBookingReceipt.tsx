import React from 'react';
import { Member, FitnessClass, Trainer } from '../../types';
import { format } from 'date-fns';
import logo from '../../assets/logo.png';

interface ClassBookingReceiptProps {
  member: Member;
  fitnessClass: FitnessClass;
  trainer?: Trainer;
  bookingDate?: string;
  receiptNumber?: string;
}

export const ClassBookingReceipt: React.FC<ClassBookingReceiptProps> = ({ member, fitnessClass, trainer, bookingDate = format(new Date(), 'yyyy-MM-dd'), receiptNumber }) => {
    const generatedReceiptNumber = receiptNumber || `LFC-${Date.now().toString().slice(-6)}`;
    
    return (
      <div className="print-content">
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
          }
        `}</style>
        
        {/* Receipt */}
        <div className="max-w-2xl mx-auto bg-white border border-gray-300 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={logo} alt="Logo" className="w-12 h-12" />
                <div>
                  <h1 className="text-2xl font-bold">Lotus Fitness Center</h1>
                  <p className="text-sm opacity-90">Class Booking Receipt</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Receipt #</p>
                <p className="text-lg font-bold">{generatedReceiptNumber}</p>
              </div>
            </div>
          </div>

          {/* Receipt Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Member Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                  Member Information
                </h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="w-20 text-gray-500 text-sm">Name:</span>
                    <span className="font-medium text-gray-900">{member.name}</span>
                  </div>
                  <div className="flex">
                    <span className="w-20 text-gray-500 text-sm">ID:</span>
                    <span className="font-medium text-gray-900">{member.id}</span>
                  </div>
                  <div className="flex">
                    <span className="w-20 text-gray-500 text-sm">Email:</span>
                    <span className="font-medium text-gray-900">{member.email}</span>
                  </div>
                  <div className="flex">
                    <span className="w-20 text-gray-500 text-sm">Phone:</span>
                    <span className="font-medium text-gray-900">{member.phone}</span>
                  </div>
                  <div className="flex">
                    <span className="w-20 text-gray-500 text-sm">Plan:</span>
                    <span className="font-medium text-gray-900">{member.membershipType}</span>
                  </div>
                </div>
              </div>

              {/* Class Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                  Class Information
                </h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="w-20 text-gray-500 text-sm">Class:</span>
                    <span className="font-medium text-gray-900">{fitnessClass.name}</span>
                  </div>
                  <div className="flex">
                    <span className="w-20 text-gray-500 text-sm">Schedule:</span>
                    <span className="font-medium text-gray-900">{fitnessClass.schedule}</span>
                  </div>
                  <div className="flex">
                    <span className="w-20 text-gray-500 text-sm">Instructor:</span>
                    <span className="font-medium text-gray-900">
                      {trainer ? trainer.name : 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-20 text-gray-500 text-sm">Capacity:</span>
                    <span className="font-medium text-gray-900">
                      {fitnessClass.enrolled?.length || 0}/{fitnessClass.capacity}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-20 text-gray-500 text-sm">Status:</span>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
                      Confirmed
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Booking Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-gray-500 text-sm block">Booking Date</span>
                  <span className="font-medium text-gray-900">
                    {format(new Date(bookingDate), 'MMMM dd, yyyy')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 text-sm block">Booking Time</span>
                  <span className="font-medium text-gray-900">
                    {format(new Date(), 'HH:mm')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 text-sm block">Valid Until</span>
                  <span className="font-medium text-gray-900">
                    Class Date
                  </span>
                </div>
              </div>
            </div>

            {/* Class Description */}
            {fitnessClass.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Class Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {fitnessClass.description}
                </p>
              </div>
            )}

            {/* Trainer Information */}
            {trainer && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Instructor Details
                </h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-700">
                        {trainer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{trainer.name}</h4>
                      <p className="text-sm text-gray-600">{trainer.email}</p>
                      <p className="text-sm text-gray-600">{trainer.phone}</p>
                      {trainer.expertise && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">Specialties: </span>
                          <span className="text-xs font-medium">
                            {trainer.expertise.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Terms & Conditions
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Please arrive 10 minutes before class starts</li>
                <li>• Cancellations must be made at least 2 hours in advance</li>
                <li>• Bring your own water bottle and towel</li>
                <li>• Follow all safety guidelines provided by the instructor</li>
                <li>• This receipt serves as proof of booking</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-100 p-4 text-center">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Lotus Fitness Center</span>
              <span>Phone: +44 20 1234 5678</span>
              <span>Email: info@lotusfit.co.uk</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Generated on {format(new Date(), 'MMMM dd, yyyy \'at\' HH:mm')}
            </p>
          </div>
        </div>
      </div>
    );
};