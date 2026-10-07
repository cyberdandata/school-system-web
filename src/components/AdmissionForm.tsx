import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ALL_CLASSES } from '../lib/defaults';
import { AdmissionRecord } from '../types';

// Zod Schema for strict form validation
const admissionSchema = z.object({
  applicantName: z.string().min(2, "Name must be at least 2 characters").max(100),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(['Male', 'Female']),
  targetClass: z.string().min(1, "Target class is required"),
  previousSchool: z.string().optional(),
  parentName: z.string().min(2, "Parent name must be at least 2 characters"),
  parentPhone: z.string().min(10, "Valid phone number is required"),
  parentEmail: z.string().email("Invalid email address").optional().or(z.literal('')),
  entranceExamScore: z.number().min(0).max(100).optional().or(z.nan()),
  status: z.enum(['Pending', 'Approved', 'Rejected', 'Enrolled']),
  notes: z.string().optional()
});

type AdmissionFormValues = z.infer<typeof admissionSchema>;

interface AdmissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitApplicant: (data: Omit<AdmissionRecord, 'id' | 'applicationDate'>) => void;
}

export default function AdmissionForm({ isOpen, onClose, onSubmitApplicant }: AdmissionFormProps) {
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset 
  } = useForm<AdmissionFormValues>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      gender: 'Male',
      targetClass: 'P1',
      status: 'Pending',
      previousSchool: '',
      parentEmail: '',
      notes: ''
    }
  });

  const onSubmitForm = (data: AdmissionFormValues) => {
    onSubmitApplicant(data);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Admission Application</h2>
            <p className="text-sm text-slate-500 mt-1">Strictly validated with React Hook Form & Zod</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form id="hook-form-admissions" onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
            
            {/* Student Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Applicant Full Name *</label>
                  <input
                    {...register("applicantName")}
                    className={`w-full rounded-xl p-2 text-sm focus:ring-blue-500 border ${errors.applicantName ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                  />
                  {errors.applicantName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.applicantName.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    {...register("dateOfBirth")}
                    className={`w-full rounded-xl p-2 text-sm focus:ring-blue-500 border ${errors.dateOfBirth ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                  />
                  {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1 font-medium">{errors.dateOfBirth.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Gender *</label>
                  <select
                    {...register("gender")}
                    className="w-full border-slate-200 rounded-xl p-2 text-sm focus:ring-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Target Class *</label>
                  <select
                    {...register("targetClass")}
                    className="w-full border-slate-200 rounded-xl p-2 text-sm focus:ring-blue-500 font-bold"
                  >
                    {ALL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Previous School Attended</label>
                  <input
                    {...register("previousSchool")}
                    className="w-full border-slate-200 rounded-xl p-2 text-sm focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Parent Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Parent / Guardian Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Primary Parent Name *</label>
                  <input
                    {...register("parentName")}
                    className={`w-full rounded-xl p-2 text-sm focus:ring-blue-500 border ${errors.parentName ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                  />
                  {errors.parentName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.parentName.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    {...register("parentPhone")}
                    className={`w-full rounded-xl p-2 text-sm focus:ring-blue-500 border ${errors.parentPhone ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                  />
                  {errors.parentPhone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.parentPhone.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Email Address</label>
                  <input
                    type="email"
                    {...register("parentEmail")}
                    className={`w-full rounded-xl p-2 text-sm focus:ring-blue-500 border ${errors.parentEmail ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                  />
                  {errors.parentEmail && <p className="text-red-500 text-xs mt-1 font-medium">{errors.parentEmail.message}</p>}
                </div>
              </div>
            </div>

            {/* Academic Context */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Office Use Only</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Entrance Exam Score (Optional)</label>
                  <input
                    type="number"
                    {...register("entranceExamScore", { valueAsNumber: true })}
                    className={`w-full rounded-xl p-2 text-sm focus:ring-blue-500 border ${errors.entranceExamScore ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                  />
                  {errors.entranceExamScore && <p className="text-red-500 text-xs mt-1 font-medium">{errors.entranceExamScore.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Initial Status *</label>
                  <select
                    {...register("status")}
                    className="w-full border-slate-200 rounded-xl p-2 text-sm focus:ring-blue-500 font-bold"
                  >
                    <option value="Pending">Pending Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Internal Notes</label>
                  <textarea
                    rows={2}
                    {...register("notes")}
                    className="w-full border-slate-200 rounded-xl p-2 text-sm focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

          </form>
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-3xl">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="hook-form-admissions"
            className="px-6 py-2 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
          >
            Save Application
          </button>
        </div>
      </div>
    </div>
  );
}
