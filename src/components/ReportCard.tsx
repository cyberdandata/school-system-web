import { useAppStore } from "../store/useAppStore";
import React, { useState } from 'react';
import { AppData, Learner, ExamSet, GradingBand, CommentRecord } from '../types';
import { NurseryTemplate1, NurseryTemplate2, NurseryTemplate3, NurseryTemplate4, NurseryTemplate5 } from './reports/NurseryTemplates';
import { PrimaryTemplate1, PrimaryTemplate2, PrimaryTemplate3, PrimaryTemplate4, PrimaryTemplate5 } from './reports/PrimaryTemplates';
import { TemplateProps } from './reports/templateTypes';
import app from '../lib/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { ALL_CLASSES, sectionKeyOfClass, getGradeRank, UNEB_GRADING_BANDS } from '../lib/defaults';
import { Printer, FileSpreadsheet, Eye, Sparkles, HelpCircle, ChevronRight, Cloud, CloudUpload, Loader2, CheckCircle2, FolderArchive, Camera, Upload, Trash2, X, Users, Award, ClipboardList, FileText, Search, Download } from 'lucide-react';
import dataManager from '../lib/db';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { 
  getCachedAccessToken, 
  getCachedUser, 
  getOrCreateFolder, 
  uploadFileToDrive 
} from '../lib/googleDriveService';

interface P7PredictionSectionProps {
  learner: Learner;
  report: any;
}

function P7PredictionSection({ learner, report }: P7PredictionSectionProps) {
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const getStaticAdvice = () => {
    const agg = report.pleInfo?.aggregate ?? 36;
    const details = report.pleInfo?.coreDetails || [];
    const weakSubject = [...details]
      .filter((d: any) => !d.isMissing)
      .sort((a: any, b: any) => b.points - a.points)[0];

    if (agg <= 12) {
      return `Outstanding standing for Division 1! To secure a single-digit aggregate, maintain high consistency in ${weakSubject ? weakSubject.subject : 'core subjects'}.`;
    } else if (agg <= 24) {
      if (weakSubject && weakSubject.points >= 6) {
        return `On track for Division 2. To elevate your performance to Division 1, target raising your ${weakSubject.subject} marks (currently grade ${weakSubject.grade}).`;
      }
      return `Solid Division 2 standing. Focus on targeted revision of weak topics to climb into Division 1.`;
    } else if (agg <= 28) {
      return `Division 3 candidate. Extra remedial classes and revision on basic concepts will help elevate you to Division 2.`;
    } else {
      return `Division 4 / U standing. Urgent intensive coaching on core subjects is required to raise the student's passing prospects.`;
    }
  };

  const handleFetchAiAdvice = async () => {
    setLoading(true);
    try {
      const subjectMarks: Record<string, number> = {};
      report.pleInfo?.coreDetails?.forEach((c: any) => {
        if (!c.isMissing) subjectMarks[c.subject] = c.marks;
      });

      const functions = getFunctions(app);
      const generateP7Pathway = httpsCallable(functions, 'generateP7Pathway');

      const response = await generateP7Pathway({
        studentName: learner.name,
        subjectMarks,
        aggregate: report.pleInfo?.aggregate,
        division: report.pleInfo?.division,
      });
      const resData = response.data as { advice?: string, error?: string };
      if (resData.advice) {
        setAiAdvice(resData.advice);
      } else if (resData.error) {
        setAiAdvice(`Error: ${resData.error}`);
      }
    } catch (err) {
      setAiAdvice("Failed to connect to the AI service. Please verify server connection.");
    } finally {
      setLoading(false);
    }
  };

  const activeAdvice = aiAdvice || getStaticAdvice();

  return (
    <div id="ple-prediction-box" className="border-2 border-slate-700 rounded-xl p-4 mb-4 bg-slate-50/60 font-sans print:bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-amber-500 animate-pulse shrink-0" />
          <span className="font-extrabold uppercase tracking-wider text-slate-800 text-xs">
            Uganda National PLE Aggregate Prediction
          </span>
        </div>
        <div className="flex gap-1.5 shrink-0 items-center">
          <button
            onClick={handleFetchAiAdvice}
            disabled={loading}
            className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-all print:hidden"
          >
            {loading ? (
              <span className="animate-spin inline-block h-1.5 w-1.5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <span>✨</span>
            )}
            <span>{aiAdvice ? "Re-Generate Advisor Advice" : "Ask Gemini AI Advisor"}</span>
          </button>
          <span className="bg-slate-800 text-white font-bold px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider">
            {learner.cls} Candidate
          </span>
          {report.pleInfo.isEstimated && (
            <span className="bg-amber-100 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider">
              Partial Estimate
            </span>
          )}
        </div>
      </div>

      {/* Split Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-3">
        {/* Left Column: Core Breakdown */}
        <div className="md:col-span-6 space-y-1.5 border-r border-slate-200/60 pr-0 md:pr-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Core Subject Breakdown (Primary Leaving Examination)
          </span>
          <div className="grid grid-cols-2 gap-2">
            {report.pleInfo.coreDetails.map((c: any) => {
              let pointColor = 'text-slate-600';
              if (c.points <= 2) pointColor = 'text-emerald-600';
              else if (c.points <= 6) pointColor = 'text-blue-600';
              else if (c.points <= 8) pointColor = 'text-amber-600';
              else pointColor = 'text-rose-600';

              return (
                <div key={c.subject} className="flex justify-between items-center p-1.5 bg-white border border-slate-200/70 rounded-lg text-[11px] font-semibold">
                  <span className="text-slate-500 truncate mr-1">{c.subject}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {c.isMissing ? (
                      <span className="text-[9px] text-amber-500 italic bg-amber-50 px-1 rounded">Est: D{c.points}</span>
                    ) : (
                      <>
                        <span className="text-slate-400 font-normal">({c.marks}%)</span>
                        <span className={`font-mono font-black ${pointColor}`}>{c.grade}</span>
                        <span className="text-slate-300">|</span>
                        <span className="font-bold text-slate-800">{c.points} pt</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Prediction & Division Gauge */}
        <div className="md:col-span-6 flex flex-col justify-between">
          <div className="flex justify-between items-start gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Predicted Aggregate
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-slate-900 leading-none">
                  {report.pleInfo.aggregate}
                </span>
                <span className="text-xs text-slate-500 font-bold">/ 36 pts</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Target Placement
              </span>
              <span className={`inline-block mt-1 px-2.5 py-1 rounded-lg text-xs font-black tracking-wide uppercase ${
                report.pleInfo.division === 'Division 1' ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/15' :
                report.pleInfo.division === 'Division 2' ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/15' :
                report.pleInfo.division === 'Division 3' ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/15' :
                report.pleInfo.division === 'Division 4' ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/15' :
                'bg-rose-600 text-white shadow-sm shadow-rose-600/15'
              }`}>
                {report.pleInfo.division}
              </span>
            </div>
          </div>

          {/* Horizontal Division Gauge */}
          <div className="mt-2.5">
            <div className="relative h-2 w-full bg-slate-200 rounded-full overflow-visible">
              <div 
                className="absolute inset-0 rounded-full opacity-85" 
                style={{
                  background: 'linear-gradient(to right, #10b981 0%, #10b981 28%, #3b82f6 28%, #3b82f6 65.6%, #f59e0b 65.6%, #f59e0b 78.1%, #f97316 78.1%, #f97316 90.6%, #f43f5e 90.6%, #f43f5e 100%)'
                }}
              />
              <div 
                className="absolute -top-1.5 w-5 h-5 -ml-2.5 bg-white border-[2px] border-slate-800 rounded-full flex items-center justify-center shadow-md transition-all"
                style={{ left: `${Math.min(Math.max(((report.pleInfo.aggregate - 4) / 32) * 100, 0), 100)}%` }}
              >
                <span className="text-[8px] font-black text-slate-900">{report.pleInfo.aggregate}</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-[7.5px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
              <span>Div 1 (4-12)</span>
              <span>Div 2 (13-24)</span>
              <span>Div 3 (25-28)</span>
              <span>Div 4 (29-32)</span>
              <span>Div U (33-36)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pathway Advisory text box */}
      <div className="mt-3.5 bg-white p-3 border border-slate-200 rounded-xl">
        <span className="text-[9px] font-extrabold text-indigo-900 uppercase tracking-wider block mb-1">
          🔮 Target Pathway Advisory Note (P7 Prep advice)
        </span>
        <p className="text-[11px] leading-relaxed text-slate-700 italic font-medium">
          "{activeAdvice}"
        </p>
      </div>

      {/* Note & Custom Rules indicator */}
      {report.pleInfo.overrideApplied && (
        <div className="mt-2 text-[9px] text-amber-700 bg-amber-50/80 border border-amber-200/50 rounded-lg px-2.5 py-1.5 italic font-semibold flex items-center gap-1">
          <span>⚠️</span>
          <span>
            Aggregate was downgraded to {report.pleInfo.division} due to compulsory core requirements (Minimum grade criteria for English &amp; Mathematics was not met).
          </span>
        </div>
      )}
      
      {report.pleInfo.isEstimated && (
        <div className="mt-2 text-[9px] text-slate-500 bg-slate-100 border border-slate-200/40 rounded-lg px-2.5 py-1.5 font-medium">
          * Prediction estimate is based on {report.pleInfo.satCount} / 4 core subjects marks entered. Remaining core marks were estimated using the candidate's core average score.
        </div>
      )}
    </div>
  );
}

interface ReportCardProps {
  }

export default function ReportCard({  }: ReportCardProps) {
  const data = useAppStore(state => state.data)!;
  const [selectedClass, setSelectedClass] = useState(ALL_CLASSES[0]);
  const [selectedExamSet, setSelectedExamSet] = useState('');
  const [selectedLearner, setSelectedLearner] = useState('');
  const [learnerSearch, setLearnerSearch] = useState('');
  const [batchMode, setBatchMode] = useState(false);
  const [showPdfGuide, setShowPdfGuide] = useState(false);

  // Digital Signature and School Stamp States
  const [teacherSignature, setTeacherSignature] = useState<string | null>(() => localStorage.getItem('otec_teacher_signature'));
  const [headSignature, setHeadSignature] = useState<string | null>(() => localStorage.getItem('otec_head_signature'));
  const [schoolStamp, setSchoolStamp] = useState<string | null>(() => localStorage.getItem('otec_school_stamp'));

  // Camera Capture States
  const [activeCameraSlot, setActiveCameraSlot] = useState<'teacher' | 'head' | 'stamp' | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const startCamera = async (slot: 'teacher' | 'head' | 'stamp') => {
    setActiveCameraSlot(slot);
    setCameraLoading(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      (window as any)._cameraStream = stream;
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setCameraError(err.message || "Could not access camera. Please check permissions.");
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    const stream = (window as any)._cameraStream;
    if (stream) {
      stream.getTracks().forEach((track: any) => track.stop());
      (window as any)._cameraStream = null;
    }
    setActiveCameraSlot(null);
    setCameraError(null);
  };

  const captureSnapshot = () => {
    if (!videoRef.current || !activeCameraSlot) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      
      if (activeCameraSlot === 'teacher') {
        setTeacherSignature(dataUrl);
        localStorage.setItem('otec_teacher_signature', dataUrl);
      } else if (activeCameraSlot === 'head') {
        setHeadSignature(dataUrl);
        localStorage.setItem('otec_head_signature', dataUrl);
      } else if (activeCameraSlot === 'stamp') {
        setSchoolStamp(dataUrl);
        localStorage.setItem('otec_school_stamp', dataUrl);
      }
    }
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, slot: 'teacher' | 'head' | 'stamp') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        if (slot === 'teacher') {
          setTeacherSignature(dataUrl);
          localStorage.setItem('otec_teacher_signature', dataUrl);
        } else if (slot === 'head') {
          setHeadSignature(dataUrl);
          localStorage.setItem('otec_head_signature', dataUrl);
        } else if (slot === 'stamp') {
          setSchoolStamp(dataUrl);
          localStorage.setItem('otec_school_stamp', dataUrl);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const clearSlot = (slot: 'teacher' | 'head' | 'stamp') => {
    if (slot === 'teacher') {
      setTeacherSignature(null);
      localStorage.removeItem('otec_teacher_signature');
    } else if (slot === 'head') {
      setHeadSignature(null);
      localStorage.removeItem('otec_head_signature');
    } else if (slot === 'stamp') {
      setSchoolStamp(null);
      localStorage.removeItem('otec_school_stamp');
    }
  };

  // Clean up stream on unmount
  React.useEffect(() => {
    return () => {
      const stream = (window as any)._cameraStream;
      if (stream) {
        stream.getTracks().forEach((track: any) => track.stop());
        (window as any)._cameraStream = null;
      }
    };
  }, []);

  // Print Overlay State
  const [isPrintOverlayActive, setIsPrintOverlayActive] = useState(false);
  const [isBlankReportMode, setIsBlankReportMode] = useState(false);
  const [draftMode, setDraftMode] = useState(false);

  // Quick Add Exam Set States
  const [showQuickAddExam, setShowQuickAddExam] = useState(false);
  const [quickExamTerm, setQuickExamTerm] = useState(data.settings.term || 'Term 1');
  const [quickExamPeriod, setQuickExamPeriod] = useState<'BOT' | 'MOT' | 'EOT'>('EOT');
  const [quickExamLabel, setQuickExamLabel] = useState('Set 1 EOT');
  const [quickExamSetNo, setQuickExamSetNo] = useState('1');

  React.useEffect(() => {
    setQuickExamLabel(`Set ${quickExamSetNo} ${quickExamPeriod}`);
  }, [quickExamPeriod, quickExamSetNo]);

  // Sync body class to hide main dashboard during print mode
  React.useEffect(() => {
    if (isPrintOverlayActive) {
      document.body.classList.add('print-overlay-active');
    } else {
      document.body.classList.remove('print-overlay-active');
    }
    return () => {
      document.body.classList.remove('print-overlay-active');
    };
  }, [isPrintOverlayActive]);

  // Google Drive export states
  const [gExporting, setGExporting] = useState(false);
  const [gSuccessMessage, setGSuccessMessage] = useState<string | null>(null);
  const [gErrorMessage, setGErrorMessage] = useState<string | null>(null);

  // ZIP export states
  const [zipProgress, setZipProgress] = useState<{ current: number; total: number; studentName: string } | null>(null);

  const handleGenerateZip = async () => {
    if (classLearners.length === 0) {
      alert("No registered students found in this class stream.");
      return;
    }
    if (!activeExamSet) {
      alert("Please select an exam paper set.");
      return;
    }

    const examSetLabel = activeExamSet.label;
    const zip = new JSZip();

    try {
      for (let i = 0; i < classLearners.length; i++) {
        const learner = classLearners[i];
        setZipProgress({
          current: i + 1,
          total: classLearners.length,
          studentName: learner.name
        });

        // Get the hidden report element
        let element = document.getElementById(`pdf-hidden-${learner.id}`);
        if (!element) {
          element = document.getElementById(`report-sheet-${learner.id}`);
        }
        if (!element) {
          console.warn(`Element pdf-hidden-${learner.id} not found in DOM`);
          continue;
        }

        // Generate high-resolution canvas with html2canvas
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (imgHeight <= pageHeight) {
          pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        } else if (imgHeight <= pageHeight * 1.15) {
          pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, pageHeight);
        } else {
          let heightLeft = imgHeight;
          let position = 0;
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }
        }

        const pdfBlob = pdf.output('blob');
        const filename = `${learner.name.replace(/[^a-zA-Z0-9]/g, '_')}_Report_Card.pdf`;
        zip.file(filename, pdfBlob);
      }

      setZipProgress(null);

      // Generate the ZIP file and trigger download
      const content = await zip.generateAsync({ type: 'blob' });
      const blobUrl = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = blobUrl;
      const zipName = `${selectedClass.replace(/[^a-zA-Z0-9]/g, '_')}_${examSetLabel.replace(/[^a-zA-Z0-9]/g, '_')}_Report_Cards.zip`;
      link.download = zipName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

      dataManager.addActivityLog(
        'report_printed', 
        `Generated and downloaded bulk PDF report card ZIP package for ${selectedClass} (${examSetLabel}).`
      );

      window.dispatchEvent(new CustomEvent('otec-toast', {
        detail: {
          message: `Successfully generated and downloaded ZIP package containing ${classLearners.length} PDF report cards!`,
          type: 'success'
        }
      }));

    } catch (error) {
      console.error("Failed to generate ZIP", error);
      setZipProgress(null);
      alert("An error occurred while generating the ZIP file. Please try again.");
    }
  };

  const [isGeneratingSinglePdf, setIsGeneratingSinglePdf] = useState(false);

  const handleDownloadSinglePdf = async (targetLearner?: Learner) => {
    const learnerToUse = targetLearner || classLearners.find(l => l.id === selectedLearner);
    if (!learnerToUse || !activeExamSet) {
      alert("Please select a student and exam paper set.");
      return;
    }

    try {
      setIsGeneratingSinglePdf(true);
      let element = document.getElementById(`pdf-hidden-${learnerToUse.id}`) || document.getElementById(`report-sheet-${learnerToUse.id}`) || document.getElementById('printArea');
      if (!element) {
        alert("Report card element is not available for capture.");
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      } else {
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, pageHeight);
      }

      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const filename = `${learnerToUse.name.replace(/[^a-zA-Z0-9]/g, '_')}_${activeExamSet.label.replace(/[^a-zA-Z0-9]/g, '_')}_Report_Card.pdf`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

      window.dispatchEvent(new CustomEvent('otec-toast', {
        detail: {
          message: `PDF Report Card for ${learnerToUse.name} downloaded successfully!`,
          type: 'success'
        }
      }));
    } catch (err: any) {
      console.error('Failed to generate single PDF:', err);
      alert('Failed to generate PDF: ' + (err.message || 'Unknown error'));
    } finally {
      setIsGeneratingSinglePdf(false);
    }
  };

  const handleDownloadSingleHTML = (targetLearner?: Learner) => {
    const learnerToUse = targetLearner || classLearners.find(l => l.id === selectedLearner);
    if (!learnerToUse) return;

    try {
      const htmlContent = generateHTMLReportString();
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const filename = `${learnerToUse.name.replace(/[^a-zA-Z0-9]/g, '_')}_Report_Card.html`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

      window.dispatchEvent(new CustomEvent('otec-toast', {
        detail: {
          message: `Standalone HTML Report Card for ${learnerToUse.name} downloaded!`,
          type: 'success'
        }
      }));
    } catch (err) {
      alert('Failed to download HTML report file.');
    }
  };

  const generateHTMLReportString = () => {
    const printElement = document.getElementById('printArea');
    const contentHtml = printElement ? printElement.innerHTML : '';
    
    // Embed the standard styling, fonts, and layouts in a self-contained HTML page
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>OTEC School Report Cards</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700;900&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background-color: #f1f5f9;
      padding: 20px;
    }
    @media print {
      body {
        background-color: #ffffff;
        padding: 0;
      }
      .page-break-after {
        page-break-after: always;
      }
    }
    .page-break-after {
      page-break-after: always;
    }
  </style>
</head>
<body>
  <div style="max-width: 850px; margin: 0 auto;">
    ${contentHtml}
  </div>
</body>
</html>`;
    return fullHtml;
  };

  const handleGoogleExport = async () => {
    const accessToken = getCachedAccessToken();
    if (!accessToken) {
      alert('Google Drive is not connected. Please connect your Google Drive account first under the Database Backups & Cloud Sync page.');
      return;
    }

    const examSet = classExamSets.find(s => s.id === selectedExamSet);
    if (!examSet) return;

    const activeLearnerObj = classLearners.find(l => l.id === selectedLearner);

    const confirmed = window.confirm(
      batchMode
        ? `Are you sure you want to export and sync the complete batch report cards of '${selectedClass}' (${classLearners.length} students) to your Google Drive?`
        : `Are you sure you want to export and sync the report card for '${activeLearnerObj?.name}' to your Google Drive?`
    );
    if (!confirmed) return;

    try {
      setGExporting(true);
      setGErrorMessage(null);
      setGSuccessMessage(null);

      // 1. Get or create primary "OTEC School Report Cards" folder
      const rootFolderId = await getOrCreateFolder(accessToken, 'OTEC School Report Cards');
      // 2. Get or create "Exported Reports" subfolder
      const exportFolderId = await getOrCreateFolder(accessToken, 'Exported Reports', rootFolderId);

      // 3. Generate HTML Content for the file
      const docTitle = batchMode 
        ? `${selectedClass.replace(/ /g, '_')}_${examSet.label.replace(/ /g, '_')}_Report_Cards`
        : `${activeLearnerObj?.name.replace(/ /g, '_')}_${examSet.label.replace(/ /g, '_')}_Report_Card`;

      const fileName = `${docTitle}_${new Date().toISOString().slice(0, 10)}.html`;

      // Build self-contained HTML
      const htmlBody = generateHTMLReportString();

      // 4. Upload file to Drive
      await uploadFileToDrive(accessToken, exportFolderId, fileName, 'text/html', htmlBody);

      setGSuccessMessage(`Successfully uploaded report sheet to your Google Drive folder '/OTEC School Report Cards/Exported Reports'! File name: ${fileName}`);
      
      dataManager.addActivityLog(
        'report_printed', 
        `Synced and saved digital report card sheet to Google Drive: ${fileName}.`
      );
      setTimeout(() => setGSuccessMessage(null), 10000);
    } catch (err: any) {
      if (err.message === 'UNAUTHENTICATED') {
        setGErrorMessage('Your Google Drive connection has expired. Please reconnect in the Backup Manager.');
      } else {
        console.error('Google Drive export failed:', err);
        setGErrorMessage('Failed to save report cards to Google Drive. Please verify your connection.');
      }
    } finally {
      setGExporting(false);
    }
  };

  const classExamSets = data.settings.examSets.filter(s => s.classes.includes(selectedClass));
  const classLearners = data.learners.filter(l => l.cls === selectedClass);

  // Auto select default sets and learners
  React.useEffect(() => {
    if (classExamSets.length > 0) {
      setSelectedExamSet(classExamSets[0].id);
    } else {
      setSelectedExamSet('');
    }
  }, [selectedClass]);

  React.useEffect(() => {
    setLearnerSearch('');
    if (classLearners.length > 0) {
      setSelectedLearner(classLearners[0].id);
    } else {
      setSelectedLearner('');
    }
  }, [selectedClass]);

  const activeLearner = classLearners.find(l => l.id === selectedLearner);
  const activeExamSet = classExamSets.find(s => s.id === selectedExamSet);

  // Print shortcut handling (Ctrl+P)
  const printActionRef = React.useRef(() => {
    if (isPrintOverlayActive) {
      triggerBrowserPrint();
    } else {
      handlePrint();
    }
  });

  React.useEffect(() => {
    printActionRef.current = () => {
      if (isPrintOverlayActive) {
        triggerBrowserPrint();
      } else {
        handlePrint();
      }
    };
  }, [isPrintOverlayActive, selectedClass, activeExamSet, selectedExamSet, batchMode, activeLearner]);

  React.useEffect(() => {
    const handleShortcutPrint = () => {
      printActionRef.current();
    };
    window.addEventListener('otec-shortcut-print', handleShortcutPrint);
    return () => {
      window.removeEventListener('otec-shortcut-print', handleShortcutPrint);
    };
  }, []);

  const computeSingleReportData = (learner: Learner, examSet: ExamSet) => {
    const examMode = localStorage.getItem('otec_exam_mode') === 'true';
    const sectionKey = sectionKeyOfClass(learner.cls);
    const subjects = data.settings.sections[sectionKey].subjects;
    let grading = data.settings.sections[sectionKey].grading;
    if (examMode && (learner.cls === 'Primary 7' || learner.cls === 'P7' || sectionKey === 'upper')) {
      grading = UNEB_GRADING_BANDS;
    }
    const cKey = `${learner.id}|${examSet.id}`;
    const classMates = data.learners.filter(l => l.cls === learner.cls);

    const scoreRec = data.scores[cKey] || {};
    const psychoRec = data.psychomotor[cKey] || {};
    const commentRec = (data.comments[cKey] || {}) as CommentRecord;

    const lowerGradingSubjects = ['English', 'Mathematics', 'Literacy 1', 'Religious Education'];

    let total = 0;
    let satCount = 0;
    const subjectRows = subjects.map(s => {
      const marks = scoreRec[s.name];
      let grade = '-';
      let remark = '-';
      let band: GradingBand | undefined;

      if (marks !== undefined) {
        band = grading.find(g => marks >= g.min && marks <= g.max);
        if (band) {
          grade = band.grade;
          remark = band.remark;
        }
        if (sectionKey !== 'lower' || lowerGradingSubjects.includes(s.name)) {
          total += marks;
          satCount++;
        }
      }

      // Compute Subject Rank among classmates who sat for this exam set
      const peerScores = classMates.map(peer => {
        const pKey = `${peer.id}|${examSet.id}`;
        const rec = data.scores[pKey] || {};
        const m = rec[s.name];
        return { id: peer.id, marks: typeof m === 'number' ? m : null };
      }).filter(x => x.marks !== null) as { id: string; marks: number }[];

      peerScores.sort((a, b) => b.marks - a.marks);
      const subPosIdx = (marks !== undefined && typeof marks === 'number') 
        ? peerScores.findIndex(p => p.id === learner.id) 
        : -1;
      const rankText = subPosIdx !== -1 ? `${subPosIdx + 1}/${peerScores.length}` : '-';

      return {
        name: s.name,
        marks: marks !== undefined ? marks : null,
        grade,
        remark,
        rank: rankText
      };
    });

    const average = satCount ? Math.round(total / satCount) : 0;
    const overallGrade = satCount ? (grading.find(g => average >= g.min && average <= g.max)?.remark || '-') : '-';

    // Position calculation
    const peerAverages = classMates.map(peer => {
      const pKey = `${peer.id}|${examSet.id}`;
      const rec = data.scores[pKey] || {};
      const subjectNames = sectionKey === 'lower'
        ? lowerGradingSubjects
        : subjects.map(sub => sub.name);

      const vals = Object.entries(rec)
        .filter(([subjName, v]) => typeof v === 'number' && subjectNames.includes(subjName))
        .map(([_, v]) => v);

      const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
      return { id: peer.id, avg };
    }).filter(x => x.avg !== null).sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0));

    const posIdx = peerAverages.findIndex(p => p.id === learner.id);
    const positionText = posIdx !== -1 ? `${posIdx + 1} of ${peerAverages.length}` : '-';

    // PLE Candidate logic (Primary 7)
    let pleInfo = null;
    if (learner.cls === 'Primary 7' || learner.cls === 'P7') {
      const coreSubjects = ['English', 'Mathematics', 'Science', 'Social Studies'];
      const sortedGrading = [...grading].sort((a,b)=>b.min-a.min);
      
      const coreDetails = coreSubjects.map(subj => {
        const marks = scoreRec[subj];
        let grade = '-';
        let points = 9;
        let isMissing = true;

        if (marks !== undefined) {
          isMissing = false;
          const gradeBand = sortedGrading.find(g => marks >= g.min && marks <= g.max);
          grade = gradeBand?.grade || 'F9';
          points = getGradeRank(grade);
        }

        return {
          subject: subj,
          marks: marks !== undefined ? marks : null,
          grade,
          points,
          isMissing
        };
      });

      const satCore = coreDetails.filter(c => !c.isMissing);
      const hasAllCore = satCore.length === 4;

      // Estimate missing core points based on student's core average, or default to 9
      let predictedAggregate = 36;
      let isEstimated = false;

      if (hasAllCore) {
        predictedAggregate = coreDetails.reduce((sum, c) => sum + c.points, 0);
      } else if (satCore.length > 0) {
        isEstimated = true;
        const avgPoints = satCore.reduce((sum, c) => sum + c.points, 0) / satCore.length;
        const roundedAvg = Math.round(avgPoints);
        predictedAggregate = coreDetails.reduce((sum, c) => {
          return sum + (c.isMissing ? roundedAvg : c.points);
        }, 0);
      } else {
        predictedAggregate = 36; // Default to worst if absolutely no scores
      }

      // Division calculation based on the predictedAggregate (or aggregate if all sat)
      let division = 'Division U';
      let overrideApplied = false;

      const engGrade = coreDetails.find(c => c.subject === 'English')?.points ?? 9;
      const mathGrade = coreDetails.find(c => c.subject === 'Mathematics')?.points ?? 9;
      
      const rules = data.settings.pleOverride;

      if (rules.enabled) {
        if (predictedAggregate <= 12) {
          if (engGrade > rules.englishMinGradeForDiv1 || mathGrade > rules.mathMinGradeForDiv1) {
            division = 'Division 2';
            overrideApplied = true;
          } else {
            division = 'Division 1';
          }
        } else if (predictedAggregate <= 24) {
          if (engGrade > rules.englishMinGradeForDiv2 || mathGrade > rules.mathMinGradeForDiv2) {
            division = 'Division 3';
            overrideApplied = true;
          } else {
            division = 'Division 2';
          }
        } else if (predictedAggregate <= 28) {
          division = 'Division 3';
        } else if (predictedAggregate <= 32) {
          division = 'Division 4';
        } else {
          division = 'Division U';
        }
      } else {
        if (predictedAggregate <= 12) division = 'Division 1';
        else if (predictedAggregate <= 24) division = 'Division 2';
        else if (predictedAggregate <= 28) division = 'Division 3';
        else if (predictedAggregate <= 32) division = 'Division 4';
        else division = 'Division U';
      }

      pleInfo = {
        aggregate: predictedAggregate,
        division,
        overrideApplied,
        isEstimated,
        hasAllCore,
        coreDetails,
        satCount: satCore.length,
        details: `Eng: D${engGrade} equiv, Math: D${mathGrade} equiv`
      };
    }

    return {
      subjectRows,
      total,
      average,
      overallGrade,
      positionText,
      psychoRec,
      commentRec,
      pleInfo,
      grading
    };
  };

  const handlePrint = () => {
    setIsPrintOverlayActive(true);
  };

  const triggerBrowserPrint = () => {
    window.print();
    const examSetLabel = activeExamSet ? activeExamSet.label : selectedExamSet;
    if (batchMode) {
      dataManager.addActivityLog(
        'report_printed', 
        `Generated and printed class-wide report card batch for ${selectedClass} stream (${examSetLabel}).`
      );
    } else {
      const learnerName = activeLearner ? activeLearner.name : 'student';
      dataManager.addActivityLog(
        'report_printed', 
        `Generated and printed individual report card for ${learnerName} in ${selectedClass} (${examSetLabel}).`
      );
    }
  };

  const renderSheet = (learner: Learner, examSet: ExamSet) => {
    const report = computeSingleReportData(learner, examSet);
    const settings = data.settings;
    const sectionKey = sectionKeyOfClass(learner.cls);

    return (
      <div key={learner.id} className="relative overflow-hidden bg-white border-4 border-slate-700 p-8 w-full max-w-[800px] text-slate-900 shadow-lg font-sans mx-auto mb-8 page-break-after">
        {/* Draft Mode Watermark Overlay */}
        {draftMode && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 select-none">
            <span className="text-rose-500/[0.05] text-[110px] font-black uppercase tracking-widest rotate-[-35deg] whitespace-nowrap">
              DRAFT REPORT
            </span>
          </div>
        )}

        {/* Draft Badge */}
        {draftMode && (
          <div className="absolute top-4 right-4 bg-rose-50 text-rose-800 border-2 border-rose-300 font-extrabold px-3 py-1 rounded-md text-[10px] uppercase tracking-widest rotate-[12deg] shadow-xs z-10 print:bg-rose-50 print:text-rose-800 print:border-rose-300">
            DRAFT COPY
          </div>
        )}

        {/* School Header */}
        <div className="text-center border-b-2 border-slate-700 pb-4 mb-4">
          <div className="flex items-center justify-center gap-4 mb-2">
            {settings.logo && (settings.reportCardVisibility?.showSchoolLogo !== false) && (
              <img src={settings.logo} alt="School Logo" className="h-16 w-16 object-contain" />
            )}
            <div>
              <h2 className="text-2xl font-extrabold text-blue-900 tracking-wide uppercase">{settings.schoolName}</h2>
              <p className="text-xs italic font-bold text-slate-600 mt-0.5">“{settings.motto}”</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            {settings.address} &middot; {settings.tel1} {settings.tel2 ? `& ${settings.tel2}` : ''}
          </p>
        </div>

        {/* Report Card Title Banner */}
        <div className="bg-slate-100 border border-slate-300 text-center py-2 text-sm font-black uppercase tracking-widest text-slate-800 mb-4 rounded-md">
          {examSet.term.toUpperCase()} {examSet.period} REPORT CARD CARD (YEAR: {settings.year})
        </div>

        {/* Student Profile Info */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-slate-200 pb-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3.5 gap-x-6 text-xs flex-1 w-full">
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block">Student's Name</span>
              <span contentEditable suppressContentEditableWarning className="text-sm font-extrabold text-slate-950 block outline-none">{learner.name}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block">Admission No</span>
              <span contentEditable suppressContentEditableWarning className="text-sm font-extrabold text-slate-950 font-mono block outline-none">{learner.admNo || '-'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block">Class stream</span>
              <span contentEditable suppressContentEditableWarning className="text-sm font-extrabold text-slate-950 block outline-none">{learner.cls}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block">Gender (Sex)</span>
              <span contentEditable suppressContentEditableWarning className="text-sm font-extrabold text-slate-950 block outline-none">{learner.sex === 'Male' ? 'Boy (Male)' : 'Girl (Female)'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block">Age</span>
              <span contentEditable suppressContentEditableWarning className="text-sm font-extrabold text-slate-950 block outline-none">{learner.age || '-'} yrs</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block">Learner ID (LIN)</span>
              <span contentEditable suppressContentEditableWarning className="text-sm font-extrabold text-slate-950 font-mono block outline-none">{learner.lin || '-'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block">Student Paycode</span>
              <span contentEditable suppressContentEditableWarning className="text-sm font-extrabold text-slate-950 font-mono block outline-none">{learner.paycode || '-'}</span>
            </div>
            {learner.unebNo && (
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider block">UNEB Index Number</span>
                <span contentEditable suppressContentEditableWarning className="text-sm font-extrabold text-amber-600 font-mono block outline-none">{learner.unebNo}</span>
              </div>
            )}
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block">Target Examination</span>
              <span contentEditable suppressContentEditableWarning className="text-sm font-extrabold text-slate-950 block outline-none">{examSet.label}</span>
            </div>
          </div>
          {/* Student Profile Picture */}
          {(settings.reportCardVisibility?.showStudentPhoto !== false) && (
            <div className="shrink-0 flex sm:flex-col items-center justify-center gap-1 bg-slate-50 border border-slate-200 p-1.5 rounded-xl self-center sm:self-auto shadow-xs">
              <img 
                src={learner.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(learner.name)}`} 
                alt={learner.name} 
                referrerPolicy="no-referrer"
                className="h-16 w-16 rounded-lg object-cover bg-slate-100 border border-slate-200"
              />
              <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block text-center mt-1">PHOTO ID</span>
            </div>
          )}
        </div>

        {/* Grades Performance Table */}
        <div className="mb-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 uppercase font-black border-2 border-slate-700">
                <th className="p-2 border border-slate-400">SUBJECT</th>
                <th className="p-2 border border-slate-400 text-center w-24">MARKS (/100)</th>
                <th className="p-2 border border-slate-400 text-center w-20">GRADE</th>
                {(settings.reportCardVisibility?.showRankingTable !== false) && (
                  <th className="p-2 border border-slate-400 text-center w-20">RANK</th>
                )}
                <th className="p-2 border border-slate-400">TEACHER REMARKS</th>
              </tr>
            </thead>
            <tbody>
              {report.subjectRows.map((row) => (
                <tr key={row.name} className="border-b border-slate-300">
                  <td className="p-2 border border-slate-300 font-extrabold text-slate-800 uppercase">{row.name}</td>
                  <td className="p-2 border border-slate-300 text-center font-bold text-slate-900 text-sm">
                    {isBlankReportMode ? '' : (row.marks !== null ? row.marks : <span className="text-slate-300 font-normal">N/A</span>)}
                  </td>
                  <td className="p-2 border border-slate-300 text-center font-mono font-black text-sm text-slate-950">
                    {isBlankReportMode ? '' : row.grade}
                  </td>
                  {(settings.reportCardVisibility?.showRankingTable !== false) && (
                    <td className="p-2 border border-slate-300 text-center font-mono font-bold text-xs text-blue-700">
                      {isBlankReportMode ? '' : (row.rank || '-')}
                    </td>
                  )}
                  <td className="p-2 border border-slate-300 font-semibold text-slate-600 text-[11px] italic">
                    {isBlankReportMode ? '' : row.remark}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Grading Key */}
        {(settings.reportCardVisibility?.showGradingScale !== false) && !(isBlankReportMode && sectionKey === 'nursery') && (
          <div className="bg-slate-50/50 border border-slate-200 rounded-lg p-2.5 text-[9px] text-slate-500 mb-4 font-semibold text-center flex flex-wrap justify-center gap-x-3 gap-y-1">
            <span className="font-bold uppercase text-slate-700">Grading System:</span>
            {report.grading.map(g => (
              <span key={g.grade}>
                <b>{g.grade}</b> ({g.min}-{g.max}%): {g.remark}
              </span>
            ))}
          </div>
        )}

        {/* Performance Summary Details */}
        {!isBlankReportMode && (
          <div className={`bg-slate-100/50 border border-slate-300 rounded-xl p-4 mb-4 grid gap-4 text-xs font-semibold ${
            settings.reportCardVisibility?.showRankingTable !== false ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'
          }`}>
            <div>
              <span className="text-slate-500 block">Total Marks Summary</span>
              <b className="text-slate-900 text-sm mt-0.5 block">{report.total} marks</b>
            </div>
            <div>
              <span className="text-slate-500 block">Aggregate Average</span>
              <b className="text-slate-900 text-sm mt-0.5 block">{report.average}%</b>
            </div>
            {(settings.reportCardVisibility?.showRankingTable !== false) && (
              <div>
                <span className="text-slate-500 block">Overall Class Position</span>
                <b className="text-slate-900 text-sm mt-0.5 block">{report.positionText}</b>
              </div>
            )}
            <div>
              <span className="text-slate-500 block">Overall Assessment Grade</span>
              <b className="text-slate-900 text-sm mt-0.5 block">{report.overallGrade}</b>
            </div>
          </div>
        )}

        {/* PLE Specific Information Panel */}
        {!isBlankReportMode && report.pleInfo && (settings.reportCardVisibility?.showDivision !== false) && (
          <P7PredictionSection learner={learner} report={report} />
        )}

        {/* Psychomotor Skills */}
        {(settings.reportCardVisibility?.showPsychomotor !== false) && (
          <div className="mb-4 border border-slate-300 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 text-[11px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-300">
              Psychomotor Skills &amp; Behavioral Assessment
            </div>
            <div className="p-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[10px] font-bold">
              {settings.psychomotor.map(sk => {
                const r = report.psychoRec[sk] || 0;
                return (
                  <div key={sk} className="flex justify-between items-center border-b border-slate-100 pb-1">
                    <span className="text-slate-600 uppercase tracking-wide">{sk}</span>
                    <div className="flex items-center gap-0.5">
                      {[5,4,3,2,1].map(v => (
                        <span 
                          key={v} 
                          className={`inline-block px-1 rounded-sm text-[8px] border font-mono ${
                            !isBlankReportMode && r === v ? 'bg-slate-800 text-white border-slate-800' : 'text-slate-300 border-slate-100'
                          }`}
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bg-slate-50 px-3 py-1 text-[9px] text-slate-500 text-center font-medium border-t border-slate-100">
              Rating: 5 - Excellent &middot; 4 - Very Good &middot; 3 - Good &middot; 2 - Fair &middot; 1 - Poor
            </div>
          </div>
        )}

        {/* Teacher Comments */}
        <div className="space-y-3.5 text-xs font-semibold leading-relaxed relative">
          {/* School Stamp Blend Overlay */}
          {schoolStamp && (
            <div className="absolute right-12 bottom-6 w-24 h-24 opacity-85 pointer-events-none mix-blend-multiply transform rotate-[15deg] z-10 select-none">
              <img src={schoolStamp} alt="Official Stamp" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
          )}

          {(settings.reportCardVisibility?.showTeacherComments !== false) && !isBlankReportMode && (
            <>
              <div>
                <span className="text-slate-500 uppercase tracking-wider text-[10px] block mb-0.5">Class Teacher's Assessment Remarks:</span>
                <div className="p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-800 italic min-h-[44px]">
                  {isBlankReportMode ? '' : (report.commentRec.teacher || (
                    sectionKeyOfClass(learner.cls) === 'preprimary'
                      ? "A wonderful young learner showing commendable progress in numbers, reading, and social development. Keep shining!"
                      : "Shows great potential. Needs to continue keeping up with the standard work pace."
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 items-end relative">
                  <span>Teacher Initials: <b>{isBlankReportMode ? '' : (report.commentRec.teacherInitials || '-')}</b></span>
                  <span className="relative flex flex-col items-center">
                    {teacherSignature ? (
                      <div className="absolute bottom-1 right-2 w-28 h-8 pointer-events-none flex items-center justify-center z-10">
                        <img src={teacherSignature} alt="Teacher Signature" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                    ) : null}
                    <span className="text-slate-400">Signature: __________________________</span>
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 uppercase tracking-wider text-[10px] block mb-0.5">Head Teacher's Recommendation Comment:</span>
                <div className="p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-800 italic min-h-[44px]">
                  {isBlankReportMode ? '' : (report.commentRec.head || (
                    sectionKeyOfClass(learner.cls) === 'preprimary'
                      ? "An excellent early childhood foundation. We encourage parents to continue nurturing curiosity and practice at home."
                      : "An encouraging performance sheet. Work for even higher results in mock exams next term."
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 items-end relative">
                  <span>Head Teacher Initials: <b>{isBlankReportMode ? '' : (report.commentRec.headInitials || '-')}</b></span>
                  <span className="relative flex flex-col items-center">
                    {headSignature ? (
                      <div className="absolute bottom-1 right-2 w-28 h-8 pointer-events-none flex items-center justify-center z-10">
                        <img src={headSignature} alt="Head Teacher Signature" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                    ) : null}
                    <span className="text-slate-400">Signature: __________________________</span>
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-4 text-[10px] text-slate-600 font-bold uppercase">
            <div>Next Term Begins: <span contentEditable suppressContentEditableWarning className="text-slate-900 border-b border-slate-300 px-2 font-black outline-none">{isBlankReportMode ? '' : (report.commentRec.nextTermBegins || settings.nextTermBegins || '-')}</span></div>
            <div className="text-right">Generated At: <span className="text-slate-900 font-mono">{new Date().toLocaleDateString()}</span></div>
          </div>
        </div>
      </div>
    );
  };

  // Template-based rendering — delegates to alternate templates if selected
  const renderTemplatedSheet = (learner: Learner, examSet: ExamSet) => {
    const sectionKey = sectionKeyOfClass(learner.cls);
    const isNursery = sectionKey === 'preprimary';
    const templateNum = isNursery
      ? (data.settings.nurseryReportTemplate || 1)
      : (data.settings.primaryReportTemplate || 1);

    // Template 0 = original/legacy renderSheet
    if (templateNum === 0) {
      return renderSheet(learner, examSet);
    }

    // Build props for the new templates
    const report = computeSingleReportData(learner, examSet);
    const tProps: TemplateProps = {
      learner,
      examSet,
      report,
      settings: data.settings,
      sectionKey,
      draftMode,
      isBlankReportMode,
      teacherSignature,
      headSignature,
      schoolStamp
    };

    if (isNursery) {
      if (templateNum === 5) return <NurseryTemplate5 {...tProps} />;
      if (templateNum === 4) return <NurseryTemplate4 {...tProps} />;
      if (templateNum === 3) return <NurseryTemplate3 {...tProps} />;
      if (templateNum === 2) return <NurseryTemplate2 {...tProps} />;
      return <NurseryTemplate1 {...tProps} />;
    } else {
      if (templateNum === 5) return <PrimaryTemplate5 {...tProps} />;
      if (templateNum === 4) return <PrimaryTemplate4 {...tProps} />;
      if (templateNum === 3) return <PrimaryTemplate3 {...tProps} />;
      if (templateNum === 2) return <PrimaryTemplate2 {...tProps} />;
      return <PrimaryTemplate1 {...tProps} />;
    }
  };

  return (
    <>
      <div className={`space-y-8 animate-in fade-in duration-200 print:bg-white print:p-0 ${isPrintOverlayActive ? 'print:hidden' : ''}`}>
      {/* Selector and Options (Hidden when printing) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs print:hidden space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950 tracking-tight">Report Card Hub</h2>
            <p className="text-slate-500 text-xs mt-1">
              Generate, preview, and batch-print high-fidelity student report sheets conforming to Uganda PLE standards.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-700 border border-emerald-500/15 text-[10px] font-bold rounded-lg uppercase tracking-wider">Validated Templates</span>
            <span className="px-2.5 py-1 bg-blue-500/10 text-blue-700 border border-blue-500/15 text-[10px] font-bold rounded-lg uppercase tracking-wider">UNEB PLE Ready</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Select Class Stream</label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
            >
              {ALL_CLASSES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Select Exam Paper Set</label>
              <button
                type="button"
                onClick={() => setShowQuickAddExam(true)}
                className="text-[10px] font-black text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider cursor-pointer"
              >
                + Quick Add Set
              </button>
            </div>
            <select
              value={selectedExamSet}
              onChange={e => setSelectedExamSet(e.target.value)}
              disabled={classExamSets.length === 0}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white disabled:opacity-50"
            >
              {classExamSets.map(s => (
                <option key={s.id} value={s.id}>{s.term} — Set {s.setNo} {s.period} ({s.label})</option>
              ))}
              {classExamSets.length === 0 && <option value="">No exam sets available</option>}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Choose Layout Mode</label>
            <div className="grid grid-cols-2 gap-3 mt-0.5">
              <button
                type="button"
                onClick={() => setBatchMode(false)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  !batchMode 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/10' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Single Student
              </button>
              <button
                type="button"
                onClick={() => setBatchMode(true)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  batchMode 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/10' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Batch Stream ({classLearners.length})
              </button>
            </div>
          </div>
        </div>

        {/* Draft Mode Quick Switcher */}
        <div className="p-4 bg-rose-500/[0.03] border border-rose-500/10 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-lg">✍️</span>
            <div>
              <span className="text-xs font-black text-slate-900 block">Draft Report Card Watermark</span>
              <span className="text-[10px] font-bold text-slate-500 block">Mark reports as drafts with rotating badges and backdrop watermarks</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDraftMode(!draftMode)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              draftMode 
                ? 'bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-600/10' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {draftMode ? 'Draft Mode: ON' : 'Draft Mode: OFF'}
          </button>
        </div>

        {/* School Seal & Signatures Manager */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-base">🛡️</span>
            <div>
              <span className="text-xs font-black text-slate-900 block font-sans">School Official Seal &amp; Signatures</span>
              <span className="text-[10px] font-bold text-slate-500 block">Manage digital signatures and official school stamp for authentic report cards.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Slot 1: Class Teacher Signature */}
            <div className="bg-white border border-slate-200/60 rounded-xl p-3 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Class Teacher's Signature</span>
                {teacherSignature && (
                  <button
                    type="button"
                    onClick={() => clearSlot('teacher')}
                    className="text-[9px] text-rose-600 hover:text-rose-700 font-extrabold flex items-center gap-0.5 cursor-pointer"
                  >
                    <Trash2 size={10} /> Clear
                  </button>
                )}
              </div>

              {teacherSignature ? (
                <div className="h-16 border border-slate-100 rounded-lg bg-slate-50 flex items-center justify-center p-2 relative overflow-hidden group">
                  <img src={teacherSignature} alt="Teacher Signature" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <div className="h-16 border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 text-center p-2 gap-1.5 bg-slate-50/50">
                  <span className="text-[10px] font-semibold">No signature loaded</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => startCamera('teacher')}
                      className="px-2 py-1 bg-white hover:bg-slate-100 text-[10px] text-blue-600 font-bold border border-slate-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Camera size={10} /> Camera
                    </button>
                    <label className="px-2 py-1 bg-white hover:bg-slate-100 text-[10px] text-slate-600 font-bold border border-slate-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer">
                      <Upload size={10} /> File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleFileUpload(e, 'teacher')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Slot 2: Head Teacher Signature */}
            <div className="bg-white border border-slate-200/60 rounded-xl p-3 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Head Teacher's Signature</span>
                {headSignature && (
                  <button
                    type="button"
                    onClick={() => clearSlot('head')}
                    className="text-[9px] text-rose-600 hover:text-rose-700 font-extrabold flex items-center gap-0.5 cursor-pointer"
                  >
                    <Trash2 size={10} /> Clear
                  </button>
                )}
              </div>

              {headSignature ? (
                <div className="h-16 border border-slate-100 rounded-lg bg-slate-50 flex items-center justify-center p-2 relative overflow-hidden group">
                  <img src={headSignature} alt="Head Teacher Signature" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <div className="h-16 border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 text-center p-2 gap-1.5 bg-slate-50/50">
                  <span className="text-[10px] font-semibold">No signature loaded</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => startCamera('head')}
                      className="px-2 py-1 bg-white hover:bg-slate-100 text-[10px] text-blue-600 font-bold border border-slate-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Camera size={10} /> Camera
                    </button>
                    <label className="px-2 py-1 bg-white hover:bg-slate-100 text-[10px] text-slate-600 font-bold border border-slate-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer">
                      <Upload size={10} /> File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleFileUpload(e, 'head')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Slot 3: School Official Stamp */}
            <div className="bg-white border border-slate-200/60 rounded-xl p-3 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">School Official Stamp</span>
                {schoolStamp && (
                  <button
                    type="button"
                    onClick={() => clearSlot('stamp')}
                    className="text-[9px] text-rose-600 hover:text-rose-700 font-extrabold flex items-center gap-0.5 cursor-pointer"
                  >
                    <Trash2 size={10} /> Clear
                  </button>
                )}
              </div>

              {schoolStamp ? (
                <div className="h-16 border border-slate-100 rounded-lg bg-slate-50 flex items-center justify-center p-2 relative overflow-hidden group">
                  <img src={schoolStamp} alt="School Official Stamp" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <div className="h-16 border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 text-center p-2 gap-1.5 bg-slate-50/50">
                  <span className="text-[10px] font-semibold">No stamp loaded</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => startCamera('stamp')}
                      className="px-2 py-1 bg-white hover:bg-slate-100 text-[10px] text-blue-600 font-bold border border-slate-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Camera size={10} /> Camera
                    </button>
                    <label className="px-2 py-1 bg-white hover:bg-slate-100 text-[10px] text-slate-600 font-bold border border-slate-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer">
                      <Upload size={10} /> File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleFileUpload(e, 'stamp')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Student selector if single mode */}
        {!batchMode && (
          <div>
            <div className="flex items-center gap-4 mb-1.5">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Choose Student File</label>
              <input
                type="text"
                placeholder="🔍 Filter student..."
                value={learnerSearch}
                onChange={e => {
                  setLearnerSearch(e.target.value);
                  const val = e.target.value.toLowerCase();
                  const matches = classLearners.filter(l => 
                    l.name.toLowerCase().includes(val) || 
                    (l.admNo && l.admNo.toLowerCase().includes(val))
                  );
                  if (matches.length > 0) {
                    setSelectedLearner(matches[0].id);
                  }
                }}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden"
              />
            </div>
            <select
              value={selectedLearner}
              onChange={e => setSelectedLearner(e.target.value)}
              disabled={classLearners.length === 0}
              className="w-full md:w-1/3 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white disabled:opacity-50"
            >
              {classLearners
                .filter(l => 
                  l.name.toLowerCase().includes(learnerSearch.toLowerCase()) || 
                  (l.admNo && l.admNo.toLowerCase().includes(learnerSearch.toLowerCase()))
                )
                .map(l => (
                  <option key={l.id} value={l.id}>{l.name} {l.admNo ? `(${l.admNo})` : ''}</option>
                ))}
              {classLearners.length > 0 && classLearners.filter(l => 
                l.name.toLowerCase().includes(learnerSearch.toLowerCase()) || 
                (l.admNo && l.admNo.toLowerCase().includes(learnerSearch.toLowerCase()))
              ).length === 0 && <option value="">No matching students</option>}
              {classLearners.length === 0 && <option value="">No students found</option>}
            </select>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
              <Sparkles size={16} className="text-slate-400" />
              <select 
                value={(selectedClass && sectionKeyOfClass(selectedClass) === 'preprimary') ? (data.settings.nurseryReportTemplate || 1) : (data.settings.primaryReportTemplate || 1)}
                onChange={(e) => {
                  const isPre = selectedClass && sectionKeyOfClass(selectedClass) === 'preprimary';
                  if (isPre) {
                    dataManager.updateSettings({ ...data.settings, nurseryReportTemplate: Number(e.target.value) });
                  } else {
                    dataManager.updateSettings({ ...data.settings, primaryReportTemplate: Number(e.target.value) });
                  }
                  window.dispatchEvent(new CustomEvent('otec-toast', {
                    detail: { message: 'Template updated successfully', type: 'success' }
                  }));
                }}
                className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                {(selectedClass && sectionKeyOfClass(selectedClass) === 'preprimary') ? (
                  <>
                    <option value={1}>Template 1 (Playful & Visual)</option>
                    <option value={2}>Template 2 (Minimalist)</option>
                    <option value={3}>Template 3 (Card Layout)</option>
                    <option value={4}>Template 4 (Bright Grid)</option>
                    <option value={5}>Template 5 (Storybook Minimal)</option>
                  </>
                ) : (
                  <>
                    <option value={1}>Template 1 (Classic Elegant)</option>
                    <option value={2}>Template 2 (Modern Corporate)</option>
                    <option value={3}>Template 3 (Compact Academic)</option>
                    <option value={4}>Template 4 (Modern Two-Column)</option>
                    <option value={5}>Template 5 (Premium Certificate)</option>
                  </>
                )}
              </select>
            </div>
            
            <button 
              onClick={handlePrint}
              disabled={classLearners.length === 0}
              className="flex-1 sm:flex-none min-w-[200px] flex items-center justify-center gap-2 py-3 px-6 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-md transition-colors disabled:opacity-50"
            >
              <Printer size={14} />
              <span>{batchMode ? 'Print Entire Class Batch' : 'Print Student Report'}</span>
            </button>
            <button 
              onClick={() => setIsBlankReportMode(!isBlankReportMode)}
              disabled={classLearners.length === 0}
              className={`flex-1 sm:flex-none min-w-[200px] flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold border shadow-sm transition-colors disabled:opacity-50 ${
                isBlankReportMode 
                  ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700' 
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              }`}
              title="Toggle to view and print reports with empty marks, grades, and remarks"
            >
              <FileText size={14} />
              <span>{isBlankReportMode ? 'Blank Report Mode Active (Toggle Off)' : 'Toggle Blank Report Mode'}</span>
            </button>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
          {!batchMode && (
            <button
              onClick={() => handleDownloadSinglePdf()}
              disabled={classExamSets.length === 0 || !selectedLearner || isGeneratingSinglePdf}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-emerald-600/15 disabled:opacity-50 cursor-pointer"
            >
              {isGeneratingSinglePdf ? (
                <Loader2 size={14} className="animate-spin text-white" />
              ) : (
                <Download size={14} />
              )}
              <span>Download PDF Report</span>
            </button>
          )}

          {!batchMode && (
            <button
              onClick={() => handleDownloadSingleHTML()}
              disabled={classExamSets.length === 0 || !selectedLearner}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <FileText size={14} className="text-slate-600" />
              <span>Download HTML</span>
            </button>
          )}

          <button
            onClick={() => setIsPrintOverlayActive(true)}
            disabled={classExamSets.length === 0 || (!batchMode && !selectedLearner)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-blue-600/15 disabled:opacity-50 cursor-pointer"
          >
            <FileSpreadsheet size={14} />
            <span>{batchMode ? 'Export Batch to PDF (Guided)' : 'Print Overlay Mode'}</span>
          </button>

          <button
            onClick={handleGenerateZip}
            disabled={classExamSets.length === 0 || classLearners.length === 0}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-indigo-600/15 disabled:opacity-50 cursor-pointer"
          >
            <FolderArchive size={14} />
            <span>Download All as ZIP (PDF)</span>
          </button>

          <button
            onClick={handleGoogleExport}
            disabled={classExamSets.length === 0 || (!batchMode && !selectedLearner) || gExporting}
            className="px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {gExporting ? (
              <Loader2 size={14} className="animate-spin text-blue-600" />
            ) : (
              <CloudUpload size={14} className="text-blue-600" />
            )}
            <span>{batchMode ? 'Sync Batch to Google Drive' : 'Sync to Google Drive'}</span>
          </button>
        </div>

        {gSuccessMessage && (
          <div className="p-3.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            <span>{gSuccessMessage}</span>
          </div>
        )}

        {gErrorMessage && (
          <div className="p-3.5 bg-red-50 text-red-600 border border-red-100 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in">
            <span>⚠️</span>
            <span>{gErrorMessage}</span>
          </div>
        )}
      </div>

      {/* PDF / Print Stage */}
      <div id="printArea" className="p-4 bg-slate-100 rounded-2xl min-h-[500px] flex flex-col justify-center print:bg-white print:p-0">
        {classExamSets.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-3xs flex flex-col items-center justify-center space-y-5 px-6 print:hidden">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <ClipboardList size={26} className="stroke-[1.5]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[9px] font-black">
                +
              </div>
            </div>
            <div className="max-w-md space-y-1.5">
              <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider font-sans">No Academic Papers Found</h3>
              <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                OTEC Academy has no assessment exam papers defined for class stream {selectedClass} this term. Report cards cannot be generated without an exam set containing registered scores.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('otec-route-change', { detail: 'scores' }))}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ClipboardList size={12} />
              <span>Configure Exam Sets</span>
            </button>
          </div>
        ) : batchMode ? (
          classLearners.length > 0 ? (
            <div className="w-full space-y-12">
              {classLearners.map(learner => renderTemplatedSheet(learner, activeExamSet!))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-3xs flex flex-col items-center justify-center space-y-5 px-6 print:hidden">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Users size={26} className="stroke-[1.5]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white text-[9px] font-black">
                  !
                </div>
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider font-sans">No Learners in Stream</h3>
                <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                  No registered student accounts exist in class stream {selectedClass}. Please register some pupils first.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('otec-route-change', { detail: 'learners' }))}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Users size={12} />
                  <span>Go to Learner Registry</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('otec-route-change', { detail: 'data' }))}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-xl shadow-3xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FileSpreadsheet size={12} className="text-emerald-600" />
                  <span>Import Excel Roster</span>
                </button>
              </div>
            </div>
          )
        ) : activeLearner && activeExamSet ? (
          renderTemplatedSheet(activeLearner, activeExamSet)
        ) : (
          <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-3xs flex flex-col items-center justify-center space-y-4 px-6 print:hidden">
            <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400">
              <FileText size={22} className="stroke-[1.5]" />
            </div>
            <div className="max-w-xs space-y-1.5">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider font-sans">Reports Preview Ready</h3>
              <p className="text-[10.5px] text-slate-400 font-bold leading-relaxed">
                Choose an individual student and assessment set from the top filter bar to instantly render their academic report template.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* PDF Export Helper Modal */}
      {showPdfGuide && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in print:hidden">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
                <FileSpreadsheet size={20} className="text-blue-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-950">High-Fidelity PDF Bulk Export</h3>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mt-0.5">
                  Uganda Ministry Guidelines Alignment
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-left">
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                To guarantee the most professional, pixel-perfect, and high-fidelity PDF print outputs for all report cards, please ensure these standard print options are set in the browser dialog:
              </p>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/50 rounded-xl text-xs font-semibold">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-black text-blue-800">1</span>
                  <div>
                    <span className="text-slate-800 font-black block">Destination / Printer</span>
                    <span className="text-slate-500 font-medium">Select <strong className="text-blue-700">Save as PDF</strong> or <strong className="text-blue-700">Microsoft Print to PDF</strong> in the dropdown menu.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/50 rounded-xl text-xs font-semibold">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-black text-blue-800">2</span>
                  <div>
                    <span className="text-slate-800 font-black block">Compulsory Layout Orientation</span>
                    <span className="text-slate-500 font-medium">Select <strong className="text-blue-700">Portrait</strong> orientation for clean vertically aligned tables.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/50 rounded-xl text-xs font-semibold">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-black text-blue-800">3</span>
                  <div>
                    <span className="text-slate-800 font-black block">Compulsory Option: "Background Graphics"</span>
                    <span className="text-slate-500 font-medium">Check the box for <strong className="text-blue-700">Background graphics</strong> (under More Settings). This is required to render table shading, marks grading badges, and custom gauges!</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/50 rounded-xl text-xs font-semibold">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-black text-blue-800">4</span>
                  <div>
                    <span className="text-slate-800 font-black block">Compulsory Option: "Headers & Footers"</span>
                    <span className="text-slate-500 font-medium">Uncheck the box for <strong className="text-blue-700">Headers and footers</strong> to remove unwanted date, URL, or raw page title labels from report card margins.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowPdfGuide(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl transition-all cursor-pointer"
              >
                Close Guide
              </button>
              <button
                onClick={() => {
                  setShowPdfGuide(false);
                  setTimeout(() => handlePrint(), 300);
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={13} />
                <span>Launch PDF Export Engine</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* High-Fidelity Print-Friendly Overlay */}
      {isPrintOverlayActive && (
        <div className="print-overlay-container fixed inset-0 bg-slate-950/98 z-[9999] overflow-y-auto flex flex-col items-center print:absolute print:inset-auto print:p-0 print:bg-white print:overflow-visible print:block print:w-full print:h-auto select-text">
          {/* Interactive Top Control Bar Dashboard (Hidden on paper) */}
          <div className="sticky top-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 z-[10000] w-full print:hidden">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                  <Printer size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    Uganda Ministry Report Cards PDF Console
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[9px] font-black uppercase rounded">BULK ENGINE</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    Selected Stream: <strong className="text-slate-200">{selectedClass}</strong> • Preparing <strong className="text-blue-400">{batchMode ? classLearners.length : 1} report card{batchMode && classLearners.length > 1 ? 's' : ''}</strong>
                  </p>
                </div>
              </div>

              {/* Checklist & Controls */}
              <div className="flex items-center gap-4 flex-wrap">
                {/* Visual Checklist */}
                <div className="hidden lg:flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-300">
                  <span className="text-slate-500">PRINTER CHECKLIST:</span>
                  <label className="flex items-center gap-1 cursor-pointer hover:text-white">
                    <input type="checkbox" defaultChecked className="accent-blue-500 rounded text-slate-900" />
                    <span>Portrait Layout</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer hover:text-white">
                    <input type="checkbox" defaultChecked className="accent-blue-500 rounded text-slate-900" />
                    <span>Background Graphics: ON</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer hover:text-white">
                    <input type="checkbox" defaultChecked className="accent-blue-500 rounded text-slate-900" />
                    <span>Margins: None</span>
                  </label>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsPrintOverlayActive(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Exit Console
                  </button>
                  <button
                    onClick={triggerBrowserPrint}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={13} />
                    <span>Print / Export PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Printer Guide Banner (Hidden on paper) */}
          <div className="w-full max-w-4xl p-6 print:hidden mt-6">
            <div className="bg-gradient-to-r from-blue-900/30 to-slate-900/30 border border-blue-500/20 rounded-2xl p-5 flex gap-4 items-start">
              <span className="text-2xl mt-0.5">ℹ️</span>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-blue-300 uppercase tracking-wider">How to Save as PDF in High Fidelity</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                  When the print dialog opens, set the <strong className="text-white">Destination</strong> to <strong className="text-emerald-400">Save as PDF</strong>.
                  Expand <strong className="text-white">More Settings</strong> and ensure <strong className="text-emerald-400">Background graphics is enabled</strong> and <strong className="text-emerald-400">Headers and footers is disabled</strong> to produce beautiful, borderless report booklets.
                </p>
              </div>
            </div>
          </div>

          {/* Live Printable Report Sheet Previews (Visible on print, custom styled on screen) */}
          <div className="w-full py-4 px-6 flex flex-col items-center gap-12 print:block print:p-0 print:m-0 print:bg-white print:overflow-visible">
            {batchMode ? (
              classLearners.map(learner => (
                <div key={learner.id} className="print:m-0 print:p-0 print:shadow-none print:border-none">
                  {renderTemplatedSheet(learner, activeExamSet!)}
                </div>
              ))
            ) : (
              activeLearner && activeExamSet && (
                <div className="print:m-0 print:p-0 print:shadow-none print:border-none">
                  {renderTemplatedSheet(activeLearner, activeExamSet)}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Quick Add Exam Set Modal */}
      {showQuickAddExam && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in print:hidden">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <span className="text-xl">📝</span>
              <div>
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider font-sans">Quick Add Exam Paper Set</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Activate a new assessment paper</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Academic Term</label>
                <select
                  value={quickExamTerm}
                  onChange={e => setQuickExamTerm(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                >
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Assessment Period</label>
                <select
                  value={quickExamPeriod}
                  onChange={e => {
                    setQuickExamPeriod(e.target.value as 'BOT' | 'MOT' | 'EOT');
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                >
                  <option value="BOT">Beginning of Term (BOT)</option>
                  <option value="MOT">Mid Term (MOT)</option>
                  <option value="EOT">End of Term (EOT)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Display Label</label>
                <input
                  type="text"
                  value={quickExamLabel}
                  onChange={e => setQuickExamLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                  placeholder="e.g. End of Term Assessments"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Set Number / Weight Index</label>
                <input
                  type="number"
                  value={quickExamSetNo}
                  onChange={e => setQuickExamSetNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                  min="1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowQuickAddExam(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!quickExamLabel.trim()) {
                    alert('Please enter a display label.');
                    return;
                  }
                  const id = 'set-' + Math.random().toString(36).slice(2, 9);
                  const newSet: ExamSet = {
                    id,
                    label: quickExamLabel,
                    term: quickExamTerm,
                    period: quickExamPeriod,
                    setNo: Number(quickExamSetNo) || 1,
                    classes: [...ALL_CLASSES]
                  };

                  const updatedSettings = {
                    ...data.settings,
                    examSets: [...data.settings.examSets, newSet]
                  };

                  dataManager.updateSettings(updatedSettings);
                  
                  setSelectedExamSet(id);
                  setShowQuickAddExam(false);

                  window.dispatchEvent(new CustomEvent('otec-toast', {
                    detail: {
                      message: `New Exam Set "${quickExamTerm} — ${quickExamLabel}" successfully registered!`,
                      type: 'success'
                    }
                  }));
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                Create Set
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ZIP progress overlay */}
      {zipProgress && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-[10000] print:hidden animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl text-center space-y-4 animate-scale-up">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider font-sans">Generating Bulk ZIP Package</h3>
              <p className="text-[11px] text-slate-500 font-semibold">
                Processing and compiling individual high-fidelity PDF report cards...
              </p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-2 text-left">
              <div className="flex justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                <span>Student: <strong className="text-blue-600 font-black">{zipProgress.studentName}</strong></span>
                <span className="font-mono text-slate-500">{zipProgress.current} / {zipProgress.total}</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-300 rounded-full" 
                  style={{ width: `${(zipProgress.current / zipProgress.total) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Please do not close or reload this page. This process generates precise digital copies.
            </p>
          </div>
        </div>
      )}

      {/* Hidden offscreen container for high-fidelity PDF generation */}
      <div 
        style={{ 
          position: 'fixed', 
          left: '0px', 
          top: '0px', 
          width: '800px', 
          height: 'auto', 
          opacity: 0.01,
          pointerEvents: 'none',
          zIndex: -9999
        }}
        className="bg-slate-100 p-0 m-0"
      >
        {classExamSets.length > 0 && activeExamSet && classLearners.map(learner => (
          <div key={`pdf-hidden-${learner.id}`} id={`pdf-hidden-${learner.id}`} className="bg-white p-4">
            {renderTemplatedSheet(learner, activeExamSet)}
          </div>
        ))}
      </div>

      {/* Camera Capture Modal */}
      {activeCameraSlot && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-[10000] print:hidden animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-up relative">
            <button
              type="button"
              onClick={stopCamera}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="text-center">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-sans">
                Capture {activeCameraSlot === 'teacher' ? "Teacher Signature" : activeCameraSlot === 'head' ? "Head Teacher Signature" : "Official School Stamp"}
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Align the document or written mark in the camera frame below.
              </p>
            </div>

            <div className="relative aspect-video w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
              {cameraLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 size={24} className="animate-spin text-blue-500" />
                  <span className="text-xs font-semibold">Initializing Camera...</span>
                </div>
              )}
              {cameraError ? (
                <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center text-rose-500 gap-2">
                  <span className="text-lg">⚠️</span>
                  <span className="text-xs font-bold">{cameraError}</span>
                  <button
                    type="button"
                    onClick={() => startCamera(activeCameraSlot)}
                    className="mt-2 px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold transition-colors"
                  >
                    Retry Access
                  </button>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={captureSnapshot}
                disabled={cameraLoading || !!cameraError}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/10 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Camera size={14} />
                <span>Capture Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
