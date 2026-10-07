import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  Settings, 
  Users, 
  BookOpen, 
  FileText, 
  Cloud, 
  Check, 
  Sparkles, 
  Navigation,
  Play,
  HelpCircle
} from 'lucide-react';

interface OnboardingTourProps {
  currentRoute: string;
  setCurrentRoute: (route: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingTour({ 
  currentRoute, 
  setCurrentRoute, 
  isOpen, 
  onClose 
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to OTEC Report Card Planner!",
      description: "Let's take a quick 2-minute tour to show you how to set up your school settings, enroll pupils, record grades, and generate beautiful terminal report cards in just 5 essential steps.",
      icon: Sparkles,
      iconColor: "text-amber-500 bg-amber-50 border-amber-100",
      actionLabel: "Let's Get Started",
      route: "dashboard",
      details: [
        "Interactive step-by-step guidance",
        "Auto-saves your changes to local cache",
        "Syncs dynamically with cloud backup solutions"
      ]
    },
    {
      title: "Step 1: Check School Settings & Grading Scales",
      description: "Customize your school profile details, term parameters, grading bands, and subject configurations before compiling assessments. This ensures report cards comply with curriculum standards.",
      icon: Settings,
      iconColor: "text-blue-600 bg-blue-50 border-blue-100",
      actionLabel: "Navigate to Settings",
      route: "settings",
      details: [
        "Configure school logo, grading bands, and term metadata",
        "Tweak automated PLE aggregate and Division threshold overrides",
        "Define compulsory subjects for lower/upper secondary or primary"
      ]
    },
    {
      title: "Step 2: Enroll Learners & Roster",
      description: "Populate your class rosters. You can register individual learners, assign unique UNEB identification numbers, or perform instant bulk imports using spreadsheet uploads.",
      icon: Users,
      iconColor: "text-purple-600 bg-purple-50 border-purple-100",
      actionLabel: "Navigate to Learners Directory",
      route: "learners",
      details: [
        "Manage students by specific classes (P1 to P7)",
        "Track parent contacts, house groups, and gender distribution",
        "Batch import learners instantly via custom Excel/CSV files"
      ]
    },
    {
      title: "Step 3: Enter Scores & Assessments",
      description: "Input student performance marks for Beginning of Term (BOT), Mid of Term (MOT), and End of Term (EOT) assessments. You can also evaluate psychomotor qualities and append teacher remarks.",
      icon: BookOpen,
      iconColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
      actionLabel: "Navigate to Grades & Comments",
      route: "scores",
      details: [
        "Enter raw percentages or grade scores by subject",
        "Evaluate psychomotor competencies (Values, Communication, Sports)",
        "Record Class Teacher and Headteacher evaluation comments"
      ]
    },
    {
      title: "Step 4: Generate Terminal Report Cards",
      description: "Compile and inspect beautiful individual student report sheets. The system automatically computes grade distributions, total scores, class positions, division ranks, and average remarks.",
      icon: FileText,
      iconColor: "text-rose-600 bg-rose-50 border-rose-100",
      actionLabel: "Navigate to Report Cards Hub",
      route: "reports",
      details: [
        "Pre-designed official templates ready to print",
        "Automated PLE Division predicted ranks and score aggregation",
        "Batch print report cards or export as portable PDFs"
      ]
    },
    {
      title: "Step 5: Cloud Backup & Google Drive Sync",
      description: "Keep your records secure. Connect your personal Google Drive to backup your entire database automatically into a single, clean file called 'report data saved on the cloud.json'.",
      icon: Cloud,
      iconColor: "text-indigo-600 bg-indigo-50 border-indigo-100",
      actionLabel: "Navigate to Backups & Data",
      route: "data",
      details: [
        "Auto-backup to personal cloud directories every 5 minutes",
        "Restore full historical system state from any device instantly",
        "No redundant copy duplicates—all devices update the same cloud file"
      ]
    },
    {
      title: "You are ready to go!",
      description: "You have unlocked the secrets to generating beautiful, high-fidelity report cards. Use the AI Chatbot helper at any time if you need guidance on grade overrides, syllabus configuration, or student reporting.",
      icon: Check,
      iconColor: "text-emerald-500 bg-emerald-50 border-emerald-100",
      actionLabel: "Start Generating Reports",
      route: "dashboard",
      details: [
        "Quick start guides always accessible",
        "Press '?' on your keyboard to view administrative shortcuts",
        "Need help? Type your question to our server-side AI Chatbot"
      ]
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      // Automatically route to help user visualize where the panel lives!
      setCurrentRoute(steps[nextStep].route);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setCurrentRoute(steps[prevStep].route);
    }
  };

  const handleActionClick = () => {
    setCurrentRoute(steps[currentStep].route);
  };

  const handleComplete = () => {
    localStorage.setItem('otec_onboarding_completed', 'true');
    onClose();
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;
  const progressPercent = (currentStep / (steps.length - 1)) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[999998] flex items-center justify-center p-4 print:hidden">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleComplete}
          className="absolute inset-0"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.35 }}
          className="relative bg-white w-full max-w-lg border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-[999999]"
        >
          {/* Top Progress bar */}
          <div className="h-1.5 w-full bg-slate-100 shrink-0">
            <motion.div 
              className="h-full bg-blue-600 rounded-r-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>

          {/* Close button */}
          <button
            onClick={handleComplete}
            className="absolute top-4 right-4 p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-400 hover:text-slate-600 rounded-xl transition-all cursor-pointer"
            title="Skip Tour"
          >
            <X size={14} />
          </button>

          {/* Modal Header & Icon */}
          <div className="p-6 pb-0 flex flex-col items-center text-center space-y-4">
            <div className={`p-4 rounded-2xl border ${currentStepData.iconColor} shrink-0 shadow-sm`}>
              <IconComponent size={28} className={currentStep === 0 || currentStep === steps.length - 1 ? 'animate-bounce' : ''} />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-black tracking-tight text-slate-900">
                {currentStepData.title}
              </h3>
              {currentStep > 0 && currentStep < steps.length - 1 && (
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Quick-Start Tutorial · Step {currentStep} of {steps.length - 2}
                </span>
              )}
            </div>
          </div>

          {/* Modal Body & Checklist */}
          <div className="p-6 space-y-5 flex-1">
            <p className="text-xs text-slate-500 font-semibold leading-relaxed text-center px-4">
              {currentStepData.description}
            </p>

            {/* Step Checklists */}
            <div className="bg-slate-50/75 border border-slate-100 rounded-2xl p-4 space-y-2.5">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                Key Deliverables In This Step
              </span>
              <div className="space-y-2">
                {currentStepData.details.map((detail, index) => (
                  <div key={index} className="flex items-start gap-2 text-[11px] font-medium text-slate-600">
                    <div className="p-0.5 bg-emerald-50 text-emerald-500 rounded-md border border-emerald-100 shrink-0 mt-0.5">
                      <Check size={10} className="stroke-[3]" />
                    </div>
                    <span className="leading-relaxed">{detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Route indicator / Quick Navigation hint */}
            {currentStep > 0 && currentStep < steps.length - 1 && (
              <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-blue-50/50 border border-blue-100/60 rounded-xl max-w-fit mx-auto">
                <Navigation size={11} className="text-blue-500 animate-pulse" />
                <button
                  onClick={handleActionClick}
                  className="text-[10px] font-black text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                >
                  <span>Active Workspace: {currentStepData.actionLabel}</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
            {currentStep > 0 ? (
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="text-xs font-extrabold text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                Skip Tour
              </button>
            )}

            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentStep(i);
                    setCurrentRoute(steps[i].route);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                    i === currentStep 
                      ? 'w-4 bg-blue-600' 
                      : 'w-1.5 bg-slate-200 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/10 cursor-pointer"
            >
              <span>{currentStep === steps.length - 1 ? 'Start Project' : 'Next Step'}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
