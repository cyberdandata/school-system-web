import React, { useState } from 'react';
import { AppData, Teacher, NonTeachingStaff } from '../types';
import { FileText, Printer, Download, User } from 'lucide-react';
import { useAppStore } from "../store/useAppStore";

interface HRDocumentsProps {
  }

type StaffMember = (Teacher | NonTeachingStaff) & { staffType: 'teacher' | 'non-teaching' };

export default function HRDocuments({  }: HRDocumentsProps) {
  const data = useAppStore(state => state.data)!;
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [activeDocType, setActiveDocType] = useState<'contract' | 'appointment' | 'payslip'>('contract');

  // Combine staff
  const allStaff: StaffMember[] = [
    ...(data.settings.teachersList || []).map(t => ({ ...t, staffType: 'teacher' as const })),
    ...(data.settings.nonTeachingStaffList || []).map(nt => ({ ...nt, staffType: 'non-teaching' as const }))
  ].sort((a, b) => a.name.localeCompare(b.name));

  const selectedStaff = allStaff.find(s => s.id === selectedStaffId);

  const handlePrint = () => {
    window.print();
  };

  const schoolName = data.settings.schoolName || 'OFF-TU EDUCATION CENTRE';
  const schoolMotto = data.settings.schoolMotto || 'Education for a Brighter Future';
  const headTeacher = data.settings.headTeacherName || 'Ssemakula Joseph';
  
  const renderTemplate = () => {
    if (!selectedStaff) {
      return (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400">
          <User size={48} className="mb-4 opacity-50" />
          <p>Select a staff member to generate a document.</p>
        </div>
      );
    }

    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const role = selectedStaff.staffType === 'teacher' ? 'Teacher' : (selectedStaff as NonTeachingStaff).role || 'Staff Member';
    const salary = selectedStaff.baseSalary || 0;
    const dateOfJoining = selectedStaff.dateOfJoining ? new Date(selectedStaff.dateOfJoining).toLocaleDateString('en-GB') : '___________';

    if (activeDocType === 'contract') {
      return (
        <div className="bg-white p-8 sm:p-12 border border-slate-200 shadow-sm mx-auto max-w-4xl text-black print:shadow-none print:border-none print:p-0 font-serif leading-tight">
          <style>{`
            @media print {
              .page-break { break-before: page; }
            }
          `}</style>
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-[3px] border-black pb-2 mb-4">
            <div className="w-32 flex flex-col items-center">
              {data.settings.logo ? (
                <img src={data.settings.logo} alt="School Logo" className="w-24 h-24 object-contain mb-1" />
              ) : (
                <div className="w-24 h-24 border-2 border-black rounded-full flex flex-col items-center justify-center text-center">
                  <span className="font-bold text-xs uppercase leading-none mt-2">OTEC</span>
                  <span className="text-[40px] leading-none mb-1">🏫</span>
                </div>
              )}
              <div className="text-[10px] mt-1 border-t border-b border-black text-center w-full uppercase font-bold tracking-tighter">
                {data.settings.motto?.toUpperCase() || 'WITH GOD WE CAN'}
              </div>
            </div>
            
            <div className="flex-1 text-center font-bold">
              <h1 className="text-xl uppercase tracking-wide">{schoolName}</h1>
              <h2 className="text-lg uppercase tracking-wide mt-1">NURSERY & PRIMARY SCHOOL</h2>
              <p className="text-sm mt-1 tracking-wide">P.O.BOX 203, MUKONO</p>
              <p className="text-sm tracking-wide">TEL: 0702 588 529/ 0785 725798</p>
            </div>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
          
          <div className="text-center font-bold mb-4 uppercase text-lg tracking-wider underline underline-offset-4">EMPLOYMENT CONTRACT</div>
          
          <div className="text-center mb-6 text-sm">
            THIS AGREEMENT is between <strong>{schoolName}</strong><br/>and
          </div>

          <div className="grid grid-cols-[3fr_2fr] gap-x-8 gap-y-3 mb-6 text-sm">
            <div className="flex items-end gap-2">
              <span className="font-bold whitespace-nowrap">Name:</span>
              <span className="flex-1 border-b border-black border-dashed text-blue-800 font-sans uppercase px-2">{selectedStaff.name}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-bold whitespace-nowrap">Date of Birth:</span>
              <span className="flex-1 border-b border-black border-dashed text-blue-800 font-sans px-2 text-center">{selectedStaff.dateOfBirth ? new Date(selectedStaff.dateOfBirth).toLocaleDateString('en-GB') : ''}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-bold whitespace-nowrap">Nationality:</span>
              <span className="flex-1 border-b border-black border-dashed text-blue-800 font-sans uppercase px-2">UGANDAN</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-bold whitespace-nowrap">NIN:</span>
              <span className="flex-1 border-b border-black border-dashed text-blue-800 font-sans uppercase px-2 text-center">{selectedStaff.nin || ''}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-bold whitespace-nowrap">NSSF:</span>
              <span className="flex-1 border-b border-black border-dashed text-blue-800 font-sans px-2 text-center">{selectedStaff.nssfNumber || ''}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-bold whitespace-nowrap">Profession:</span>
              <span className="flex-1 border-b border-black border-dashed text-blue-800 font-sans uppercase px-2 text-center">{role}</span>
            </div>
          </div>

          {/* First Contract & Renewal Table */}
          <table className="w-full border-collapse border-2 border-black text-center mb-6 text-[13px]">
             <thead>
                <tr className="bg-slate-50 print:bg-transparent">
                   <th colSpan={6} className="border border-black p-1 font-bold bg-slate-100 print:bg-transparent">First Contract</th>
                </tr>
                <tr className="bg-slate-50 print:bg-transparent">
                   <th className="border border-black p-1 w-[12%]">Date</th>
                   <th className="border border-black p-1 w-[12%]">From</th>
                   <th className="border border-black p-1 w-[12%]">To</th>
                   <th className="border border-black p-1 w-[22%]">Employee (sign)</th>
                   <th className="border border-black p-1 w-[22%]">Employer (sign)</th>
                   <th className="border border-black p-1 border-b-0 w-[20%]" rowSpan={2}>Stamp</th>
                </tr>
             </thead>
             <tbody>
                <tr>
                   <td className="border border-black p-1 h-8 text-blue-800 font-sans text-xs">{today}</td>
                   <td className="border border-black p-1 text-blue-800 font-sans text-xs">{dateOfJoining}</td>
                   <td className="border border-black p-1 text-blue-800 font-sans text-xs"></td>
                   <td className="border border-black p-1 text-blue-800 font-sans font-signature"></td>
                   <td className="border border-black p-1 text-blue-800 font-sans font-signature"></td>
                </tr>
                <tr className="bg-slate-50 print:bg-transparent">
                   <th colSpan={5} className="border border-black p-1 font-bold bg-slate-100 print:bg-transparent">Renewal of Contract</th>
                </tr>
                <tr className="bg-slate-50 print:bg-transparent">
                   <th className="border border-black p-1">Date</th>
                   <th className="border border-black p-1">Renewed from</th>
                   <th className="border border-black p-1">To</th>
                   <th className="border border-black p-1">Employee (sign)</th>
                   <th className="border border-black p-1">Employer (sign)</th>
                   <th className="border-t-0 border border-black p-1 border-b-0"></th>
                </tr>
                <tr>
                   <td className="border border-black p-1 h-8"></td>
                   <td className="border border-black p-1"></td>
                   <td className="border border-black p-1"></td>
                   <td className="border border-black p-1"></td>
                   <td className="border border-black p-1"></td>
                   <th className="border border-black border-t-0 p-1"></th>
                </tr>
                <tr>
                   <td className="border border-black p-1 h-8"></td>
                   <td className="border border-black p-1"></td>
                   <td className="border border-black p-1"></td>
                   <td className="border border-black p-1"></td>
                   <td className="border border-black p-1"></td>
                   <th className="border border-black p-1 border-t-0" rowSpan={2}></th>
                </tr>
                <tr>
                   <td className="border border-black p-1 h-8"></td>
                   <td className="border border-black p-1"></td>
                   <td className="border border-black p-1"></td>
                   <td className="border border-black p-1"></td>
                   <td className="border border-black p-1"></td>
                </tr>
             </tbody>
          </table>

          <div className="mb-2 text-sm text-justify">
             With reference to the code of conduct, bio data disclosure and other related policies by the organization, it is agreed that the Employee shall work for the Employer on the following additional terms and conditions:
          </div>

          <ol className="list-decimal pl-6 space-y-1 mb-6 text-sm text-justify">
            <li><strong>Term of Employment.</strong> Subject to the provisions for termination of employee contract set forth below, this agreement will begin on the dates signed above unless sooner terminated.</li>
            <li>
               <strong>Salary:</strong> The school shall give a salary on a monthly basis. Under this section the Employee shall receive;
               <div className="ml-4 mt-1 mb-2">
                  <div className="flex items-end max-w-sm mb-1">
                     <span className="w-24">Gross pay:</span>
                     <span className="flex-1 border-b border-black border-dashed text-blue-800 font-sans font-medium px-2">Ushs. {salary.toLocaleString()}</span>
                  </div>
                  <div className="flex items-end max-w-sm">
                     <span className="w-24">Net pay:</span>
                     <span className="flex-1 border-b border-black border-dashed text-blue-800 font-sans font-medium px-2">Ushs. {(salary * 0.95).toLocaleString()}</span>
                  </div>
               </div>
               <ol className="list-[lower-alpha] pl-5 space-y-1 font-bold underline decoration-1 underline-offset-2">
                  <li>NSSF and PAYE are deducted from the Gross salary.</li>
                  <li>During holidays, you shall receive HALF salary.</li>
                  <li>Our school is a Christian founded school, and all staff MUST abide by the set Christian rules, regulations and programs.</li>
               </ol>
            </li>
          </ol>

          <table className="w-full border-collapse border-2 border-black text-center text-[13px]">
             <thead>
                <tr className="bg-slate-50 print:bg-transparent">
                   <th colSpan={5} className="border border-black p-1 font-bold bg-slate-100 print:bg-transparent">Salary Update</th>
                </tr>
                <tr className="bg-slate-50 print:bg-transparent">
                   <th className="border border-black p-1 w-[12%]">Date</th>
                   <th className="border border-black p-1 w-[20%]">AMOUNT</th>
                   <th className="border border-black p-1">Other related information</th>
                   <th className="border border-black p-1 w-[18%]">Employee (sign)</th>
                   <th className="border border-black p-1 w-[18%]">Employer (sign)</th>
                </tr>
             </thead>
             <tbody>
                <tr>
                   <td className="border border-black p-1 h-8"></td>
                   <td className="border border-black p-1"></td>
                   <td className="border border-black p-1"></td>
                   <td className="border border-black p-1"></td>
                   <td className="border border-black p-1"></td>
                </tr>
                <tr>
                   <td className="border border-black p-1 h-8"></td>
                   <td className="border border-black p-1"></td>
                   <td className="border border-black p-1"></td>
                   <td className="border border-black p-1"></td>
                   <td className="border border-black p-1"></td>
                </tr>
                <tr>
                   <td className="border border-black p-1 h-8"></td>
                   <td className="border border-black p-1"></td>
                   <td className="border border-black p-1"></td>
                   <td className="border border-black p-1"></td>
                   <td className="border border-black p-1"></td>
                </tr>
                <tr>
                   <td className="border border-black p-1 h-8"></td>
                   <td className="border border-black p-1"></td>
                   <td className="border border-black p-1"></td>
                   <td className="border border-black p-1"></td>
                   <td className="border border-black p-1"></td>
                </tr>
             </tbody>
          </table>

          {/* PAGE BREAK */}
          <div className="page-break pt-12 print:pt-4"></div>

          <ol className="list-decimal pl-6 space-y-3 mb-6 text-sm text-justify" start={3}>
             <li>
                <strong>Employee to Devote Full Time to the school.</strong> The Employee shall devote full time, attention, and energies to the activities of the school, and, during this employment, the employee will not engage in any other business activity, regardless of whether such activity is pursued for profit, gain, or other pecuniary advantage. The employee is not prohibited from making personal investments in any other businesses provided those investments do not require active involvement for operation.
             </li>
             <li>
                <strong>Confidentiality of Proprietary Information.</strong> The Employee agrees during or after the term of this employment, not to reveal confidential information, to any person, firm, corporation, or entity. Should the employee reveal or threaten to reveal this information, the school shall be entitled to an injunction restraining the employee from disclosing the same, or from rendering any services to any entity to whom said information has been or is threatened to be disclosed. The right to secure an injunction is not exclusive, and the school may pursue any other remedies it has against the employee for a breach or threatened breach of this condition, including the recovery of damages from the employee.
             </li>
             <li>
                <strong>Termination of Agreement.</strong> The organization may terminate this agreement at any time upon the following conditions:
                <ol className="list-[lower-roman] pl-6 mt-2 space-y-1">
                   <li>Mutual agreement between the organization and the employee.</li>
                   <li>Notice of termination or paid one(1) months salary advance instead of notice. (No notice / payment will be given to employees who have worked with OTEC for less than six months)</li>
                   <li>Two weeks' notice for employee who has worked with the organization for more than six months but less than one year.</li>
                   <li>One month notice where an employee has worked between one year and five years.</li>
                   <li>Two months' notice where an employee has worked between 5yrs and 10 years.</li>
                   <li>Three months' notice where an employee has worked for 10yrs or more.</li>
                   <li>Notice of termination can come from either the employer or employee.</li>
                </ol>
             </li>
             <li>
                <strong>Oral Modifications Not Binding.</strong> This instrument is the entire agreement of the organization and the Employee. Oral changes have no effect. It may be altered only by a written agreement signed by the party against whom enforcement of any waiver, change, modification, extension, or discharge is sought.
             </li>
          </ol>

          <div className="mb-16 text-sm text-justify leading-relaxed">
             By signing this contract, you acknowledge that you have carefully understood the conditions therein, the code of conduct, and that you have fully disclosed your bio data, and that both parties are accountable to the set conditions.
             <div className="mt-4 flex items-end gap-2">
                <span>Signed this</span>
                <span className="inline-block border-b border-black w-24"></span>
                <span>day</span>
                <span className="inline-block border-b border-black w-48"></span>
                <span>of</span>
                <span className="inline-block border-b border-black w-32"></span>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-24 mt-8 text-sm">
             <div>
                <div className="flex items-end gap-2 mb-8">
                   <span className="whitespace-nowrap">Employee's Signature</span>
                   <div className="border-b border-black flex-1"></div>
                </div>
                <div className="flex items-end gap-2">
                   <span className="whitespace-nowrap">Printed Name</span>
                   <div className="border-b border-black flex-1 text-blue-800 font-sans uppercase font-bold text-center">{selectedStaff.name}</div>
                </div>
             </div>
             <div className="relative">
                <div className="flex items-end gap-2 mb-8">
                   <span className="whitespace-nowrap">Director/Representative's Signature</span>
                   <div className="border-b border-black flex-1"></div>
                </div>
                <div className="flex items-end gap-2">
                   <span className="whitespace-nowrap">Printed Name</span>
                   <div className="border-b border-black flex-1 text-blue-800 font-sans uppercase font-bold text-center">{headTeacher}</div>
                </div>
                
                {/* Stamp Placeholder Box */}
                <div className="absolute right-0 bottom-[-10px] w-32 h-20 border border-slate-300 border-dashed rounded flex flex-col items-center justify-center text-[10px] text-slate-400 opacity-50 -z-10 rotate-[-5deg]">
                   <span>Stamp Here</span>
                </div>
             </div>
          </div>
        </div>
      );
    }

    if (activeDocType === 'appointment') {
      return (
        <div className="bg-white p-8 sm:p-12 border border-slate-200 shadow-sm mx-auto max-w-4xl text-slate-800 print:shadow-none print:border-none print:p-0">
          <div className="text-center border-b-2 border-slate-800 pb-6 mb-12">
            <h1 className="text-2xl font-bold uppercase">{schoolName}</h1>
            <p className="text-sm italic mt-1">{schoolMotto}</p>
            <p className="text-xs mt-2">P.O. BOX 203 MUKONO-UGANDA</p>
          </div>

          <div className="space-y-6 text-sm leading-relaxed">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p><strong>To:</strong> {selectedStaff.name.toUpperCase()}</p>
                <p><strong>Date:</strong> {today}</p>
              </div>
              <div>
                <p><strong>Ref:</strong> APP/{new Date().getFullYear()}/{(selectedStaff.id.substring(0,4)).toUpperCase()}</p>
              </div>
            </div>

            <h2 className="text-lg font-bold underline uppercase mb-6">Letter of Appointment: {role}</h2>

            <p>Dear {selectedStaff.name},</p>
            <p>
              We are pleased to offer you the position of <strong>{role}</strong> at {schoolName}, with effect from <strong>{dateOfJoining}</strong>.
            </p>
            <p>
              During your employment, you will be expected to execute your duties with the utmost diligence and professionalism in alignment with the school's core values. Your performance will be subject to periodic review by the administration.
            </p>
            <p>
              Your initial monthly remuneration will be <strong>UGX {salary.toLocaleString()}</strong>, payable at the end of each calendar month.
            </p>
            <p>
              Please sign and return the duplicate copy of this letter to the HR Office to indicate your acceptance of this offer and the terms and conditions outlined in the school's staff handbook.
            </p>
            <p>
              We welcome you to the team and look forward to a mutually beneficial relationship.
            </p>

            <div className="mt-16">
              <p>Yours Sincerely,</p>
              <div className="border-b border-slate-800 w-64 mt-12 mb-2"></div>
              <p className="font-bold">{headTeacher}</p>
              <p className="text-xs">Head Teacher, {schoolName}</p>
            </div>
            
            <div className="mt-12 pt-8 border-t border-slate-200">
              <p className="font-bold text-xs mb-8">ACCEPTANCE</p>
              <p>I, ___________________________________, acknowledge receipt of this letter and accept the appointment.</p>
              <div className="flex gap-8 mt-12">
                <div className="flex-1">
                  <div className="border-b border-slate-800 w-full mb-2"></div>
                  <p className="text-xs text-slate-500">Signature</p>
                </div>
                <div className="flex-1">
                  <div className="border-b border-slate-800 w-full mb-2"></div>
                  <p className="text-xs text-slate-500">Date</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeDocType === 'payslip') {
      const nssfDeduction = salary > 0 ? salary * 0.05 : 0; // standard 5% employee contribution
      const netPay = salary - nssfDeduction;

      return (
        <div className="bg-white p-8 sm:p-12 border border-slate-200 shadow-sm mx-auto max-w-4xl text-slate-800 print:shadow-none print:border-none print:p-0">
          <div className="text-center border-b-2 border-slate-800 pb-4 mb-8">
            <h1 className="text-xl font-bold uppercase">{schoolName}</h1>
            <h2 className="text-lg font-bold mt-2 uppercase">Official Payslip</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 text-sm bg-slate-50 p-4 rounded-lg print:bg-transparent print:border print:border-slate-300">
            <div>
              <p><span className="font-bold w-24 inline-block">Employee:</span> {selectedStaff.name.toUpperCase()}</p>
              <p><span className="font-bold w-24 inline-block">Role:</span> {role}</p>
              <p><span className="font-bold w-24 inline-block">Staff ID:</span> {selectedStaff.id}</p>
            </div>
            <div>
              <p><span className="font-bold w-32 inline-block">Pay Period:</span> {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
              <p><span className="font-bold w-32 inline-block">Payment Date:</span> {today}</p>
              <p><span className="font-bold w-32 inline-block">Bank Account:</span> {selectedStaff.accountNumber || 'Cash/Cheque'}</p>
            </div>
          </div>

          <table className="w-full text-sm mb-8 border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-800 print:bg-slate-200">
                <th className="text-left p-3 font-bold">Earnings & Allowances</th>
                <th className="text-right p-3 font-bold">Amount (UGX)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-3">Basic Salary</td>
                <td className="text-right p-3">{salary.toLocaleString()}</td>
              </tr>
              <tr className="border-b-2 border-slate-800 font-bold">
                <td className="p-3 text-right">Gross Earnings:</td>
                <td className="text-right p-3">{salary.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <table className="w-full text-sm mb-8 border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-800 print:bg-slate-200">
                <th className="text-left p-3 font-bold">Deductions</th>
                <th className="text-right p-3 font-bold">Amount (UGX)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-3">NSSF Contribution (5%)</td>
                <td className="text-right p-3">{nssfDeduction.toLocaleString()}</td>
              </tr>
              <tr className="border-b-2 border-slate-800 font-bold">
                <td className="p-3 text-right">Total Deductions:</td>
                <td className="text-right p-3">{nssfDeduction.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div className="bg-slate-800 text-white p-4 flex justify-between items-center text-lg font-bold rounded-lg print:bg-transparent print:text-slate-800 print:border-2 print:border-slate-800">
            <span>Net Pay:</span>
            <span>UGX {netPay.toLocaleString()}</span>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-12 text-center text-sm">
            <div>
              <div className="border-b border-slate-800 w-full mb-2 h-8"></div>
              <p>Employer Signature</p>
            </div>
            <div>
              <div className="border-b border-slate-800 w-full mb-2 h-8"></div>
              <p>Employee Signature</p>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Print-hidden controls */}
      <div className="print:hidden mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 mb-1">Select Staff Member</label>
            <select 
              value={selectedStaffId} 
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Choose Employee --</option>
              {allStaff.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.staffType === 'teacher' ? 'Teacher' : s.role})</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 border-l border-slate-200 pl-4">
            <label className="block text-xs font-bold text-slate-500 mb-1">Document Type</label>
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveDocType('contract')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${activeDocType === 'contract' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Contract
              </button>
              <button 
                onClick={() => setActiveDocType('appointment')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${activeDocType === 'appointment' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Appointment
              </button>
              <button 
                onClick={() => setActiveDocType('payslip')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${activeDocType === 'payslip' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Payslip
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={handlePrint}
          disabled={!selectedStaff}
          className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          <Printer size={16} /> Print / PDF
        </button>
      </div>

      {/* Document Canvas (visible when printing) */}
      <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-8 rounded-2xl print:bg-white print:p-0 print:overflow-visible">
        {renderTemplate()}
      </div>
    </div>
  );
}
